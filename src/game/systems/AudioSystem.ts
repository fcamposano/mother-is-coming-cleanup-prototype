import { Audio } from "expo-av";
import { Platform } from "react-native";

import { getAsset } from "../assets/AssetRegistry";

export type SoundKey = "clean" | "pickup" | "wrongTool" | "motherArrival" | "scream" | "victory";

const soundMap: Record<SoundKey, string> = {
  clean: "sfx_clean",
  pickup: "sfx_pickup",
  wrongTool: "sfx_wrong_tool",
  motherArrival: "sfx_mother_arrival",
  scream: "sfx_scream",
  victory: "sfx_victory"
};

const loadedSounds = new Map<string, Audio.Sound>();
let music: Audio.Sound | undefined;
let musicStarting = false;
let audioUnlocked = false;
let audioInitialized = false;

// ── iOS Web Audio unlock ──────────────────────────────────────────────────────
// iOS Safari suspends the AudioContext until a real user gesture.
// We install a one-time synchronous touchstart handler to unlock it immediately,
// before any async code can run (async breaks the iOS gesture chain).

let _ctx: any = null;

function getOrCreateAudioContext(): any {
  if (_ctx) return _ctx;
  const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!AC) return null;
  _ctx = new AC();
  return _ctx;
}

function syncUnlock() {
  // Must run synchronously inside a user gesture for iOS to allow audio
  try {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    // Play a silent buffer — the iOS unlock trick
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);

    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
  } catch {
    // ignore
  }
}

// Install on module load — fires on very first touch anywhere on screen
if (Platform.OS === "web" && typeof document !== "undefined") {
  const onFirstTouch = () => {
    syncUnlock();
    document.removeEventListener("touchstart", onFirstTouch);
    document.removeEventListener("click", onFirstTouch);
  };
  document.addEventListener("touchstart", onFirstTouch, { passive: true });
  document.addEventListener("click", onFirstTouch, { passive: true });
}

async function unlockWebAudio() {
  if (audioUnlocked || Platform.OS !== "web") return;
  audioUnlocked = true;

  try {
    syncUnlock();

    // Keep context alive after interruptions (phone call, background, etc.)
    const keepAlive = () => {
      if (_ctx?.state === "suspended") _ctx.resume().catch(() => {});
    };
    document.addEventListener("touchstart", keepAlive, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") keepAlive();
    });
  } catch {
    // Not supported — silent fail
  }
}

// ── Audio mode init (runs once) ───────────────────────────────────────────────

async function ensureInit() {
  if (audioInitialized) return;
  audioInitialized = true;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,     // plays even when iPhone is on silent
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
  } catch {
    // Web doesn't fully support setAudioModeAsync — that's fine
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function unlockAudio() {
  await ensureInit();
  await unlockWebAudio();
}

export async function playSound(sound: SoundKey) {
  await unlockAudio();

  const asset = getAsset(soundMap[sound]);
  if (!asset.sound) return;

  const volumes: Partial<Record<SoundKey, number>> = {
    scream: 0.75,
    victory: 0.80,
    wrongTool: 0.65,
    motherArrival: 0.65,
    pickup: 0.60,
    clean: 0.55,
  };

  try {
    let loaded = loadedSounds.get(sound);
    if (!loaded) {
      const created = await Audio.Sound.createAsync(asset.sound, {
        volume: volumes[sound] ?? 0.60
      });
      loaded = created.sound;
      loadedSounds.set(sound, loaded);
    }
    await loaded.replayAsync();
  } catch (error) {
    console.log(`[sound:${sound}]`, error);
  }
}

export async function startMusic() {
  await unlockAudio();

  if (music || musicStarting) return;

  const asset = getAsset("music_panic_loop");
  if (!asset.sound) return;

  try {
    musicStarting = true;
    const created = await Audio.Sound.createAsync(asset.sound, {
      isLooping: true,
      volume: 0.40
    });
    music = created.sound;
    await music.playAsync();
  } catch (error) {
    console.log("[music:start]", error);
  } finally {
    musicStarting = false;
  }
}

export async function setMusicRate(rate: number) {
  if (!music) return;
  try {
    await music.setRateAsync(rate, false);
  } catch {
    // platform may not support rate change — silent fail
  }
}

export async function stopMusic() {
  if (!music) return;

  try {
    await music.stopAsync();
    await music.unloadAsync();
  } catch (error) {
    console.log("[music:stop]", error);
  } finally {
    music = undefined;
  }
}
