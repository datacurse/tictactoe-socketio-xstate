"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { type ChangeEvent, useEffect, useState } from "react";

export function GameLobbyCard() {
  const [username, setUsername] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Rehydrate username from local storage on component mount
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value;
    setUsername(newUsername);
    localStorage.setItem("username", newUsername); // Update local storage
  };

  const handleCreateNewGame = () => {
    const gameId = nanoid();
    router.push(`/game?userName=${username}&gameId=${gameId}`);
  };

  return (
    <div className="flex max-h-full w-96 flex-col space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Enter your username</CardTitle>
          <CardDescription>
            It will be saved in your localstorage
          </CardDescription>
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
        <Input type="text" placeholder="game id" />
        <Button className="w-full">Join existing game</Button>
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
