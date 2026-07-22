import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("produces the standard Next.js output expected by Vercel", async () => {
  await access(new URL(".next/BUILD_ID", root));
  await access(new URL(".next/server/app", root));

  const buildManifest = JSON.parse(
    await readFile(new URL(".next/build-manifest.json", root), "utf8"),
  );
  assert.ok(buildManifest.rootMainFiles.length > 0);
});

