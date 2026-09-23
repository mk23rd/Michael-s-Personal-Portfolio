import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";

type HeaderRule = { test: RegExp; headers: [string, string][] };

/** Parses Netlify's `_headers` format: an unindented path pattern followed by indented `Name: value` lines. */
function readNetlifyHeaders(file: string): HeaderRule[] {
  const rules: HeaderRule[] = [];
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    if (!line.trim() || line.trimStart().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      const pattern = line
        .trim()
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*")
        .replace(/:\w+/g, "[^/]+");
      rules.push({ test: new RegExp(`^${pattern}$`), headers: [] });
      continue;
    }
    const colon = line.indexOf(":");
    rules.at(-1)?.headers.push([line.slice(0, colon).trim(), line.slice(colon + 1).trim()]);
  }
  return rules;
}

/** Replays public/_headers in `vite preview`, so local checks run under the production CSP. */
const netlifyHeaders = (): Plugin => ({
  name: "portfolio:netlify-headers",
  configurePreviewServer(server) {
    const rules = readNetlifyHeaders(path.resolve(__dirname, "public/_headers"));
    server.middlewares.use((req, res, next) => {
      const url = (req.url ?? "/").split("?")[0];
      for (const rule of rules) {
        if (!rule.test.test(url)) continue;
        for (const [name, value] of rule.headers) res.setHeader(name, value);
      }
      next();
    });
  }
});

/** Netlify serves dist/404.html with a 404 status for unknown paths, so the app's NotFound page gets a real status code. */
const notFoundPage = (): Plugin => ({
  name: "portfolio:404-page",
  apply: "build",
  writeBundle(options) {
    const dir = options.dir ?? path.resolve(__dirname, "dist");
    fs.copyFileSync(path.join(dir, "index.html"), path.join(dir, "404.html"));
  }
});

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080
  },
  build: {
    // Never inline assets as data: URLs; the CSP in public/_headers only allows 'self'.
    assetsInlineLimit: 0
  },
  plugins: [react(), netlifyHeaders(), notFoundPage()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
