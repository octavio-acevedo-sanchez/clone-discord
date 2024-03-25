import { v4 as uuidv4 } from 'uuid';

import { z } from 'zod';
import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { MemberRole } from '@prisma/client';

const serverSchema = z.object({
	name: z.string().min(10).max(100),
	imageUrl: z.string().url()
});

export async function POST(req: Request): Promise<NextResponse> {
	try {
		const body = await req.json();

		const result = serverSchema.safeParse(body);
		if (!result.success) {
			return NextResponse.json(result.error);
		}

		const { name, imageUrl } = body;
		const profile = await currentProfile();

		if (!profile) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		const server = await db.server.create({
			data: {
				profileId: profile.id,
				name,
				imageUrl,
				inviteCode: uuidv4(),
				channels: {
					create: [
						{
							name: 'general',
							profileId: profile.id
						}
					]
				},
				members: {
					create: [
						{
							profileId: profile.id,
							role: MemberRole.ADMIN
						}
					]
				}
			}
		});

		return NextResponse.json(server);
	} catch (error) {
		console.log('[SERVERS_POST]', error);
		return new NextResponse('Internal Error', { status: 500 });
	}
}
