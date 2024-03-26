import { currentProfile } from '@/lib/current-profile';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const serverSchema = z.object({
	name: z.string().min(10).max(100),
	imageUrl: z.string().url()
});

export async function PATCH(
	req: Request,
	{ params }: { params: { serverId: string } }
): Promise<NextResponse> {
	try {
		const profile = await currentProfile();
		const body = await req.json();

		const result = serverSchema.safeParse(body);
		if (!result.success) {
			return NextResponse.json(result.error);
		}

		const { name, imageUrl } = body;
		if (!profile) {
			return new NextResponse('Unauthorized', { status: 401 });
		}

		const server = await db.server.update({
			where: {
				id: params.serverId,
				profileId: profile.id
			},
			data: {
				name,
				imageUrl
			}
		});

		return NextResponse.json(server);
	} catch (error) {
		console.log('[SERVER_ID_PATCH', error);
		return new NextResponse('Internal Error', { status: 500 });
	}
}
