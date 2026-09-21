import type { Prize } from "../types";
import PrizeCard from "./PrizeCard";

export default function PrizeGrid({ prizes }: { prizes: Prize[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {prizes.map((prize) => (
        <PrizeCard key={prize.id} prize={prize} />
      ))}
    </div>
  );
}
