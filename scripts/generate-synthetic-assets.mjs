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

function blendRect(image, x, y, w, h, color) {
  for (let yy = Math.floor(y); yy < Math.ceil(y + h); yy += 1) {
    for (let xx = Math.floor(x); xx < Math.ceil(x + w); xx += 1) {
      blend(image, xx, yy, color);
    }
  }
}

function gradientRect(image, x, y, w, h, topColor, bottomColor) {
  const top = rgba(topColor);
  const bottom = rgba(bottomColor);
  for (let yy = Math.floor(y); yy < Math.ceil(y + h); yy += 1) {
    const t = Math.max(0, Math.min(1, (yy - y) / h));
    const r = Math.round(top.r + (bottom.r - top.r) * t);
    const g = Math.round(top.g + (bottom.g - top.g) * t);
    const b = Math.round(top.b + (bottom.b - top.b) * t);
    const a = Math.round(top.a + (bottom.a - top.a) * t);
    for (let xx = Math.floor(x); xx < Math.ceil(x + w); xx += 1) set(image, xx, yy, r, g, b, a);
  }
}

function shadow(image, x, y, w, h, opacity = 0.16, spread = 18) {
  for (let i = spread; i > 0; i -= 1) {
    const alpha = Math.round((opacity * 255 * (spread - i + 1)) / spread)
      .toString(16)
      .padStart(2, "0");
    blendRect(image, x + i * 0.35, y + i * 0.55, w, h, `#000000${alpha}`);
  }
}

function insetHighlight(image, x, y, w, h, light = "#ffffff35", dark = "#00000022") {
  blendRect(image, x, y, w, 3, light);
  blendRect(image, x, y, 3, h, light);
  blendRect(image, x, y + h - 4, w, 4, dark);
  blendRect(image, x + w - 4, y, 4, h, dark);
}

function woodPlanks(image, x, y, w, h) {
  gradientRect(image, x, y, w, h, "#c89457", "#b6783f");
  for (let yy = y; yy < y + h; yy += 92) {
    line(image, x, yy, x + w, yy + 14, "#8e5b2e55", 2);
    line(image, x, yy + 3, x + w, yy + 17, "#f3c88833", 1);
  }
  for (let xx = x - 80; xx < x + w; xx += 138) {
    line(image, xx, y, xx + 180, y + h, "#8b552a44", 2);
  }
  dots(image, 900, { x, y, w, h }, ["#5c351722", "#e7ba7f28", "#ffffff18"], 1, 2);
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
  woodPlanks(image, 0, 0, 980, 1480);
  shadow(image, 34, 34, 912, 1412, 0.22, 26);
  gradientRect(image, 34, 34, 912, 1412, "#f0d5a9", "#d7aa6c");
  for (let y = 64; y < 1418; y += 82) line(image, 34, y, 946, y + 10, "#9f663545", 2);
  for (let x = 58; x < 930; x += 118) line(image, x, 34, x + 94, 1446, "#f7d49b30", 2);
  dots(image, 1200, { x: 42, y: 42, w: 896, h: 1396 }, ["#7a472318", "#ffffff22", "#3b241015", "#e8bd7a26"], 1, 2);

  // Desk with believable top-down objects.
  shadow(image, 74, 118, 250, 154, 0.22, 18);
  gradientRect(image, 74, 118, 250, 154, "#9a5d2f", "#75401f");
  insetHighlight(image, 74, 118, 250, 154);
  for (let x = 86; x < 310; x += 36) line(image, x, 124, x + 20, 266, "#5e341b55", 1);
  shadow(image, 108, 142, 94, 62, 0.12, 8);
  gradientRect(image, 108, 142, 94, 62, "#353943", "#171a20");
  rect(image, 118, 151, 74, 43, "#5f7d95");
  rect(image, 210, 152, 78, 40, "#f3efe4");
  line(image, 218, 164, 280, 164, "#b89f7f", 2);
  line(image, 218, 178, 270, 178, "#b89f7f", 2);
  ellipse(image, 284, 228, 20, 20, "#6b3f24");
  ellipse(image, 284, 228, 13, 13, "#2f1c12");

  // Closet and raised doors.
  shadow(image, 500, 48, 300, 250, 0.2, 20);
  gradientRect(image, 500, 48, 300, 250, "#bfa17b", "#91704e");
  insetHighlight(image, 500, 48, 300, 250);
  line(image, 650, 48, 650, 298, "#5f3c22", 6);
  ellipse(image, 624, 170, 7, 7, "#2f2119");
  ellipse(image, 676, 170, 7, 7, "#2f2119");
  dots(image, 160, { x: 512, y: 62, w: 276, h: 220 }, ["#ffffff18", "#5d3d2222", "#d6b68a24"], 1, 2);

  // Bed with pillows, layered blanket, wrinkles, and drop shadow.
  shadow(image, 548, 242, 330, 280, 0.25, 24);
  gradientRect(image, 548, 242, 330, 280, "#8bb9d3", "#5f96ba");
  insetHighlight(image, 548, 242, 330, 280);
  gradientRect(image, 588, 268, 250, 96, "#f8f0e2", "#d9cfc1");
  line(image, 712, 276, 712, 358, "#b7aa9a55", 3);
  gradientRect(image, 584, 382, 258, 112, "#477da8", "#2f6792");
  for (let i = 0; i < 7; i += 1) line(image, 600 + i * 35, 392, 582 + i * 38, 486, "#ffffff1c", 2);
  line(image, 584, 382, 842, 382, "#e5f3ff55", 3);

  // Warm rug with woven fibers.
  shadow(image, 184, 458, 322, 330, 0.18, 18);
  gradientRect(image, 184, 458, 322, 330, "#d6a92d", "#b8841f");
  ellipse(image, 345, 623, 178, 154, "#f1cb5fdd");
  for (let i = 0; i < 120; i += 1) {
    const y = 482 + rand() * 280;
    line(image, 210 + rand() * 250, y, 242 + rand() * 230, y + rand() * 8 - 4, "#8f641e35", 1);
  }
  insetHighlight(image, 184, 458, 322, 330, "#fff1a93a", "#5d3b1126");

  // Window with daylight spill.
  blendRect(image, 610, 650, 300, 300, "#aeeaf222");
  shadow(image, 684, 706, 210, 150, 0.14, 12);
  gradientRect(image, 684, 706, 210, 150, "#8ed2dc", "#5faeba");
  line(image, 789, 706, 789, 856, "#f9ffff", 6);
  line(image, 684, 781, 894, 781, "#f9ffff", 6);
  insetHighlight(image, 684, 706, 210, 150, "#ffffff66", "#28626e33");

  // Door and threshold.
  shadow(image, 700, 1170, 150, 238, 0.22, 18);
  gradientRect(image, 700, 1170, 150, 238, "#a47745", "#704920");
  insetHighlight(image, 700, 1170, 150, 238);
  ellipse(image, 824, 1288, 8, 8, "#312116");
  rect(image, 682, 1406, 190, 18, "#4b2f19");
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
    ellipse(image, 112, 112, 82, 28, "#00000024");
    if (mode === "scatter") {
      dots(image, 160, { x: 24, y: 28, w: 172, h: 102 }, palette, 2, 8);
      dots(image, 38, { x: 42, y: 46, w: 130, h: 64 }, ["#fff4ceaa", "#3b2410aa"], 1, 4);
    }
    if (mode === "cloud") {
      dots(image, 120, { x: 28, y: 36, w: 164, h: 82 }, palette, 7, 19);
      for (let i = 0; i < 28; i += 1) line(image, 38 + rand() * 142, 54 + rand() * 52, 50 + rand() * 132, 56 + rand() * 56, "#7d777055", 1);
    }
    if (mode === "spill") {
      ellipse(image, 108, 84, 80, 46, palette[0]);
      ellipse(image, 72, 66, 42, 24, palette[1]);
      ellipse(image, 144, 102, 48, 28, palette[0]);
      ellipse(image, 168, 56, 14, 14, palette[2]);
      ellipse(image, 86, 72, 20, 9, "#ffffff50");
      ellipse(image, 134, 96, 24, 10, "#ffffff38");
      dots(image, 20, { x: 44, y: 42, w: 130, h: 74 }, ["#ffffff44", "#5a1d2026"], 1, 3);
    }
    if (mode === "prints") {
      for (let i = 0; i < 5; i += 1) {
        ellipse(image, 58 + i * 28, 52 + (i % 2) * 42, 20, 32, palette[i % palette.length]);
        ellipse(image, 50 + i * 28, 20 + (i % 2) * 42, 5, 5, palette[1]);
        ellipse(image, 64 + i * 28, 18 + (i % 2) * 42, 5, 5, palette[1]);
        ellipse(image, 58 + i * 28, 52 + (i % 2) * 42, 12, 20, "#2a160a45");
      }
    }
    if (mode === "pile") {
      for (let i = 0; i < 16; i += 1) {
        const x = 42 + rand() * 140;
        const y = 48 + rand() * 78;
        const color = pick(palette);
        ellipse(image, x + 4, y + 6, 28 + rand() * 20, 15 + rand() * 16, "#00000018");
        ellipse(image, x, y, 26 + rand() * 20, 16 + rand() * 15, color);
        line(image, x - 20, y - 3, x + 20, y + 8, "#ffffff35", 2);
      }
    }
    if (mode === "blocks") {
      for (let i = 0; i < 13; i += 1) {
        const x = 35 + rand() * 140;
        const y = 35 + rand() * 88;
        const w = 28 + rand() * 28;
        const h = 20 + rand() * 22;
        rect(image, x + 4, y + 5, w, h, "#00000025");
        gradientRect(image, x, y, w, h, pick(palette), pick(palette));
        insetHighlight(image, x, y, w, h, "#ffffff55", "#00000022");
      }
      ellipse(image, 146, 55, 24, 24, "#ef476f");
      ellipse(image, 138, 48, 8, 8, "#ffffff66");
    }
  });
}

writePng(260, 360, join(dirs.characters, "mother-cartoon.png"), (image) => {
  ellipse(image, 132, 318, 72, 22, "#00000028");
  gradientRect(image, 82, 118, 98, 150, "#bf3042", "#7f1f2a");
  insetHighlight(image, 82, 118, 98, 150, "#ffffff35", "#00000032");
  ellipse(image, 82, 170, 22, 78, "#54332a");
  ellipse(image, 178, 170, 22, 78, "#54332a");
  line(image, 73, 162, 58, 238, "#f0b98f", 12);
  line(image, 187, 162, 206, 238, "#f0b98f", 12);
  rect(image, 94, 260, 30, 74, "#2f3035");
  rect(image, 138, 260, 30, 74, "#2f3035");
  ellipse(image, 109, 337, 22, 9, "#1d1d20");
  ellipse(image, 153, 337, 22, 9, "#1d1d20");
  ellipse(image, 130, 72, 54, 58, "#e8b78f");
  ellipse(image, 130, 44, 62, 35, "#3a241d");
  ellipse(image, 87, 70, 20, 48, "#3a241d");
  ellipse(image, 173, 70, 20, 48, "#3a241d");
  ellipse(image, 112, 70, 6, 5, "#171313");
  ellipse(image, 148, 70, 6, 5, "#171313");
  line(image, 105, 58, 120, 54, "#171313", 2);
  line(image, 140, 54, 156, 58, "#171313", 2);
  ellipse(image, 130, 84, 6, 5, "#c98d70");
  line(image, 108, 100, 152, 100, "#731d25", 4);
  blendRect(image, 102, 86, 20, 10, "#d86c7b45");
  blendRect(image, 140, 86, 20, 10, "#d86c7b45");
});

for (const [name, color, accent] of [
  ["vacuum.png", "#3457d5", "#b9c9ff"],
  ["mop.png", "#008c8c", "#a7f0e8"],
  ["hand.png", "#d87932", "#ffd2a8"]
]) {
  writePng(160, 160, join(dirs.tools, name), (image) => {
    ellipse(image, 84, 88, 62, 58, "#00000022");
    ellipse(image, 80, 80, 68, 68, accent);
    ellipse(image, 80, 80, 52, 52, color);
    ellipse(image, 64, 58, 22, 13, "#ffffff42");
    if (name === "vacuum.png") {
      gradientRect(image, 48, 78, 66, 35, "#f6f7fa", "#bfc6d2");
      insetHighlight(image, 48, 78, 66, 35, "#ffffff88", "#1d243044");
      line(image, 92, 78, 128, 38, "#d8dde6", 8);
      line(image, 98, 74, 133, 34, "#ffffff55", 3);
      ellipse(image, 58, 118, 8, 8, "#242830");
      ellipse(image, 106, 118, 8, 8, "#242830");
    }
    if (name === "mop.png") {
      line(image, 86, 26, 78, 112, "#e7d2a6", 8);
      line(image, 90, 26, 82, 112, "#ffffff55", 2);
      for (let i = 0; i < 10; i += 1) line(image, 58 + i * 5, 108, 40 + i * 10, 140, "#f3f1e7", 4);
      for (let i = 0; i < 7; i += 1) line(image, 62 + i * 7, 116, 55 + i * 8, 144, "#9fd8d2", 2);
    }
    if (name === "hand.png") {
      ellipse(image, 80, 92, 34, 30, "#e9ae82");
      ellipse(image, 72, 84, 12, 9, "#f7c59f");
      for (let i = 0; i < 5; i += 1) {
        ellipse(image, 48 + i * 16, 60 + Math.abs(i - 2) * 3, 8, 30 - Math.abs(i - 2) * 3, "#f7c59f");
        line(image, 48 + i * 16, 50, 48 + i * 16, 74, "#c9825d55", 1);
      }
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
