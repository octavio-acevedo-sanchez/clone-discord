import { useEffect, useState } from 'react';

interface ChatScrollProps {
	chatRef: React.RefObject<HTMLDivElement>;
	bottomRef: React.RefObject<HTMLDivElement>;
	shouldLoadMore: boolean;
	loadMore: () => void;
	count: number;
}

export const useChatScroll = ({
	chatRef,
	bottomRef,
	shouldLoadMore,
	loadMore,
	count
}: ChatScrollProps): void => {
	const [hasInitialized, setHasInitialized] = useState(false);

	useEffect(() => {
		const topDiv = chatRef?.current;

		const handleScroll = (): void => {
			const scrollTop = topDiv?.scrollTop;

			if (scrollTop === 0 && shouldLoadMore) {
				loadMore();
			}
		};

		topDiv?.addEventListener('scroll', handleScroll);

		return () => {
			topDiv?.removeEventListener('scroll', handleScroll);
		};
	}, [shouldLoadMore, loadMore, chatRef]);

	useEffect(() => {
		const bottomDiv = bottomRef?.current;
		const topDiv = chatRef.current;
		const shouldAutoScroll = (): boolean => {
			if (!hasInitialized && bottomDiv) {
				setHasInitialized(true);
				return true;
			}

			if (!topDiv) {
				return false;
			}

			const distanceFromBottom =
				topDiv.scrollHeight - topDiv.scrollTop - topDiv.clientHeight;

			return distanceFromBottom <= 100;
		};

		if (shouldAutoScroll()) {
			setTimeout(() => {
				bottomRef.current?.scrollIntoView({
					behavior: 'smooth'
				});
			}, 100);
		}
	}, [bottomRef, chatRef, count, hasInitialized]);
};
