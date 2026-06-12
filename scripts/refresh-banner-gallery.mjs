import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const ROOT = new URL("..", import.meta.url).pathname;
const GALLERY_DIR = join(ROOT, "source/images/banners/gallery");
const MANIFEST_PATH = join(GALLERY_DIR, "manifest.json");
const CREDITS_PATH = join(ROOT, "source/images/banners/CREDITS.md");
const TARGET_COUNT = Number.parseInt(process.argv[2] || "120", 10);
const NASA_TARGET = Math.max(24, Math.round(TARGET_COUNT / 3));
const LANDSCAPE_TARGET = TARGET_COUNT - NASA_TARGET;
const MAX_NASA_PER_QUERY = 5;
const MAX_COMMONS_PER_CATEGORY_PAGE = 5;
const USER_AGENT = "dreaveler-site-image-refresh/1.0 (https://dreaveler.github.io; liweibo545@gmail.com)";
const NASA_SEARCH = "https://images-api.nasa.gov/search";
const COMMONS_API = "https://commons.wikimedia.org/w/api.php";

const NASA_QUERIES = [
  "spiral galaxy",
  "galaxy cluster",
  "nebula",
  "orion nebula",
  "star cluster",
  "cosmic dust",
  "earth from space",
  "earth horizon",
  "moon landscape",
  "moon surface",
  "mars landscape",
  "mars rover landscape",
  "jupiter",
  "saturn",
  "saturn rings",
  "titan moon",
  "pluto",
  "comet",
  "asteroid",
  "hubble deep field",
  "webb nebula",
  "supernova remnant",
  "planetary nebula",
  "milky way",
  "aurora earth"
];

const COMMONS_CATEGORIES = [
  "Category:Featured pictures of landscapes",
  "Category:Quality images of landscapes",
  "Category:Featured pictures of mountains",
  "Category:Quality images of mountains",
  "Category:Featured pictures of lakes",
  "Category:Quality images of lakes",
  "Category:Featured pictures of forests",
  "Category:Quality images of forests",
  "Category:Featured pictures of fog",
  "Category:Quality images of fog",
  "Category:Featured pictures of waterfalls",
  "Category:Quality images of waterfalls",
  "Category:Featured pictures of coasts",
  "Category:Quality images of coasts",
  "Category:Featured pictures of deserts",
  "Category:Quality images of deserts",
  "Category:Featured pictures of sunsets",
  "Category:Quality images of sunsets"
];

const TITLE_BLOCKLIST = [
  "logo",
  "insignia",
  "patch",
  "portrait",
  "headshot",
  "astronaut",
  "crew",
  "employee",
  "people",
  "person",
  "student",
  "training",
  "ceremony",
  "workshop",
  "launch",
  "rocket",
  "arc-",
  "team photo",
  "employees",
  "administrator",
  "conference",
  "briefing",
  "poster",
  "infographic",
  "diagram",
  "chart",
  "painting",
  "watercolor",
  "artwork",
  "museum",
  "illustration",
  "drawing",
  "map",
  "clipart",
  "airplane",
  "aircraft",
  "vehicle",
  "car",
  "truck",
  "building",
  "city",
  "street"
];

function slugPart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 42) || "nasa";
}

function cleanCell(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function scoreLink(link) {
  const href = String(link.href || "");
  const width = Number(link.width || 0);
  const height = Number(link.height || 0);
  const labelScore = href.includes("~medium") ? 40
    : href.includes("~large") ? 35
    : href.includes("~orig") ? 25
    : href.includes("~small") ? 12
    : 0;
  const landscapeScore = width >= height ? 8 : 0;
  const sizeScore = Math.min(width, 1800) / 100;
  return labelScore + landscapeScore + sizeScore;
}

function pickImageLink(item) {
  const links = (item.links || [])
    .filter(link => link.render === "image" && /\.jpe?g($|\?)/i.test(link.href || ""))
    .filter(link => Number(link.width || 0) >= 900 && Number(link.height || 0) >= 480)
    .sort((a, b) => scoreLink(b) - scoreLink(a));
  return links[0] || null;
}

function itemMetadata(item) {
  const data = item.data?.[0] || {};
  const nasaId = data.nasa_id || basename(String(item.href || "")).replace(/\..*$/, "");
  return {
    nasa_id: String(nasaId),
    title: String(data.title || nasaId),
    center: String(data.center || "NASA"),
    date_created: String(data.date_created || "").slice(0, 10),
    keywords: data.keywords || [],
    source_url: `https://images.nasa.gov/details/${encodeURIComponent(nasaId)}`,
    collection_url: item.href || ""
  };
}

function shouldUse(item) {
  const data = item.data?.[0] || {};
  const nasaId = String(data.nasa_id || "").toLowerCase();
  const title = String(data.title || "").toLowerCase();
  const description = String(data.description || "").toLowerCase();
  const keywords = (data.keywords || []).join(" ").toLowerCase();
  if (nasaId.startsWith("arc-")) return false;
  if (TITLE_BLOCKLIST.some(word => title.includes(word) || keywords.includes(word) || description.includes(word))) return false;
  if (description.includes("copyright") || description.includes("all rights reserved")) return false;
  return Boolean(pickImageLink(item));
}

async function searchNasa(query) {
  const url = new URL(NASA_SEARCH);
  url.searchParams.set("q", query);
  url.searchParams.set("media_type", "image");
  url.searchParams.set("page_size", "100");
  const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!response.ok) throw new Error(`NASA search failed for ${query}: ${response.status}`);
  const json = await response.json();
  return json.collection?.items || [];
}

async function collectNasaCandidates(limit) {
  const seen = new Set();
  const out = [];
  for (const query of NASA_QUERIES) {
    const items = await searchNasa(query);
    let usedForQuery = 0;
    for (const item of items) {
      if (!shouldUse(item)) continue;
      const meta = itemMetadata(item);
      if (seen.has(meta.nasa_id)) continue;
      const image = pickImageLink(item);
      seen.add(meta.nasa_id);
      out.push({ ...meta, provider: "NASA", download_url: image.href, width: image.width, height: image.height });
      usedForQuery += 1;
      if (out.length >= limit) return out;
      if (usedForQuery >= MAX_NASA_PER_QUERY) break;
    }
  }
  return out;
}

async function searchCommonsCategory(category, cmcontinue = "") {
  const url = new URL(COMMONS_API);
  const params = {
    action: "query",
    format: "json",
    generator: "categorymembers",
    gcmtitle: category,
    gcmtype: "file",
    gcmlimit: "50",
    prop: "imageinfo",
    iiprop: "url|size|mime|extmetadata",
    iiurlwidth: "1600",
    origin: "*"
  };
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  if (cmcontinue) {
    url.searchParams.set("gcmcontinue", cmcontinue);
    url.searchParams.set("continue", "gcmcontinue||");
  }
  for (let attempt = 1; attempt <= 6; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Api-User-Agent": USER_AGENT
      }
    });
    if (response.ok) return response.json();
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 6) {
      throw new Error(`Commons category failed for ${category}: ${response.status}`);
    }
    await delay(5000 * attempt);
  }
  return {};
}

function stripHtml(value) {
  return cleanCell(value);
}

function commonsMeta(page) {
  const info = page.imageinfo?.[0] || {};
  const ext = info.extmetadata || {};
  const title = stripHtml(ext.ObjectName?.value)
    || String(page.title || "").replace(/^File:/, "").replace(/\.[^.]+$/, "");
  return {
    title,
    creator: stripHtml(ext.Artist?.value) || stripHtml(info.user) || "Wikimedia Commons contributor",
    license: stripHtml(ext.LicenseShortName?.value || ext.UsageTerms?.value || "Wikimedia Commons license"),
    license_url: ext.LicenseUrl?.value || "",
    source_url: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title || "")}`,
    download_url: info.thumburl || info.url,
    width: info.width,
    height: info.height,
    mime: info.mime
  };
}

function shouldUseCommons(page) {
  const info = page.imageinfo?.[0] || {};
  const meta = commonsMeta(page);
  const ratio = Number(meta.width || 0) / Math.max(1, Number(meta.height || 1));
  const text = `${meta.title} ${meta.creator} ${meta.license}`.toLowerCase();
  if (info.mime !== "image/jpeg") return false;
  if (!/^https?:\/\//.test(String(meta.download_url || ""))) return false;
  if (Number(meta.width || 0) < 1200 || Number(meta.height || 0) < 700) return false;
  if (ratio < 1.08 || ratio > 3.4) return false;
  if (!/(public domain|cc0|cc by|cc-by|creative commons|cc)/i.test(meta.license)) return false;
  if (TITLE_BLOCKLIST.some(word => text.includes(word))) return false;
  return true;
}

async function collectCommonsCandidates(limit) {
  const seen = new Set();
  const out = [];
  for (const category of COMMONS_CATEGORIES) {
    let cmcontinue = "";
    let pagesRead = 0;
    while (out.length < limit && pagesRead < 3) {
      let json;
      try {
        json = await searchCommonsCategory(category, cmcontinue);
      } catch (error) {
        console.warn(`skip Commons category "${category}": ${error.message}`);
        break;
      }
      const pages = Object.values(json.query?.pages || {}).sort((a, b) => String(a.title).localeCompare(String(b.title)));
      let usedForPage = 0;
      for (const page of pages) {
        if (!shouldUseCommons(page)) continue;
        const meta = commonsMeta(page);
        if (seen.has(page.title) || seen.has(meta.download_url)) continue;
        seen.add(page.title);
        seen.add(meta.download_url);
        out.push({
          id: page.title,
          provider: "Wikimedia Commons",
          ...meta,
          center: meta.creator,
          collection_url: meta.source_url,
          attribution: `${meta.title} by ${meta.creator}, ${meta.license}`
        });
        usedForPage += 1;
        if (out.length >= limit || usedForPage >= MAX_COMMONS_PER_CATEGORY_PAGE) break;
      }
      cmcontinue = json.continue?.gcmcontinue || "";
      pagesRead += 1;
      if (!cmcontinue || usedForPage >= MAX_COMMONS_PER_CATEGORY_PAGE) break;
    }
    if (out.length >= limit) return out;
  }
  return out;
}

async function download(url, target) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      await writeFile(target, buffer);
      return;
    }
    if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 5) {
      throw new Error(`download failed ${response.status}: ${url}`);
    }
    await delay(2500 * attempt);
  }
}

async function optimizeImage(path) {
  await execFileAsync("sips", ["-Z", "1600", path], { cwd: ROOT });
  await execFileAsync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "78", path, "--out", path], { cwd: ROOT });
}

async function rebuildGallery(candidates, targetCount) {
  await mkdir(GALLERY_DIR, { recursive: true });
  for (const name of await readdir(GALLERY_DIR)) {
    if (/^(space|nasa|landscape)-\d{3}-.+\.jpg$/.test(name)) {
      await rm(join(GALLERY_DIR, name));
    }
  }

  const manifest = [];
  for (const candidate of candidates) {
    if (manifest.length >= targetCount) break;
    const number = String(manifest.length + 1).padStart(3, "0");
    const sourcePrefix = candidate.provider === "NASA" ? "nasa" : "landscape";
    const slug = slugPart(candidate.nasa_id || candidate.id || candidate.title);
    const filename = `${sourcePrefix}-${number}-${slug}.jpg`;
    const relative = `/images/banners/gallery/${filename}`;
    const target = join(GALLERY_DIR, filename);
    try {
      await download(candidate.download_url, target);
      await optimizeImage(target);
      manifest.push({ filename, path: relative, ...candidate });
      console.log(`${number}/${targetCount} ${filename}`);
    } catch (error) {
      await rm(target, { force: true });
      console.warn(`skip ${candidate.download_url}: ${error.message}`);
    }
  }

  if (manifest.length < targetCount) {
    throw new Error(`Only downloaded ${manifest.length} usable images; target was ${targetCount}.`);
  }
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

async function updateCredits(manifest) {
  const start = "<!-- IMAGE-GALLERY:START -->";
  const end = "<!-- IMAGE-GALLERY:END -->";
  const existing = existsSync(CREDITS_PATH)
    ? await readFile(CREDITS_PATH, "utf8")
    : "# Banner Image Credits\n";
  const rows = manifest.map(item => {
    const license = item.provider === "NASA"
      ? "NASA media guidelines"
      : cleanCell(item.license || "Open license");
    const credit = item.provider === "NASA"
      ? cleanCell(item.center || "NASA")
      : cleanCell(item.creator || item.center || item.provider);
    return `| \`${item.filename}\` | ${cleanCell(item.title)} | ${license} | ${credit} | [Source](${item.source_url}) |`;
  }).join("\n");
  const block = [
    start,
    "## Article Background Gallery",
    "",
    "These article background images were selected from NASA Image and Video Library plus Wikimedia Commons openly licensed/public-domain image metadata, then locally downsampled for site use. See each source link for item metadata and license details.",
    "",
    "| File | Title | License | Credit | Source |",
    "| --- | --- | --- | --- | --- |",
    rows,
    end
  ].join("\n");

  const legacyStart = "<!-- NASA-GALLERY:START -->";
  const legacyEnd = "<!-- NASA-GALLERY:END -->";
  const next = existing.includes(start)
    ? existing.replace(new RegExp(`${start}[\\s\\S]*?${end}`), block)
    : existing.includes(legacyStart)
      ? existing.replace(new RegExp(`${legacyStart}[\\s\\S]*?${legacyEnd}`), block)
    : `${existing.trim()}\n\n${block}\n`;
  await writeFile(CREDITS_PATH, next.endsWith("\n") ? next : `${next}\n`);
}

function interleave(landscape, nasa) {
  const mixed = [];
  let landscapeIndex = 0;
  let nasaIndex = 0;
  while (landscapeIndex < landscape.length || nasaIndex < nasa.length) {
    for (let i = 0; i < 3 && landscapeIndex < landscape.length; i += 1) {
      mixed.push(landscape[landscapeIndex++]);
    }
    if (nasaIndex < nasa.length) mixed.push(nasa[nasaIndex++]);
  }
  return mixed;
}

const [commonsCandidates, nasaCandidates] = await Promise.all([
  collectCommonsCandidates(LANDSCAPE_TARGET + 24),
  collectNasaCandidates(NASA_TARGET + 12)
]);

if (commonsCandidates.length < LANDSCAPE_TARGET) {
  throw new Error(`Only found ${commonsCandidates.length} usable Commons images; target was ${LANDSCAPE_TARGET}.`);
}
if (nasaCandidates.length < NASA_TARGET) {
  throw new Error(`Only found ${nasaCandidates.length} usable NASA images; target was ${NASA_TARGET}.`);
}

const candidates = interleave(commonsCandidates, nasaCandidates);
const manifest = await rebuildGallery(candidates, TARGET_COUNT);
await updateCredits(manifest);
console.log(`Wrote ${manifest.length} gallery images to ${GALLERY_DIR}`);
