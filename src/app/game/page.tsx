"use client";
import { socket } from "@/clientSocket";
import { Tile } from "@/components/Tile";
import { cn } from "@/lib/utils";
import Timer from "easytimer.js";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

function range(start: number, end: number) {
  return Array.from({ length: end - start }, (_, i) => i + start);
}

type PlayerSide = "x" | "o";

interface Player {
  playerSide: PlayerSide | undefined;
  playerName: string | undefined;
  secondsLeft: number;
}

interface TicTacToeContext {
  board: Array<PlayerSide | null>;
  moves: number;
  movingPlayer: PlayerSide;
  winner?: PlayerSide;
  players: Player[];
  onlineUsers: string[];
}

type TicTacToeStateValue =
  | "Awaiting Player Move"
  | { "Game Over": "Player Won" }
  | { "Game Over": "Draw" };

interface TicTacToeState {
  context: TicTacToeContext;
  value: TicTacToeStateValue;
}

function getMe(context: TicTacToeContext, userName: string): Player {
  const me = context.players.find((player) => player.playerName === userName);
  if (!me) {
    throw new Error("Player not found in the game context.");
  }
  return me;
}

function getEnemy(
  context: TicTacToeContext,
  userName: string,
): Player | undefined {
  return context.players.find((player) => player.playerName !== userName);
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds,
  ).padStart(2, "0")}`;
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") ?? "1";
  const userName = searchParams.get("userName") ?? "username";

  const [state, setState] = useState<TicTacToeState | undefined>(undefined);
  const [myTime, setMyTime] = useState<number>(300);
  const [enemyTime, setEnemyTime] = useState<number>(300);
  const myTimer = useRef<Timer>(new Timer());
  const enemyTimer = useRef<Timer>(new Timer());

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("joinGame", roomId, userName);
    });

    socket.on("updateState", (newState: TicTacToeState) => {
      setState(newState);
      console.log(newState);

      const me = getMe(newState.context, userName);
      const enemy = getEnemy(newState.context, userName);

      setMyTime(me.secondsLeft);
      setEnemyTime(enemy ? enemy.secondsLeft : 300);

      if (newState.context.moves >= 2) {
        if (newState.context.movingPlayer === me.playerSide) {
          myTimer.current.start({
            countdown: true,
            startValues: { seconds: me.secondsLeft },
          });
          enemyTimer.current.stop();
        } else {
          enemyTimer.current.start({
            countdown: true,
            startValues: { seconds: enemy ? enemy.secondsLeft : 300 },
          });
          myTimer.current.stop();
        }
      }

      if (typeof newState.value === "object" && "Game Over" in newState.value) {
        myTimer.current.stop();
        enemyTimer.current.stop();
      }
    });

    return () => {
      socket.off("connect");
      socket.off("updateState");
    };
  }, [roomId, userName]);

  useEffect(() => {
    myTimer.current.addEventListener("secondsUpdated", () => {
      setMyTime(myTimer.current.getTotalTimeValues().seconds);
    });

    enemyTimer.current.addEventListener("secondsUpdated", () => {
      setEnemyTime(enemyTimer.current.getTotalTimeValues().seconds);
    });

    return () => {
      myTimer.current.stop();
      enemyTimer.current.stop();
    };
  }, []);

  function handlePlayMove(index: number) {
    socket.emit("playMove", index);
  }

  function handleResetGame() {
    socket.emit("resetGame");
    myTimer.current.stop();
    enemyTimer.current.stop();
    setMyTime(300);
    setEnemyTime(300);
  }

  if (!state) return <div>Loading...</div>;

  const me = getMe(state.context, userName);
  const enemy = getEnemy(state.context, userName);

  const isOnline = (playerName: string) =>
    state.context.onlineUsers.includes(playerName);

  return (
    <div className="game relative p-4">
      <div>
        <div>Turn: {state.context.movingPlayer}</div>
        <div className="flex items-center space-x-2">
          <div
            className={cn("min-h-4 min-w-4 rounded-full", {
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              "bg-green-500": isOnline(me.playerName!),
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              "bg-red-500": !isOnline(me.playerName!),
            })}
          />
          <div>Me: {JSON.stringify(me)}</div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className={cn("min-h-4 min-w-4 rounded-full", {
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              "bg-green-500": enemy && isOnline(enemy.playerName!),
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              "bg-red-500": enemy && !isOnline(enemy.playerName!),
            })}
          />
          <div>
            Enemy:{" "}
            {enemy ? JSON.stringify(enemy) : "waiting for enemy to join..."}
          </div>
        </div>
        <div className="grid w-fit grid-cols-3 gap-1 bg-gray-300 p-4">
          {range(0, 9).map((index) => (
            <Tile
              index={index}
              onClick={() => handlePlayMove(index)}
              key={index}
              player={state.context.board[index] ?? null}
            />
          ))}
        </div>
        <div>My Time: {formatTime(myTime)}</div>
        <div>Enemy Time: {formatTime(enemyTime)}</div>
      </div>
      {typeof state.value === "object" && "Game Over" in state.value && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded bg-white p-6 text-center shadow-lg">
            {state.value["Game Over"] === "Player Won" && (
              <h2 className="mb-4 bg-green-300 font-semibold text-xl">
                Winner: {state.context.winner}
              </h2>
            )}
            {state.value["Game Over"] === "Draw" && (
              <div className="mb-4 bg-yellow-500 font-semibold text-xl">
                Draw
              </div>
            )}
            <button
              type="submit"
              className="mt-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-700"
              onClick={handleResetGame}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
