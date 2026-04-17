import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-image";
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

const slug = process.argv[2];
const promptArg = process.argv.slice(3).join(" ");
if (!slug || !promptArg) {
  console.error("usage: node regen-thumb.mjs <slug> <prompt>");
  process.exit(1);
}

const STYLE = [
  "ABSOLUTELY NO TEXT, NO LETTERS, NO WORDS, NO NUMBERS, NO HEX CODES anywhere in the image.",
  "Pure illustration only with shapes.",
  "Modern editorial flat illustration, friendly retro-futuristic Japanese UI aesthetic.",
  "Palette: cream warm background #F6F1E4, deep ink #1B1A17 outlines, accent red #E23D3D, yellow #F4B533, blue #2F7FE0, green #2FA66E.",
  "Thick 2-3px black outlines (cartoon/comic style), round corners, no gradients, no text, no typography, no lettering, no words whatsoever.",
  "Composition: single clear focal subject centered, simple geometric supporting shapes, subtle dot pattern texture hint.",
  "Feel: warm, inclusive, playful, slightly nostalgic, wellness-oriented.",
  "Aspect 3:2 horizontal.",
].join(" ");

const res = await fetch(URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    contents: [{ parts: [{ text: `${promptArg} ${STYLE}` }] }],
    generationConfig: { responseModalities: ["IMAGE"] },
  }),
});

if (!res.ok) {
  console.error(await res.text());
  process.exit(1);
}
const json = await res.json();
const parts = json?.candidates?.[0]?.content?.parts || [];
const img = parts.find((p) => p?.inlineData?.data);
if (!img) {
  console.error("no image");
  process.exit(1);
}
const b64 = img.inlineData.data;
const mime = img.inlineData.mimeType || "image/png";
const ext = mime.includes("jpeg") ? "jpg" : "png";
const out = path.join(process.cwd(), "public", "thumbnails", `${slug}.${ext}`);
fs.writeFileSync(out, Buffer.from(b64, "base64"));
console.log("OK", slug, "->", out);
