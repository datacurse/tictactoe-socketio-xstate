import { createServer } from "node:http";
import { createSkyInspector } from "@statelyai/inspect";
import next from "next";
import { customParser } from "server/customParser";
import { Server as SocketIOServer } from "socket.io";
import { type ActorRefFrom, createActor } from "xstate";
import { gameCenterMachine } from "./gameCenterMachine";
import type { ticTacToeMachine } from "./ticTacToeMachine";
const { inspect } = createSkyInspector();

const gameCenterMachineActor = createActor(gameCenterMachine, { inspect });

gameCenterMachineActor.start();

export type TicTacToeMachineActor = ActorRefFrom<typeof ticTacToeMachine>;

const stateMachines = new Map<string, TicTacToeMachineActor>();

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3001;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

BigInt.prototype.toJSON = function () {
  return this.toString();
};

export interface ServerToClientEvents {
  updateState: (state: any) => void;
}

export interface ClientToServerEvents {
  joinGame: (roomId: string, username: string) => void;
  playMove: (position: number) => void;
  resetGame: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export type InterServerEvents = {};

export interface SocketData {
  roomId: string;
  userName: string;
}

function serializeState(state: any) {
  return {
    value: state.value,
    context: state.context,
  };
}

void app.prepare().then(() => {
  const server = createServer(handler);

  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, { parser: customParser });

  io.on("connection", (socket) => {
    let stateMachineActor: TicTacToeMachineActor | undefined = undefined;

    function broadcastState() {
      if (stateMachineActor) {
        const persistedState = stateMachineActor.getPersistedSnapshot();
        io.to(socket.data.roomId).emit(
          "updateState",
          serializeState(stateMachineActor.getSnapshot()),
        );
      }
    }

    socket.on("joinGame", async (roomId, userName) => {
      socket.data = { roomId, userName } as SocketData;

      console.log(
        `Connected with socket.id: ${socket.id}, Room ID: ${roomId}, User Name: ${userName}`,
      );

      socket.join(roomId);

      stateMachineActor = gameCenterMachineActor.system.get(roomId);
      if (!stateMachineActor) {
        gameCenterMachineActor.send({ type: "game.spawn", gameId: roomId });
        stateMachineActor = gameCenterMachineActor.system.get(roomId);
      }

      stateMachineActor?.send({ type: "user.connect", userName: userName });
      stateMachineActor?.send({ type: "become.player", playerName: userName });

      broadcastState();
    });

    socket.on("playMove", (position: number) => {
      if (stateMachineActor) {
        stateMachineActor.send({
          type: "move",
          position,
          playerName: socket.data.userName,
        });
        broadcastState();
      }
    });

    socket.on("resetGame", () => {
      if (stateMachineActor) {
        stateMachineActor.send({ type: "play.again" });
        broadcastState();
      }
    });

    socket.on("disconnect", () => {
      stateMachineActor?.send({
        type: "user.disconnect",
        userName: socket.data.userName,
      });
      console.log(`Client disconnected: ${socket.id}`);
      broadcastState();
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
