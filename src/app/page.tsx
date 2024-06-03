"use client";
import { GameLobbyCard } from "@/components/GameLobbyCard";
import { ProjectDescription } from "@/components/ProjectDescription";
import { Separator } from "@radix-ui/react-separator";

export default function HomePage() {
  return (
    <div className="flex h-screen max-h-screen">
      <div className="flex max-h-screen flex-1 items-center justify-center overflow-auto">
        <GameLobbyCard />
      </div>
      <Separator orientation="vertical" className="w-0.5 bg-zinc-200" />
      <div className="flex max-h-screen flex-1 flex-col overflow-auto bg-primary-foreground">
        <ProjectDescription />
      </div>
    </div>
  );
}
