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
		const { directMessageId, conversationId } = req.query;
		const { content } = req.body;

		if (!profile) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		if (!conversationId) {
			res.status(400).json({ error: 'Conversation ID missing' });
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
			res.status(404).json({ error: 'Conversation not found' });
			return;
		}

		const member =
			conversation.memberOne.profileId === profile.id
				? conversation.memberOne
				: conversation.memberTwo;

		if (!member) {
			res.status(404).json({ error: 'Member not found' });
			return;
		}

		let directMessage = await db.directMessage.findFirst({
			where: {
				id: directMessageId as string,
				conversationId: conversationId as string
			},
			include: {
				member: {
					include: {
						profile: true
					}
				}
			}
		});

		if (!directMessage || directMessage.deleted) {
			res.status(404).json({ error: 'Message not found' });
			return;
		}

		const isMessageOwner = directMessage.memberId === member.id;
		const isAdmin = member.role === MemberRole.ADMIN;
		const isModerator = member.role === MemberRole.MODERATOR;
		const canModify = isMessageOwner || isAdmin || isModerator;

		if (!canModify) {
			res.status(401).json({ error: 'Unauthorized' });
			return;
		}

		if (req.method === 'DELETE') {
			directMessage = await db.directMessage.update({
				where: {
					id: directMessageId as string
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

			directMessage = await db.directMessage.update({
				where: {
					id: directMessageId as string
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

		const updateKey = `chat:${conversationId}:messages:update`;

		res?.socket?.server?.io?.emit(updateKey, directMessage);

		res.status(200).json(directMessage);
	} catch (error) {
		console.log('[DIRECT_MESSAGE_ID]', error);
		res.status(500).json({ error: 'Internal Error' });
	}
}
