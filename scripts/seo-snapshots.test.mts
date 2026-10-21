import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const generator = fileURLToPath(new URL("./seo-snapshots.mts", import.meta.url));
const fixture = JSON.parse(readFileSync(new URL("../data/rankings/wbx-lp-lpi-trac-rk.json", import.meta.url), "utf8"));
test("snapshot dates survive timestamp-only refreshes and exclude private content", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "allranks-seo-snapshots-"));
  try {
    mkdirSync(path.join(directory, "data/rankings"), { recursive: true });
    const file = path.join(directory, "data/rankings/test.json");
    const run = () => {
      const result = spawnSync(process.execPath, [generator], { cwd: directory, encoding: "utf8" });
      assert.equal(result.status, 0, result.stderr);
      return JSON.parse(readFileSync(path.join(directory, "data/seo-snapshots.json"), "utf8"));
    };
    writeFileSync(file, JSON.stringify(fixture));
    const before = run();
    fixture.updatedAt = "2027-01-01T00:00:00.000Z";
    writeFileSync(file, JSON.stringify(fixture));
    assert.deepEqual(run(), before, "A fetch-only update must not reset lastmod");
    fixture.desc += " Updated definition.";
    writeFileSync(file, JSON.stringify(fixture));
    assert.notEqual(run()[fixture.id].hash, before[fixture.id].hash, "Real content changes must be detected");
    fixture.source.verified = false;
    writeFileSync(file, JSON.stringify(fixture));
    assert.deepEqual(run(), {}, "Explicitly private data must be excluded");
    fixture.source = { ...fixture.source, kind: "manual", verified: undefined };
    writeFileSync(file, JSON.stringify(fixture));
    assert.deepEqual(run(), {}, "Manual data needs explicit verification");
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
