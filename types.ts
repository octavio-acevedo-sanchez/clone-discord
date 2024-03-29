import type { Server as NetServer, Socket } from 'net';
import type { NextApiResponse } from 'next';
import type { Server as SocketIOServer } from 'socket.io';
import type { Conversation, Member, Profile, Server } from '@prisma/client';

export type ServerWithMembersWithProfiles = Server & {
	members: Array<Member & { profile: Profile }>;
};

export type ConversationWithMembersWithProfiles = Conversation & {
	memberOne: Member & { profile: Profile };
	memberTwo: Member & { profile: Profile };
};

export type NextApiResponseServerIo = NextApiResponse & {
	socket: Socket & {
		server: NetServer & {
			io: SocketIOServer;
		};
	};
};
