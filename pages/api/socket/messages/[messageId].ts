import { currentProfilePages } from '@/lib/current-profile-pages';
import { db } from '@/lib/db';
import type { NextApiResponseServerIo } from '@/types';
import { MemberRole } from '@prisma/client';
import type { NextApiRequest } from 'next';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponseServerIo
): Promise<void> {
	if (req.method !== 'DELETE' && req.method !== 'PATCH') {
		res.status(405).json({ error: 'Method not allowed' });
		return;
	}

	try {
		const profile = await currentProfilePages(req);
		const { messageId, serverId, channelId } = req.query;
		const { content } = req.body;

		if (!profile) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		if (!serverId) {
			res.status(400).json({ error: 'Server ID missing' });
			return;
		}

		if (!channelId) {
			res.status(400).json({ error: 'Channel ID missing' });
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
			res.status(404).json({ error: 'Server not found' });
			return;
		}

		const channel = await db.channel.findFirst({
			where: {
				id: channelId as string,
				serverId: serverId as string
			}
		});

		if (!channel) {
			res.status(404).json({ error: 'Channel not found' });
			return;
		}

		const member = server.members.find(
			member => member.profileId === profile.id
		);

		if (!member) {
			res.status(404).json({ error: 'Member not found' });
			return;
		}

		let message = await db.message.findFirst({
			where: {
				id: messageId as string,
				channelId: channelId as string
			},
			include: {
				member: {
					include: {
						profile: true
					}
				}
			}
		});

		if (!message || message.deleted) {
			res.status(404).json({ error: 'Message not found' });
			return;
		}

		const isMessageOwner = message.memberId === member.id;
		const isAdmin = member.role === MemberRole.ADMIN;
		const isModerator = member.role === MemberRole.MODERATOR;
		const canModify = isMessageOwner || isAdmin || isModerator;

		if (!canModify) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		if (req.method === 'DELETE') {
			message = await db.message.update({
				where: {
					id: messageId as string
				},
				data: {
					fileUrl: null,
					content: 'This message has been deleted',
					deleted: true
				},
				include: {
					member: {
						include: {
							profile: true
						}
					}
				}
			});
		}

		if (req.method === 'PATCH') {
			if (!isMessageOwner) {
				res.status(401).json({ error: 'Unauthorized' });
				return;
			}

			message = await db.message.update({
				where: {
					id: messageId as string
				},
				data: {
					content
				},
				include: {
					member: {
						include: {
							profile: true
						}
					}
				}
			});
		}

		const updateKey = `chat:${channelId}:messages:update`;

		res?.socket?.server?.io?.emit(updateKey, message);

		res.status(200).json(message);
	} catch (error) {
		console.log('[MESSAGE_ID]', error);
		res.status(500).json({ error: 'Internal Error' });
	}
}
