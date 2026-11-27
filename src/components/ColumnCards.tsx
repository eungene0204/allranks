import Link from "next/link";
import { columnDateLabel, columnPath, type Column } from "@/lib/columns";

export default function ColumnCards({ columns, heading }: { columns: Column[]; heading: "h2" | "h3" }) {
  const Heading = heading;
  return (
    <div className="column-cards">
      {columns.map((column) => (
        <Link className="guide-card column-card" key={column.id} href={columnPath(column.id)}>
          <time dateTime={column.publishedOn}>{columnDateLabel(column.publishedOn)}</time>
          <Heading>{column.title}</Heading>
          <p>{column.summary}</p>
          <span>Read the column <span aria-hidden="true">→</span></span>
        </Link>
      ))}
    </div>
  );
}
