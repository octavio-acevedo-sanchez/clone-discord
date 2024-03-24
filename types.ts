import type { Member, Profile, Server } from '@prisma/client';

export type ServerWithMembersWithProfiles = Server & {
	members: Array<Member & { profile: Profile }>;
};
