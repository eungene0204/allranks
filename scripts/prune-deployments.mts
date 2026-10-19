import { execFileSync } from "node:child_process";

// Fixed scope: this utility must never delete deployments from another project.
const PROJECT = "prj_2RfHpDzlnGca2WYligjkLBKahArz";
const TEAM = "team_dRyhQQJOFiIWaVTkcPYzZGK3";
const apply = process.argv.includes("--apply");
const token = process.env.VERCEL_TOKEN;

type Deployment = { uid: string; projectId: string; created: number; state: string };
type Project = { targets?: { production?: { id: string; createdAt: number; readyState: string } } };

async function api<T>(path: string, method = "GET"): Promise<T> {
  const endpoint = `${path}${path.includes("?") ? "&" : "?"}teamId=${TEAM}`;
  if (!token) {
    const args = ["api", endpoint];
    if (method === "DELETE") args.push("-X", "DELETE", "--dangerously-skip-permissions");
    return JSON.parse(execFileSync("vercel", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] })) as T;
  }
  const response = await fetch(`https://api.vercel.com${endpoint}`, {
    method, headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Vercel API ${method} failed (${response.status})`);
  return await response.json() as T;
}

async function currentProduction() {
  const project = await api<Project>(`/v9/projects/${PROJECT}`);
  const current = project.targets?.production;
  if (!current || current.readyState !== "READY" || !Number.isFinite(current.createdAt)) {
    throw new Error("No healthy production deployment found; nothing will be deleted.");
  }
  return current;
}

const current = await currentProduction();
const candidates: Deployment[] = [];
let until: number | undefined;
do {
  const result = await api<{ deployments: Deployment[]; pagination: { next: number | null } }>(
    `/v6/deployments?projectId=${PROJECT}&limit=100${until === undefined ? "" : `&until=${until}`}`,
  );
  candidates.push(...result.deployments);
  const next = result.pagination.next;
  if (next !== null && until !== undefined && next >= until) throw new Error("Deployment pagination did not advance.");
  until = next ?? undefined;
} while (until !== undefined);

console.log(`Keep current production: ${current.id}. Mode: ${apply ? "apply" : "dry run"}.`);
for (const deployment of candidates) {
  if (deployment.projectId !== PROJECT) throw new Error("Unexpected project; stopped.");
  // Preserve builds in flight, and anything created after the production version.
  if (deployment.uid === current.id || deployment.created >= current.createdAt || !["READY", "ERROR", "CANCELED"].includes(deployment.state)) continue;
  if (apply) {
    // Stop if a promotion or rollback occurred while this cleanup was running.
    const latest = await currentProduction();
    if (latest.id !== current.id) throw new Error("Production changed; stopped. Run cleanup again.");
    const result = await api<{ state: string }>(`/v13/deployments/${deployment.uid}`, "DELETE");
    if (result.state !== "DELETED") throw new Error("Deletion was not confirmed.");
  }
  console.log(`${apply ? "Deleted" : "Would delete"}: ${deployment.uid}`);
}
