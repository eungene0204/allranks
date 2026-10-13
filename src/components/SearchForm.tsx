export default function SearchForm({ query = "", id = "explore-search" }: { query?: string; id?: string }) {
  return (
    <form action="/search" className="explore-search" role="search">
      <label htmlFor={id}>Search countries, rankings & entries</label>
      <div className="explore-search-row">
        <input id={id} name="q" type="search" defaultValue={query} placeholder="Try Japan, GDP or MIT…" required />
        <button type="submit">Search</button>
      </div>
    </form>
  );
}
