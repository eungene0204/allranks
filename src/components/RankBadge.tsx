export default function RankBadge({ rank }: { rank: number }) {
  return <span className={`rk ${rank <= 3 ? `r${rank}` : ""}`}>{rank}</span>;
}
