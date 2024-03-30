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
		const { conversationId } = req.query;

		if (!profile) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		if (!conversationId) {
			res.status(401).json({ error: 'Conversation ID missing' });
			return;
		}

		if (!content) {
			res.status(401).json({ error: 'Content missing' });
			return;
		}

		const conversation = await db.conversation.findFirst({
			where: {
				id: conversationId as string,
				OR: [
					{
						memberOne: {
							profileId: profile.id
						}
					},
					{
						memberTwo: {
							profileId: profile.id
						}
					}
				]
			},
			include: {
				memberOne: {
					include: {
						profile: true
					}
				},
				memberTwo: {
					include: {
						profile: true
					}
				}
			}
		});

		if (!conversation) {
			res.status(404).json({ message: 'Conversation not found' });
			return;
		}

		const member =
			conversation.memberOne.profileId === profile.id
				? conversation.memberOne
				: conversation.memberTwo;

		if (!member) {
			res.status(404).json({ message: 'Member not found' });
			return;
		}

		const message = await db.directMessage.create({
			data: {
				content,
				fileUrl,
				conversationId: conversationId as string,
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

		const channelKey = `chat:${conversationId}:messages`;

		res?.socket?.server?.io?.emit(channelKey, message);

		res.status(200).json(message);
	} catch (error) {
		console.log('[DIRECT_MESSSAGES_POST]', error);
		res.status(500).json({ message: 'Internal Error' });
	}
}
