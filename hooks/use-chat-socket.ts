import { useEffect } from 'react';
import { useSocket } from '@/components/providers/socket-provider';
import { useQueryClient } from '@tanstack/react-query';
import type { Member, Message, Profile } from '@prisma/client';

interface ChatSocketProps {
	addKey: string;
	updateKey: string;
	queryKey: string;
}

type MessageWithMemberWithProfile = Message & {
	member: Member & {
		profile: Profile;
	};
};

export const useChatSocket = ({
	addKey,
	updateKey,
	queryKey
}: ChatSocketProps): void => {
	const { socket } = useSocket();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!socket) {
			return;
		}

		socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
			queryClient.setQueryData([queryKey], (oldData: any) => {
				// if(!oldData || !oldData.pages || oldData.pages.length === 0){
				if (!oldData?.pages || oldData.pages.length === 0) {
					return oldData;
				}

				const newData = oldData.pages.map((page: any) => {
					return {
						...page,
						items: page.items.map((item: MessageWithMemberWithProfile) => {
							if (item.id === message.id) {
								return message;
							}

							return item;
						})
					};
				});

				console.log(newData);

				return { ...oldData, pages: newData };
			});
		});

		socket.on(addKey, (message: MessageWithMemberWithProfile) => {
			queryClient.setQueryData([queryKey], (oldData: any) => {
				// if(!oldData || !oldData.pages || oldData.pages.length === 0){
				if (!oldData?.pages || oldData.pages.length === 0) {
					return {
						pages: [
							{
								items: [message]
							}
						]
					};
				}

				const newData = [...oldData.pages];

				newData[0] = {
					...newData[0],
					items: [message, ...newData[0].items]
				};

				return {
					...oldData,
					pages: newData
				};
			});
		});

		return () => {
			socket.off(addKey);
			socket.off(updateKey);
		};
	}, [queryClient, addKey, queryKey, socket, updateKey]);
};
