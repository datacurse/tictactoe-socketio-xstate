import { OIcon } from "@/icons/oIcon";
import { XIcon } from "@/icons/xIcon";

export function Tile({
  index,
  onClick,
  player,
}: {
  index: number;
  onClick: () => void;
  player: "x" | "o" | null;
}) {
  return (
    <div
      className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-lg border-2 border-black/30 bg-white text-4xl text-black"
      key={index}
      onClick={onClick}
      onKeyDown={onClick}
    >
      {player === "x" ? (
        <XIcon
          className="h-[70%] w-[70%] text-black"
          lineThicknessRatio={0.18}
        />
      ) : null}
      {player === "o" ? (
        <OIcon className="h-3/4 w-3/4 text-black" strokeWidthPercentage={0.3} />
      ) : null}
    </div>
  );
}
