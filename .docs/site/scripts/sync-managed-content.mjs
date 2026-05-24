import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const runtimeRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoRoot = resolve(runtimeRoot, "../..");
const authoredRoots = [
  { source: resolve(repoRoot, "docs"), target: resolve(runtimeRoot, "app/docs") },
  { source: resolve(repoRoot, "api-reference"), target: resolve(runtimeRoot, "app/docs/api") },
];

function isMarkdownFile(path) {
  return [".md", ".mdx"].includes(extname(path).toLowerCase());
}

function targetPagePath(targetRoot, relativePath) {
  const withoutExtension = relativePath.replace(/\.mdx?$/i, "");
  const isIndexPage = basename(withoutExtension).toLowerCase() === "index";
  const targetDirectory = isIndexPage ? dirname(withoutExtension) : withoutExtension;
  return join(targetRoot, targetDirectory === "." ? "" : targetDirectory, "page.mdx");
}

async function fileExists(path) {
  try {
    await readdir(path);
    return true;
  } catch {
    try {
      await readFile(path, "utf8");
      return true;
    } catch {
      return false;
    }
  }
}

async function copySiblingAssets(sourceDirectory, targetDirectory) {
  if (!(await fileExists(sourceDirectory))) {
    return;
  }

  const entries = await readdir(sourceDirectory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }

    const sourcePath = join(sourceDirectory, entry.name);
    const targetPath = join(targetDirectory, entry.name);

    if (entry.isDirectory()) {
      await mkdir(targetPath, { recursive: true });
      await cp(sourcePath, targetPath, { recursive: true, force: true });
      continue;
    }

    if (isMarkdownFile(entry.name)) {
      continue;
    }

    await mkdir(dirname(targetPath), { recursive: true });
    await cp(sourcePath, targetPath, { force: true });
  }
}

async function syncAuthoredRoot(sourceRoot, targetRoot) {
  if (!(await fileExists(sourceRoot))) {
    return;
  }

  const visit = async (currentSourceDirectory, relativeDirectory = "") => {
    const entries = await readdir(currentSourceDirectory, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }

      const sourcePath = join(currentSourceDirectory, entry.name);
      const relativePath = relativeDirectory ? join(relativeDirectory, entry.name) : entry.name;

      if (entry.isDirectory()) {
        await visit(sourcePath, relativePath);
        continue;
      }

      if (!isMarkdownFile(entry.name)) {
        const targetPath = join(targetRoot, relativePath);
        await mkdir(dirname(targetPath), { recursive: true });
        await cp(sourcePath, targetPath, { force: true });
        continue;
      }

      const targetPath = targetPagePath(targetRoot, relativePath);
      await mkdir(dirname(targetPath), { recursive: true });
      await writeFile(targetPath, await readFile(sourcePath, "utf8"), "utf8");

      if (basename(relativePath).toLowerCase() !== "index.mdx" && basename(relativePath).toLowerCase() !== "index.md") {
        await copySiblingAssets(dirname(sourcePath), dirname(targetPath));
      }
    }
  };

  await visit(sourceRoot);
}

await rm(resolve(runtimeRoot, "app/docs"), { recursive: true, force: true });
await mkdir(resolve(runtimeRoot, "app/docs"), { recursive: true });

for (const authoredRoot of authoredRoots) {
  await syncAuthoredRoot(authoredRoot.source, authoredRoot.target);
}
