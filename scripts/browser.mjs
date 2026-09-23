// Locates a Chromium-based browser for the scripts that drive one through puppeteer-core:
// PUPPETEER_EXECUTABLE_PATH (or CHROME_PATH) wins, then Edge/Chrome in their usual places.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function findBrowser() {
  const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH;
  if (fromEnv) return fromEnv;
  const onPath = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge"].flatMap((bin) =>
    (process.env.PATH ?? "").split(path.delimiter).map((dir) => path.join(dir, bin))
  );
  const candidates = {
    win32: [
      "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      path.join(process.env.LOCALAPPDATA ?? "", "Google\\Chrome\\Application\\chrome.exe")
    ],
    linux: ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/microsoft-edge"],
    darwin: [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"
    ]
  }[os.platform()] ?? [];
  const found = [...candidates, ...onPath].find((p) => p && fs.existsSync(p));
  if (!found) throw new Error("No Chromium-based browser found; set PUPPETEER_EXECUTABLE_PATH");
  return found;
}
