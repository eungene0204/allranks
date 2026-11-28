import Link from "next/link";
import { Fragment } from "react";
import { canonicalUrl } from "@/lib/seo";
import JsonLd from "./JsonLd";

export default function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  const trail = [{ name: "Home", path: "/" }, ...items];
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: trail.map(({ name, path }, index) => ({
        "@type": "ListItem", position: index + 1, name, item: canonicalUrl(path),
      })) }} />
    <nav className="crumbs" aria-label="Breadcrumb">
      {trail.map(({ name, path }, index) => <Fragment key={path}>
        {index > 0 && <span aria-hidden="true"> / </span>}
        {index === trail.length - 1 ? <span aria-current="page">{name}</span> : <Link href={path}>{name}</Link>}
      </Fragment>)}
    </nav>
  </>;
}
