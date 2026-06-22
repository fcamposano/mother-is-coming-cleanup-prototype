import { Audio } from "expo-av";

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

export async function playSound(sound: SoundKey) {
  const asset = getAsset(soundMap[sound]);

  if (!asset.sound) {
    return;
  }

  try {
    let loaded = loadedSounds.get(sound);
    if (!loaded) {
      const created = await Audio.Sound.createAsync(asset.sound, { volume: sound === "scream" ? 0.45 : 0.32 });
      loaded = created.sound;
      loadedSounds.set(sound, loaded);
    }
    await loaded.replayAsync();
  } catch (error) {
    console.log(`[sound:${sound}]`, error);
  }
}

export async function startMusic() {
  if (music || musicStarting) {
    return;
  }

  const asset = getAsset("music_panic_loop");
  if (!asset.sound) {
    return;
  }

  try {
    musicStarting = true;
    const created = await Audio.Sound.createAsync(asset.sound, {
      isLooping: true,
      volume: 0.16
    });
    music = created.sound;
    await music.playAsync();
  } catch (error) {
    console.log("[music:start]", error);
  } finally {
    musicStarting = false;
  }
}

export async function stopMusic() {
  if (!music) {
    return;
  }

  try {
    await music.stopAsync();
    await music.unloadAsync();
  } catch (error) {
    console.log("[music:stop]", error);
  } finally {
    music = undefined;
  }
}
