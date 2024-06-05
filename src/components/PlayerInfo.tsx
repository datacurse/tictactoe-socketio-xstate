"use client";

import type { FC } from "react";

import { OIcon } from "@/icons/oIcon";
import { XIcon } from "@/icons/xIcon";
import { cn, formatTime } from "@/lib/utils";

// Define a TypeScript interface for component props
interface UserInfoProps {
  username: string;
  wins: number;
  playerSide: string | undefined; // Assuming these are the only valid values
  isMyTurn: boolean;
  isConnected: boolean;
  timeLeft: number;
}

export const UserInfo: FC<UserInfoProps> = ({
  username = "barni",
  wins = 10,
  playerSide = "x",
  isMyTurn = true,
  isConnected = true,
  timeLeft = 300,
}) => {
  return (
    <div className="flex h-24 w-full flex-row items-center justify-between py-4">
      <div className="ml-4 flex flex-col">
        <div className="flex flex-row items-center gap-2">
          <div
            className={cn("h-4 w-4", {
              "text-[#a9a9a9]": !isConnected,
              "text-[#82C829]": isConnected,
            })}
          >
            {" "}
            {playerSide === "x" ? (
              <XIcon lineThicknessRatio={0.22} />
            ) : playerSide === "o" ? (
              <OIcon strokeWidthPercentage={0.5} />
            ) : (
              <div>
                {/* <PuffLoader
                  color="#82C829"
                  cssOverride={{}}
                  loading
                  size={16}
                  speedMultiplier={1}
                /> */}
              </div>
            )}
          </div>
          <div className="font-medium text-2xl">{username}</div>
        </div>
        <div className="font-medium">Wins: {wins}</div>
      </div>
      <div
        className={cn("h-fit bg-[#E0E0E0] p-2 font-medium text-4xl", {
          "bg-[#82C829]/60": isMyTurn,
        })}
      >
        {formatTime(timeLeft)}
      </div>
    </div>
  );
};
