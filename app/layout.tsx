import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import './globals.css';

const font = Open_Sans({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Team Chat Application',
	description: 'Generated by create next app'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>): React.ReactNode {
	return (
		<html lang='en'>
			<body className={font.className}>{children}</body>
		</html>
	);
}
