import { currentProfilePages } from '@/lib/current-profile-pages';
import { db } from '@/lib/db';
import type { NextApiResponseServerIo } from '@/types';
import type { NextApiRequest } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponseServerIo
): Promise<void> {
	if (req.method !== 'POST') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}

	try {
		const profile = await currentProfilePages(req);
		const { content, fileUrl } = req.body;
		const { serverId, channelId } = req.query;

		if (!profile) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		if (!serverId) {
			res.status(401).json({ error: 'Server ID missing' });
			return;
		}

		if (!channelId) {
			res.status(401).json({ error: 'Channel ID missing' });
			return;
		}

		if (!content) {
			res.status(401).json({ error: 'Content missing' });
			return;
		}

		const server = await db.server.findFirst({
			where: {
				id: serverId as string,
				members: {
					some: {
						profileId: profile.id
					}
				}
			},
			include: {
				members: true
			}
		});

		if (!server) {
			res.status(404).json({ message: 'Server not found' });
			return;
		}

		const channel = await db.channel.findFirst({
			where: {
				id: channelId as string,
				serverId: serverId as string
			}
		});

		if (!channel) {
			res.status(404).json({ message: 'Channel not found' });
			return;
		}

		const member = server?.members.find(
			member => member.profileId === profile.id
		);

		if (!member) {
			res.status(404).json({ message: 'Member not found' });
			return;
		}

		const message = await db.message.create({
			data: {
				content,
				fileUrl,
				channelId: channelId as string,
				memberId: member.id
			},
			include: {
				member: {
					include: {
						profile: true
					}
				}
			}
		});

		const channelKey = `chat:${channelId}:messages`;

		res?.socket?.server?.io?.emit(channelKey, message);

		res.status(200).json(message);
	} catch (error) {
		console.log('[MESSSAGES_POST]', error);
		res.status(500).json({ message: 'Internal Error' });
	}
}
