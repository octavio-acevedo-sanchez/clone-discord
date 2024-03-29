import { db } from '@/lib/db';
import type { ConversationWithMembersWithProfiles } from '@/types';

export const getOrCreateConversation = async (
	memberOneId: string,
	memberTwoId: string
): Promise<ConversationWithMembersWithProfiles | null> => {
	let conversation =
		(await findConversation(memberOneId, memberTwoId)) ||
		(await findConversation(memberTwoId, memberOneId));

	if (!conversation) {
		conversation = await createNewConversation(memberOneId, memberTwoId);
	}

	return conversation;
};

const findConversation = async (
	memberOneId: string,
	memberTwoId: string
): Promise<ConversationWithMembersWithProfiles | null> => {
	try {
		const conversation = await db.conversation.findFirst({
			where: {
				AND: [{ memberOneId }, { memberTwoId }]
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

		return conversation;
	} catch (error) {
		return null;
	}
};

const createNewConversation = async (
	memberOneId: string,
	memberTwoId: string
): Promise<ConversationWithMembersWithProfiles | null> => {
	try {
		const conversation = await db.conversation.create({
			data: {
				memberOneId,
				memberTwoId
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

		return conversation;
	} catch (error) {
		return null;
	}
};
