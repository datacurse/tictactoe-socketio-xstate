"use client";
import { socket } from "@/clientSocket";
import { UserInfo } from "@/components/PlayerInfo";
import { Tile } from "@/components/Tile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils";
import Timer from "easytimer.js";
import Link from "next/link";
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
  | "Waiting For Players"
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

export default function HomePage() {
  const searchParams = useSearchParams();
  const gameId = searchParams.get("gameId") ?? "1";
  const userName = searchParams.get("userName") ?? "username";

  const [state, setState] = useState<TicTacToeState | undefined>(undefined);
  const [myTime, setMyTime] = useState<number>(300);
  const [enemyTime, setEnemyTime] = useState<number>(300);
  const myTimer = useRef<Timer>(new Timer());
  const enemyTimer = useRef<Timer>(new Timer());

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
      socket.emit("joinGame", gameId, userName);
    });

    socket.on("updateState", (newState: TicTacToeState) => {
      setState(newState);
      console.log(newState);

      const me = getMe(newState.context, userName);
      const enemy = getEnemy(newState.context, userName);

      setMyTime(me.secondsLeft);
      setEnemyTime(enemy ? enemy.secondsLeft : 300);

      if (newState.context.moves >= 1) {
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
  }, [gameId, userName]);

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

  function handleCopyGameId() {
    navigator.clipboard.writeText(gameId).then(() => {
      console.log("Game ID copied to clipboard:", gameId);
    });
  }

  if (!state) return <div>Loading...</div>;

  const me = getMe(state.context, userName);
  const enemy = getEnemy(state.context, userName);

  const isOnline = (playerName: string) =>
    state.context.onlineUsers.includes(playerName);

  return (
    <>
      <div className="absolute left-0 z-10 mt-4 ml-4">
        <Link
          href={"/"}
          className="flex h-fit flex-col items-start justify-between rounded-md border bg-white px-4 shadow transition-colors hover:cursor-pointer dark:bg-gray-950 dark:hover:bg-gray-800 hover:bg-gray-100"
        >
          <div className="flex size-12 items-center justify-center">
            <div className="font-semibold text-2xl">Back</div>
          </div>
        </Link>
      </div>
      <div className="flex h-screen items-center justify-center">
        <Card>
          <div className="flex w-[352px] flex-col items-center">
            {enemy && (
              <UserInfo
                username={enemy.playerName ?? ""}
                wins={10}
                playerSide={enemy.playerSide}
                isMyTurn={state.context.movingPlayer === enemy.playerSide}
                isConnected={isOnline(enemy ? enemy.playerName ?? "" : "")}
                timeLeft={enemyTime}
              />
            )}
            <div
              className="grid h-full w-fit grid-cols-3 gap-4"
              style={{ gridTemplateRows: "repeat(3, minmax(0, 1fr))" }}
            >
              {range(0, 9).map((index) => (
                <Tile
                  index={index}
                  onClick={() => handlePlayMove(index)}
                  key={index}
                  player={state.context.board[index] ?? null}
                />
              ))}
            </div>
            <UserInfo
              username={me.playerName ?? ""}
              wins={10}
              playerSide={me.playerSide}
              isMyTurn={state.context.movingPlayer === me.playerSide}
              isConnected={isOnline(me.playerName || "")}
              timeLeft={myTime}
            />
          </div>
        </Card>
        {typeof state.value === "object" && "Game Over" in state.value && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="rounded-xl bg-white p-6 text-center shadow-lg">
              {state.value["Game Over"] === "Player Won" && (
                <h2 className="mb-4 font-semibold text-xl">
                  Winner:{" "}
                  {state.context.winner === me.playerSide
                    ? me.playerName
                    : enemy?.playerName}
                </h2>
              )}
              {state.value["Game Over"] === "Draw" && (
                <div className="mb-4 font-semibold text-xl">Draw</div>
              )}
              <button
                type="submit"
                className="mt-2 rounded bg-[#82C829]/60 px-4 py-2 font-bold text-black hover:bg-[#82C829]/80"
                onClick={handleResetGame}
              >
                Play again
              </button>
            </div>
          </div>
        )}
        {state.value === "Waiting For Players" && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col space-y-8 rounded-xl bg-white p-6 text-center shadow-lg">
              <div className="select-none font-semibold text-xl">
                Waiting for other player to join...
              </div>
              <div className="flex flex-col items-start justify-center">
                <div className="flex w-full flex-row items-center justify-between">
                  <div className="select-none text-muted-foreground text-xl italic leading-none">
                    Invite link:
                  </div>
                  <div className="flex items-center">
                    <Button onClick={handleCopyGameId}>Copy</Button>
                  </div>
                </div>
                <div className="font-semibold text-xl">{gameId}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
