'use client';

import qs from 'query-string';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Video, VideoOff } from 'lucide-react';

import { ActionTooltip } from '@/components/action-tooltip';

import React from 'react';

export const ChatVideoButton = (): React.ReactNode => {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	const isVideo = searchParams?.get('video');

	const onClick = (): void => {
		const url = qs.stringifyUrl(
			{
				url: pathname ?? '',
				query: {
					video: isVideo ? undefined : true
				}
			},
			{ skipNull: true }
		);

		router.push(url);
	};

	const Icon = isVideo ? VideoOff : Video;
	const tooltipLabel = isVideo ? 'End Video call' : 'Start video call';

	return (
		<ActionTooltip side='bottom' label={tooltipLabel}>
			<button onClick={onClick} className='hover:opacity-75 transition mr-4'>
				<Icon className='h-6 w-6 text-zinc-500 dark:text-zinc-400' />
			</button>
		</ActionTooltip>
	);
};
