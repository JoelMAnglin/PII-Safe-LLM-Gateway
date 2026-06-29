import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = resolve(__dirname);
const publicRoot = resolve(__dirname, "public");
const port = Number(process.env.PORT || 5188);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const path = url.pathname === "/" ? "/index.html" : url.pathname;
  const root = path.startsWith("/src/") ? projectRoot : publicRoot;
  const fullPath = resolve(root, `.${path}`);
  const rel = relative(root, fullPath);
  if (rel.startsWith("..") || rel.includes(`..${sep}`)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  const info = await stat(fullPath).catch(() => null);
  if (!info || !info.isFile()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "content-type": mimeTypes[extname(fullPath)] || "application/octet-stream" });
  createReadStream(fullPath).pipe(res);
}).listen(port, () => {
  console.log(`PII Safe LLM Gateway demo running at http://127.0.0.1:${port}`);
});
