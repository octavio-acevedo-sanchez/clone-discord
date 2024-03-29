import qs from 'query-string';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useSocket } from '@/components/providers/socket-provider';

interface ChatQueryProps {
	queryKey: string;
	apiUrl: string;
	paramKey: 'channelId' | 'conversationId';
	paramValue: string;
}

export const useChatQuery = ({
	queryKey,
	apiUrl,
	paramKey,
	paramValue
}: ChatQueryProps): any => {
	const { isConnected } = useSocket();

	const fetchMessages = async ({ pageParam = undefined }): Promise<void> => {
		const url = qs.stringifyUrl(
			{
				url: apiUrl,
				query: {
					cursor: pageParam,
					[paramKey]: paramValue
				}
			},
			{ skipNull: true }
		);

		const res = await fetch(url);
		return await res.json();
	};

	const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
		useInfiniteQuery({
			queryKey: [queryKey],
			queryFn: fetchMessages,
			initialPageParam: undefined,
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			/* @ts-expect-error */
			getNextPageParam: lastPage => lastPage.nextCursor,
			refetchInterval: isConnected ? false : 1000
		});

	return {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		status
	};
};
