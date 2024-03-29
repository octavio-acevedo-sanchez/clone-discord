import type { Conversation, Member, Profile, Server } from '@prisma/client';

export type ServerWithMembersWithProfiles = Server & {
	members: Array<Member & { profile: Profile }>;
};

export type ConversationWithMembersWithProfiles = Conversation & {
	memberOne: Member & { profile: Profile };
	memberTwo: Member & { profile: Profile };
};
