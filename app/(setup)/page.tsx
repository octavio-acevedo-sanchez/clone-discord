import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { initialProfile } from '@/lib/initial-profile';
import { Initialmodal } from '@/components/modals/initial-modal';

const SetupPage = async (): Promise<JSX.Element> => {
	const profile = await initialProfile();

	const server = await db.server.findFirst({
		where: {
			members: {
				some: {
					profileId: profile.id
				}
			}
		}
	});

	if (server) {
		return redirect(`/servers/${server.id}`);
	}

	return <Initialmodal />;
};

export default SetupPage;
