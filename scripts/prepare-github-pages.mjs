import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const distDir = join(process.cwd(), "dist");
const indexPath = join(distDir, "index.html");
const html = readFileSync(indexPath, "utf8");

const patchedHtml = html
  .replaceAll('src="/_expo/', 'src="./_expo/')
  .replaceAll('href="/_expo/', 'href="./_expo/');

writeFileSync(indexPath, patchedHtml);
writeFileSync(join(distDir, ".nojekyll"), "");

for (const filePath of listFiles(distDir)) {
  if (!filePath.endsWith(".js")) {
    continue;
  }

  const source = readFileSync(filePath, "utf8");
  const patchedSource = source
    .replaceAll('"/assets/', '"./assets/')
    .replaceAll("'/assets/", "'./assets/");

  if (patchedSource !== source) {
    writeFileSync(filePath, patchedSource);
  }
}

function listFiles(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const filePath = join(directory, entry);
    return statSync(filePath).isDirectory() ? listFiles(filePath) : [filePath];
  });
}
