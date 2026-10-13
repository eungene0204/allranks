/** A ranking's emoji icon, or the ranker's own logo when it has one. */
export default function Mark({ icon, logo }: { icon: string; logo?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return logo ? <img className="mark-img" src={logo} alt="" width={20} height={20} /> : <span className="mark-emoji">{icon}</span>;
}
