import { getAuth } from '@clerk/nextjs/server';

import { db } from '@/lib/db';
import type { Profile } from '@prisma/client';
import type { NextApiRequest } from 'next';

export const currentProfilePages = async (
	req: NextApiRequest
): Promise<Profile | null> => {
	const { userId } = getAuth(req);

	if (!userId) {
		return null;
	}

	const profile = await db.profile.findUnique({
		where: {
			userId
		}
	});

	return profile;
};
