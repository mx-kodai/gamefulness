import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY missing");
  process.exit(1);
}

const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const STYLE = [
  "Modern editorial flat illustration, friendly retro-futuristic Japanese UI aesthetic.",
  "Palette: cream warm background #F6F1E4, deep ink #1B1A17 outlines, accent red #E23D3D, yellow #F4B533, blue #2F7FE0, green #2FA66E.",
  "Thick 2-3px black outlines (cartoon/comic style), round corners, no gradients, no text, no words.",
  "Composition: single clear focal subject centered, simple geometric supporting shapes, subtle dot pattern texture hint.",
  "Feel: warm, inclusive, playful, slightly nostalgic, wellness-oriented. Avoid AI-generic slickness.",
  "Aspect 3:2 horizontal.",
].join(" ");

const GAMES = [
  { slug: "tobikko", prompt: "Cute yellow round blob character jumping over a stone obstacle on a horizon line. Sun disc in corner, cloud." },
  { slug: "tsurikko", prompt: "Simple fishing rod held from corner, line hanging into calm stylized water, fish silhouette beneath surface with ripples." },
  { slug: "manekko", prompt: "Four square pads in a 2x2 grid, each a different accent color (red, yellow, blue, green), one pad glowing with highlight rays." },
  { slug: "kazerin", prompt: "Four Japanese furin wind chimes (glass bells) hanging in a row, thin strings, paper tanzaku tails, one bell subtly glowing." },
  { slug: "sorami", prompt: "Sky scene with small bird silhouette, a red balloon on a string, a yellow star, and a white cloud, spread across horizon." },
  { slug: "iroshiri", prompt: "Speech bubble containing colored dots for color word chain game - red, orange, blue, green dots inside a rounded bubble." },
  { slug: "katachi", prompt: "Three basic geometric shapes (circle, triangle, square) with dashed guide outlines and a pointing fingertip tracing one." },
  { slug: "tsukihi", prompt: "Horizontal row of moon phases from crescent through full to waning, soft dotted arc above connecting them." },
  { slug: "kotoba", prompt: "Single blooming flower with red petals and green leaves, small ladybug on a leaf, calm ground pattern." },
  { slug: "egao", prompt: "Round yellow smiling face with rosy cheeks, subtle confetti spark accents around it." },
  { slug: "origami", prompt: "Traditional paper crane (orizuru) origami, dashed fold lines visible on a second flat paper beside it." },
  { slug: "yubiuta", prompt: "Four vertical rhythm bars in accent colors of different heights, music note floating above them on staff line." },
  { slug: "maigo", prompt: "Small cute cat character sitting inside a simple rounded maze pattern with a tiny house icon visible ahead." },
  { slug: "nekonade", prompt: "Curled up sleeping green cat with closed eyes smiling, Z Z sleep marks above, whisker lines, soft cushion beneath." },
];

async function generate(game) {
  const full = `${game.prompt} ${STYLE}`;
  const body = {
    contents: [{ parts: [{ text: full }] }],
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  };
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${game.slug}: ${res.status} ${t.slice(0, 400)}`);
  }
  const json = await res.json();
  const parts = json?.candidates?.[0]?.content?.parts || [];
  const img = parts.find((p) => p?.inlineData?.data);
  if (!img) throw new Error(`${game.slug}: no image in response ${JSON.stringify(json).slice(0, 400)}`);
  const b64 = img.inlineData.data;
  const mime = img.inlineData.mimeType || "image/png";
  const ext = mime.includes("jpeg") ? "jpg" : "png";
  const out = path.join(process.cwd(), "public", "thumbnails", `${game.slug}.${ext}`);
  fs.writeFileSync(out, Buffer.from(b64, "base64"));
  return out;
}

const results = [];
for (const g of GAMES) {
  try {
    const p = await generate(g);
    console.log("OK", g.slug, "->", p);
    results.push({ slug: g.slug, ok: true });
  } catch (e) {
    console.error("FAIL", g.slug, e.message);
    results.push({ slug: g.slug, ok: false, error: e.message });
  }
  await new Promise((r) => setTimeout(r, 800));
}
console.log("\nSummary:", JSON.stringify(results, null, 2));
