import Link from "next/link";

export default function NotFound() {
  return (
    <div className="empty">
      <h1>Page not found</h1>
      <Link href="/" style={{ color: "var(--accent)" }}>
        ← Back to home
      </Link>
    </div>
  );
}
