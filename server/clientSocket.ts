import { customParser } from "server/customParser";
import type { ClientToServerEvents, ServerToClientEvents } from "server/server";
import { type Socket, io } from "socket.io-client";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
  parser: customParser,
});
