export default function SearchLoading() {
  return (
    <div className="page-head" aria-busy="true">
      <p className="loading-title">Search</p>
      <p role="status">Loading search results…</p>
    </div>
  );
}
