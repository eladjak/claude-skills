#!/usr/bin/env node
// Pexels B-roll fetcher — free 4K no-copyright stock video + photo by keyword.
// Reads PEXELS_API_KEY from env or from a .env file next to this script.
// Usage:
//   node pexels-broll.mjs --type video --query "sunrise city timelapse" --per-page 5 [--orientation landscape] [--size large] [--json]
//   node pexels-broll.mjs --type photo --query "modern office" --per-page 5
//   node pexels-broll.mjs --query "coding on laptop"            (defaults to video)
//   node pexels-broll.mjs --mock --query "test"                 (offline self-test, no key/network)
//
// Output: for each result, prints the best downloadable URL(s) + metadata.
// The API (https://www.pexels.com/api/) is free: 200 req/hour, 20,000 req/month.
// Attribution: Pexels license allows free use incl. commercial; crediting Pexels + the
// photographer is appreciated (and required to lift the rate limit).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_BASE = "https://api.pexels.com/v1";

// ---- tiny arg parser (no deps) ----
function parseArgs(argv) {
  const args = { type: "video", query: "", perPage: 5, orientation: "", size: "", json: false, mock: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    if (a === "--type") args.type = next();
    else if (a === "--query" || a === "-q") args.query = next();
    else if (a === "--per-page" || a === "-n") args.perPage = parseInt(next(), 10) || 5;
    else if (a === "--orientation") args.orientation = next(); // landscape | portrait | square
    else if (a === "--size") args.size = next(); // large(4K) | medium(Full HD) | small(HD)
    else if (a === "--json") args.json = true;
    else if (a === "--mock") args.mock = true;
    else if (!args.query) args.query = a; // bare positional = query
  }
  return args;
}

// ---- key resolution: env first, then .env beside the script ----
function resolveKey() {
  if (process.env.PEXELS_API_KEY && process.env.PEXELS_API_KEY.trim()) {
    return process.env.PEXELS_API_KEY.trim();
  }
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const line = fs
      .readFileSync(envPath, "utf8")
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith("PEXELS_API_KEY="));
    if (line) {
      const v = line.split("=").slice(1).join("=").trim().replace(/^["']|["']$/g, "");
      if (v && v !== "your_pexels_api_key") return v;
    }
  }
  return null;
}

// ---- normalize a Pexels VIDEO into a clean result ----
function normalizeVideo(v) {
  const files = (v.video_files || []).slice().sort((a, b) => (b.width || 0) - (a.width || 0));
  const best = files[0] || {};
  return {
    id: v.id,
    kind: "video",
    duration_s: v.duration,
    width: best.width,
    height: best.height,
    quality: best.quality,
    fps: best.fps,
    download_url: best.link,
    preview_image: v.image,
    photographer: v.user && v.user.name,
    pexels_page: v.url,
    all_qualities: files.map((f) => ({ q: f.quality, w: f.width, h: f.height, fps: f.fps, link: f.link })),
  };
}

// ---- normalize a Pexels PHOTO ----
function normalizePhoto(p) {
  const src = p.src || {};
  return {
    id: p.id,
    kind: "photo",
    width: p.width,
    height: p.height,
    download_url: src.original,
    variants: { large2x: src.large2x, large: src.large, medium: src.medium },
    photographer: p.photographer,
    pexels_page: p.url,
    alt: p.alt,
  };
}

// ---- MOCK: deterministic fixture so the tool is provably wired before the real key lands ----
function mockResponse(args) {
  if (args.type === "photo") {
    return [
      normalizePhoto({
        id: 1000001,
        width: 3840,
        height: 2160,
        src: {
          original: "https://images.pexels.com/photos/1000001/mock-original.jpg",
          large2x: "https://images.pexels.com/photos/1000001/mock-large2x.jpg",
          large: "https://images.pexels.com/photos/1000001/mock-large.jpg",
          medium: "https://images.pexels.com/photos/1000001/mock-medium.jpg",
        },
        photographer: "Mock Photographer",
        url: "https://www.pexels.com/photo/mock-1000001/",
        alt: `MOCK photo for "${args.query}"`,
      }),
    ];
  }
  return [
    normalizeVideo({
      id: 2000001,
      duration: 12,
      image: "https://images.pexels.com/videos/2000001/mock-thumb.jpg",
      url: "https://www.pexels.com/video/mock-2000001/",
      user: { name: "Mock Filmmaker" },
      video_files: [
        { quality: "hd", width: 3840, height: 2160, fps: 25, link: "https://videos.pexels.com/video-files/2000001/mock-4k.mp4" },
        { quality: "hd", width: 1920, height: 1080, fps: 25, link: "https://videos.pexels.com/video-files/2000001/mock-1080.mp4" },
        { quality: "sd", width: 1280, height: 720, fps: 25, link: "https://videos.pexels.com/video-files/2000001/mock-720.mp4" },
      ],
    }),
  ];
}

async function fetchPexels(args, key) {
  const isVideo = args.type === "video";
  const url = new URL(isVideo ? `${API_BASE}/videos/search` : `${API_BASE}/search`);
  url.searchParams.set("query", args.query);
  url.searchParams.set("per_page", String(Math.min(args.perPage, 80)));
  if (args.orientation) url.searchParams.set("orientation", args.orientation);
  if (args.size) url.searchParams.set("size", args.size);

  const res = await fetch(url, { headers: { Authorization: key } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    // Self-healing hints per smart-patterns rule
    if (res.status === 401) throw new Error("Pexels 401 Unauthorized — the PEXELS_API_KEY is missing or invalid. Get a free key at https://www.pexels.com/api/");
    if (res.status === 429) throw new Error("Pexels 429 Rate-limited (free tier = 200/hr, 20k/mo). Wait, or request a higher limit from Pexels.");
    throw new Error(`Pexels API error ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json();
  const items = isVideo ? data.videos || [] : data.photos || [];
  return items.map(isVideo ? normalizeVideo : normalizePhoto);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.query) {
    console.error('Missing --query. Example: node pexels-broll.mjs --type video -q "ocean waves" -n 5');
    process.exit(2);
  }

  let results;
  if (args.mock) {
    results = mockResponse(args);
  } else {
    const key = resolveKey();
    if (!key) {
      console.error(
        "No PEXELS_API_KEY found.\n" +
          "  1) Get a FREE key at https://www.pexels.com/api/ (requires-user — cannot self-signup)\n" +
          "  2) Put it in scripts/.env as PEXELS_API_KEY=... OR export PEXELS_API_KEY=...\n" +
          "  (Run with --mock to verify the tool works offline right now.)"
      );
      process.exit(3);
    }
    results = await fetchPexels(args, key);
  }

  if (args.json) {
    console.log(JSON.stringify({ query: args.query, type: args.type, count: results.length, results }, null, 2));
    return;
  }

  console.log(`\nPexels ${args.type} results for "${args.query}" — ${results.length} item(s)${args.mock ? " [MOCK]" : ""}:\n`);
  results.forEach((r, i) => {
    console.log(`#${i + 1}  id=${r.id}  ${r.width}x${r.height}${r.kind === "video" ? `  ${r.duration_s}s  ${r.fps || "?"}fps` : ""}`);
    console.log(`    download: ${r.download_url}`);
    console.log(`    by: ${r.photographer || "?"}  |  ${r.pexels_page}`);
    if (r.kind === "video" && r.all_qualities && r.all_qualities.length > 1) {
      console.log(`    qualities: ${r.all_qualities.map((q) => `${q.w}x${q.h}`).join(", ")}`);
    }
    console.log("");
  });
  console.log("Attribution: content from Pexels (https://www.pexels.com). Credit Pexels + the creator when used.");
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
