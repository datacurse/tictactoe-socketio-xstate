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
      className="tile flex h-24 w-24 cursor-pointer items-center justify-center bg-white text-4xl text-black"
      key={index}
      onClick={onClick}
    >
      {player}
    </div>
  );
}
