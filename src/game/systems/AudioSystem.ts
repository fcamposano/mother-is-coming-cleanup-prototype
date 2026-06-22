export type SoundKey = "clean" | "wrongTool" | "motherArrival" | "scream" | "victory";

export function playSound(sound: SoundKey) {
  // Placeholder seam for expo-av/expo-audio. Add sound files to AssetRegistry, preload them,
  // then route these stable game event names to concrete assets.
  console.log(`[sound:${sound}]`);
}
