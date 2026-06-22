import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { PNG } from "pngjs";

const root = process.cwd();
const dirs = {
  rooms: join(root, "assets", "rooms"),
  messes: join(root, "assets", "messes"),
  characters: join(root, "assets", "characters"),
  tools: join(root, "assets", "tools"),
  audio: join(root, "assets", "audio")
};

Object.values(dirs).forEach((dir) => mkdirSync(dir, { recursive: true }));

let seed = 42;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
};
const pick = (items) => items[Math.floor(rand() * items.length)];

function rgba(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
    a: clean.length >= 8 ? parseInt(clean.slice(6, 8), 16) : 255
  };
}

function set(image, x, y, r, g, b, a = 255) {
  const xx = Math.floor(x);
  const yy = Math.floor(y);
  if (xx < 0 || yy < 0 || xx >= image.width || yy >= image.height) return;
  const idx = (yy * image.width + xx) * 4;
  image.data[idx] = r;
  image.data[idx + 1] = g;
  image.data[idx + 2] = b;
  image.data[idx + 3] = a;
}

function blend(image, x, y, color) {
  const xx = Math.floor(x);
  const yy = Math.floor(y);
  if (xx < 0 || yy < 0 || xx >= image.width || yy >= image.height) return;
  const c = rgba(color);
  const idx = (yy * image.width + xx) * 4;
  const srcA = c.a / 255;
  const dstA = image.data[idx + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  if (outA <= 0) return;
  image.data[idx] = Math.round((c.r * srcA + image.data[idx] * dstA * (1 - srcA)) / outA);
  image.data[idx + 1] = Math.round((c.g * srcA + image.data[idx + 1] * dstA * (1 - srcA)) / outA);
  image.data[idx + 2] = Math.round((c.b * srcA + image.data[idx + 2] * dstA * (1 - srcA)) / outA);
  image.data[idx + 3] = Math.round(outA * 255);
}

function rect(image, x, y, w, h, color) {
  const c = rgba(color);
  for (let yy = Math.floor(y); yy < Math.ceil(y + h); yy += 1) {
    for (let xx = Math.floor(x); xx < Math.ceil(x + w); xx += 1) {
      set(image, xx, yy, c.r, c.g, c.b, c.a);
    }
  }
}

function ellipse(image, cx, cy, rx, ry, color) {
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y += 1) {
    for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x += 1) {
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      if (dx * dx + dy * dy <= 1) blend(image, x, y, color);
    }
  }
}

function line(image, x0, y0, x1, y1, color, width = 3) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    ellipse(image, x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, width, width, color);
  }
}

function dots(image, count, bounds, palette, min = 2, max = 8) {
  for (let i = 0; i < count; i += 1) {
    ellipse(
      image,
      bounds.x + rand() * bounds.w,
      bounds.y + rand() * bounds.h,
      min + rand() * (max - min),
      min + rand() * (max - min),
      pick(palette)
    );
  }
}

function writePng(width, height, filePath, draw) {
  const image = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) set(image, x, y, 0, 0, 0, 0);
  }
  draw(image);
  writeFileSync(filePath, PNG.sync.write(image));
}

writePng(980, 1480, join(dirs.rooms, "bedroom-cartoon.png"), (image) => {
  rect(image, 0, 0, 980, 1480, "#f7dfb8");
  for (let y = 0; y < 1480; y += 82) line(image, 0, y, 980, y + 18, "#eacb9a", 2);
  for (let x = -100; x < 980; x += 120) line(image, x, 0, x + 180, 1480, "#efd4aa", 2);
  rect(image, 34, 34, 912, 1412, "#fff0d4");
  rect(image, 548, 242, 330, 280, "#9fc5df");
  rect(image, 588, 268, 250, 96, "#f8f2e8");
  rect(image, 584, 382, 258, 112, "#73a6cd");
  rect(image, 74, 118, 250, 154, "#c98747");
  rect(image, 100, 92, 202, 36, "#9f6537");
  rect(image, 184, 458, 322, 330, "#e7bd4d");
  ellipse(image, 345, 623, 178, 154, "#f5d673");
  rect(image, 684, 706, 210, 150, "#a5dfe5");
  line(image, 789, 706, 789, 856, "#ffffff", 5);
  line(image, 684, 781, 894, 781, "#ffffff", 5);
  rect(image, 500, 48, 300, 250, "#c9ad8c");
  line(image, 650, 48, 650, 298, "#8b6744", 5);
  rect(image, 700, 1170, 150, 238, "#b68b58");
  dots(image, 220, { x: 40, y: 40, w: 900, h: 1380 }, ["#f2c98f33", "#ffffff44", "#d7ad7833"], 1, 3);
});

const messes = [
  ["crumbs.png", ["#7a4b22", "#a66b2d", "#d49c55"], "scatter"],
  ["dust.png", ["#9d9891aa", "#c2bcb4aa", "#ded7cfaa"], "cloud"],
  ["debris.png", ["#5f4535", "#8a6044", "#c9945f"], "scatter"],
  ["juice.png", ["#d63149cc", "#ff6b7dcc", "#ffb0b9cc"], "spill"],
  ["mud.png", ["#5c3a22dd", "#805235dd", "#a8754bdd"], "prints"],
  ["sticky.png", ["#e9911dcc", "#ffc14dcc", "#ffd98acc"], "spill"],
  ["clothes.png", ["#3f6ed5", "#f05d6f", "#ffd166", "#6dc6a8"], "pile"],
  ["toys.png", ["#8e57c7", "#3aaed8", "#ffb224", "#ef476f"], "blocks"],
  ["trash.png", ["#4e9b68", "#dfe7dc", "#a6b1a0", "#6a6a6a"], "pile"]
];

for (const [name, palette, mode] of messes) {
  writePng(220, 170, join(dirs.messes, name), (image) => {
    if (mode === "scatter") dots(image, 95, { x: 24, y: 22, w: 172, h: 116 }, palette, 3, 12);
    if (mode === "cloud") dots(image, 80, { x: 30, y: 35, w: 160, h: 90 }, palette, 8, 22);
    if (mode === "spill") {
      ellipse(image, 108, 84, 78, 48, palette[0]);
      ellipse(image, 72, 66, 42, 25, palette[1]);
      ellipse(image, 144, 102, 46, 28, palette[0]);
      ellipse(image, 168, 56, 13, 13, palette[2]);
    }
    if (mode === "prints") {
      for (let i = 0; i < 5; i += 1) {
        ellipse(image, 58 + i * 28, 52 + (i % 2) * 42, 20, 32, palette[i % palette.length]);
        ellipse(image, 50 + i * 28, 20 + (i % 2) * 42, 5, 5, palette[1]);
        ellipse(image, 64 + i * 28, 18 + (i % 2) * 42, 5, 5, palette[1]);
      }
    }
    if (mode === "pile") {
      for (let i = 0; i < 14; i += 1) ellipse(image, 42 + rand() * 140, 48 + rand() * 78, 26 + rand() * 20, 16 + rand() * 15, pick(palette));
    }
    if (mode === "blocks") {
      for (let i = 0; i < 13; i += 1) rect(image, 35 + rand() * 140, 35 + rand() * 88, 28 + rand() * 28, 20 + rand() * 22, pick(palette));
      ellipse(image, 146, 55, 24, 24, "#ef476f");
    }
  });
}

writePng(260, 360, join(dirs.characters, "mother-cartoon.png"), (image) => {
  ellipse(image, 130, 65, 52, 52, "#f0c7a8");
  rect(image, 80, 114, 100, 150, "#ff5b6e");
  ellipse(image, 82, 164, 22, 74, "#2b2b2b");
  ellipse(image, 178, 164, 22, 74, "#2b2b2b");
  rect(image, 92, 258, 30, 72, "#2b2b2b");
  rect(image, 138, 258, 30, 72, "#2b2b2b");
  ellipse(image, 130, 54, 62, 35, "#2b2b2b");
  ellipse(image, 112, 62, 5, 5, "#2b2b2b");
  ellipse(image, 148, 62, 5, 5, "#2b2b2b");
  line(image, 108, 92, 152, 92, "#8a1c25", 5);
});

for (const [name, color, accent] of [
  ["vacuum.png", "#3457d5", "#b9c9ff"],
  ["mop.png", "#008c8c", "#a7f0e8"],
  ["hand.png", "#d87932", "#ffd2a8"]
]) {
  writePng(160, 160, join(dirs.tools, name), (image) => {
    ellipse(image, 80, 80, 70, 70, accent);
    ellipse(image, 80, 80, 50, 50, color);
    if (name === "vacuum.png") {
      rect(image, 52, 80, 60, 32, "#ffffff");
      line(image, 92, 78, 128, 38, "#ffffff", 8);
      ellipse(image, 58, 118, 8, 8, "#28231f");
      ellipse(image, 106, 118, 8, 8, "#28231f");
    }
    if (name === "mop.png") {
      line(image, 86, 28, 78, 112, "#ffffff", 8);
      for (let i = 0; i < 8; i += 1) line(image, 62 + i * 5, 110, 45 + i * 10, 138, "#ffffff", 4);
    }
    if (name === "hand.png") {
      ellipse(image, 80, 92, 34, 30, "#f7c59f");
      for (let i = 0; i < 5; i += 1) ellipse(image, 48 + i * 16, 60, 8, 30, "#f7c59f");
    }
  });
}

writeWav(join(dirs.audio, "clean.wav"), 0.18, (t) => Math.sin(2 * Math.PI * (520 + t * 900) * t) * envelope(t, 0.18));
writeWav(join(dirs.audio, "wrong-tool.wav"), 0.22, (t) => Math.sin(2 * Math.PI * 140 * t) * Math.sign(Math.sin(2 * Math.PI * 22 * t)) * envelope(t, 0.22));
writeWav(join(dirs.audio, "pickup.wav"), 0.18, (t) => Math.sin(2 * Math.PI * (300 + t * 1200) * t) * envelope(t, 0.18));
writeWav(join(dirs.audio, "scream.wav"), 0.5, (t) => Math.sin(2 * Math.PI * (820 + Math.sin(t * 40) * 140) * t) * envelope(t, 0.5));
writeWav(join(dirs.audio, "victory.wav"), 0.75, (t) => {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  const note = notes[Math.min(notes.length - 1, Math.floor(t / 0.18))];
  return Math.sin(2 * Math.PI * note * t) * envelope(t % 0.18, 0.18) * 0.8;
});
writeWav(join(dirs.audio, "panic-loop.wav"), 3.2, (t) => {
  const beat = Math.floor(t * 8);
  const bass = Math.sin(2 * Math.PI * [196, 246.94, 220, 261.63][beat % 4] * t) * 0.22;
  const tick = Math.sin(2 * Math.PI * 1200 * t) * Math.max(0, 1 - (t * 8 - beat) * 12) * 0.25;
  return (bass + tick) * 0.8;
});

function writeWav(filePath, seconds, sampleFn) {
  mkdirSync(dirname(filePath), { recursive: true });
  const sampleRate = 44100;
  const samples = Math.floor(seconds * sampleRate);
  const dataSize = samples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples; i += 1) {
    const t = i / sampleRate;
    const sample = Math.max(-1, Math.min(1, sampleFn(t))) * 0.55;
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * 2);
  }
  writeFileSync(filePath, buffer);
}

function envelope(t, duration) {
  const attack = Math.min(1, t / 0.03);
  const release = Math.min(1, (duration - t) / 0.08);
  return Math.max(0, Math.min(attack, release));
}

console.log("Generated synthetic art and audio assets.");
