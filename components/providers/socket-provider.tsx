'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io as ClientIO } from 'socket.io-client';

interface SocketContextType {
	socket: any | null;
	isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
	socket: null,
	isConnected: false
});

export const useSocket = (): SocketContextType => {
	return useContext(SocketContext);
};

export const SocketProvider = ({
	children
}: {
	children: React.ReactNode;
}): React.ReactNode => {
	const [socket, setSocket] = useState<any>(null);
	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		const socketInstante = new (ClientIO as any)(process.env.NEXT_PUBLIC_SITE, {
			path: '/api/socket/io',
			addTrailingSlash: false
		});

		socketInstante.on('connect', () => {
			setIsConnected(true);
		});

		socketInstante.on('disconnect', () => {
			setIsConnected(false);
		});

		setSocket(socketInstante);

		return () => {
			socketInstante.disconnect();
		};
	}, []);

	return (
		<SocketContext.Provider value={{ socket, isConnected }}>
			{children}
		</SocketContext.Provider>
	);
};
