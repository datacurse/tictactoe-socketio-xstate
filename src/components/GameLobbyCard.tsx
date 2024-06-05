"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useState } from "react";

export function GameLobbyCard() {
  const [username, setUsername] = useState<string>("");
  const [gameId, setGameId] = useState<string>("");
  const router = useRouter();

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
  };

  const handleGameIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setGameId(e.target.value);
  };

  const generateRandomUsername = () => {
    return nanoid(8);
  };

  const handleCreateNewGame = () => {
    const newUsername = username || generateRandomUsername();
    const newGameId = nanoid();
    router.push(`/game?userName=${newUsername}&gameId=${newGameId}`);
  };

  const handleJoinExistingGame = () => {
    const newUsername = username || generateRandomUsername();
    router.push(`/game?userName=${newUsername}&gameId=${gameId}`);
  };

  return (
    <div className="flex max-h-full w-96 flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Enter your username</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="text"
            placeholder="username"
            value={username}
            onChange={handleUsernameChange}
          />
        </CardContent>
      </Card>
      <Card className="space-y-4 p-6">
        <Input
          type="text"
          placeholder="game id"
          value={gameId}
          onChange={handleGameIdChange}
        />
        <Button className="w-full" onClick={handleJoinExistingGame}>
          Join existing game
        </Button>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <Button className="w-full" onClick={handleCreateNewGame}>
          Create new game
        </Button>
      </Card>
    </div>
  );
}
