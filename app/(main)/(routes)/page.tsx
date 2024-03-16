import { UserButton } from '@clerk/nextjs';

export default function Home(): React.ReactNode {
	return (
		<div>
			This is a protected route <UserButton afterSignOutUrl='/' />
		</div>
	);
}
