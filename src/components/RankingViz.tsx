import { pickViz } from "@/lib/viz";
import type { Ranking } from "@/lib/types";
import Bubbles from "./viz/Bubbles";
import Diverging from "./viz/Diverging";
import Lollipop from "./viz/Lollipop";
import RankingMap from "./RankingMap";
import Strip from "./viz/Strip";
import Treemap from "./viz/Treemap";

/** The picture at the top of a ranking page. Which one is chosen by `pickViz` (src/lib/viz.ts); see .claude/skills/ranking-viz. */
export default function RankingViz({ ranking }: { ranking: Ranking }) {
  switch (pickViz(ranking)) {
    case "map": return <RankingMap ranking={ranking} />;
    case "treemap": return <Treemap ranking={ranking} />;
    case "strip": return <Strip ranking={ranking} />;
    case "diverging": return <Diverging ranking={ranking} />;
    case "bubbles": return <Bubbles ranking={ranking} />;
    case "lollipop": return <Lollipop ranking={ranking} />;
    default: return null;
  }
}
