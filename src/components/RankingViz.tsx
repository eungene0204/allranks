import TipLayer from "./TipLayer";
import { pickViz } from "@/lib/viz";
import type { Ranking } from "@/lib/types";
import Bubbles from "./viz/Bubbles";
import Diverging from "./viz/Diverging";
import Histogram from "./viz/Histogram";
import Lollipop from "./viz/Lollipop";
import DotDistribution from "./viz/DotDistribution";
import Packed from "./viz/Packed";
import Podium from "./viz/Podium";
import RankingMap from "./RankingMap";
import Regions from "./viz/Regions";
import Scatter from "./viz/Scatter";
import Strip from "./viz/Strip";
import Treemap from "./viz/Treemap";
import Waffle from "./viz/Waffle";

/** The picture at the top of a ranking page. Which one is chosen by `pickViz` (src/lib/viz.ts); see .claude/skills/ranking-viz. */
export default function RankingViz({ ranking }: { ranking: Ranking }) {
  return (
    <>
      <Picture ranking={ranking} />
      <TipLayer />
    </>
  );
}

function Picture({ ranking }: { ranking: Ranking }) {
  switch (pickViz(ranking)) {
    case "map": return <RankingMap ranking={ranking} />;
    case "treemap": return <Treemap ranking={ranking} />;
    case "regions": return <Regions ranking={ranking} />;
    case "packed": return <Packed ranking={ranking} />;
    case "waffle": return <Waffle ranking={ranking} />;
    case "strip": return <Strip ranking={ranking} />;
    case "histogram": return <Histogram ranking={ranking} />;
    case "dots": return <DotDistribution ranking={ranking} />;
    case "scatter": return <Scatter ranking={ranking} />;
    case "diverging": return <Diverging ranking={ranking} />;
    case "bubbles": return <Bubbles ranking={ranking} />;
    case "podium": return <Podium ranking={ranking} />;
    case "lollipop": return <Lollipop ranking={ranking} />;
    default: return null;
  }
}
