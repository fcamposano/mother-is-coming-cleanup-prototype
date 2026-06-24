import { AssetDefinition } from "../types/gameTypes";

export const AssetRegistry: Record<string, AssetDefinition> = {
  room_bedroom_placeholder: {
    key: "room_bedroom_placeholder",
    kind: "room",
    label: "Bedroom",
    color: "#f8efe0",
    accentColor: "#5b8f8f",
    image: require("../../../assets/rooms/bedroom-cartoon.png")
  },
  mess_crumbs: {
    key: "mess_crumbs",
    kind: "mess",
    label: "Crumbs",
    placeholderText: "crumbs",
    color: "#9a6b36",
    accentColor: "#f0c06d",
    image: require("../../../assets/messes/crumbs.png")
  },
  mess_dust: {
    key: "mess_dust",
    kind: "mess",
    label: "Dust",
    placeholderText: "dust",
    color: "#a9a19a",
    accentColor: "#ded7cf",
    image: require("../../../assets/messes/dust.png")
  },
  mess_debris: {
    key: "mess_debris",
    kind: "mess",
    label: "Dry bits",
    placeholderText: "bits",
    color: "#785a42",
    accentColor: "#c7a27c",
    image: require("../../../assets/messes/debris.png")
  },
  mess_juice: {
    key: "mess_juice",
    kind: "mess",
    label: "Juice",
    placeholderText: "juice",
    color: "#d74252",
    accentColor: "#ff9aa9",
    image: require("../../../assets/messes/juice.png")
  },
  mess_mud: {
    key: "mess_mud",
    kind: "mess",
    label: "Mud",
    placeholderText: "mud",
    color: "#6b4d33",
    accentColor: "#a9784c",
    image: require("../../../assets/messes/mud.png")
  },
  mess_sticky: {
    key: "mess_sticky",
    kind: "mess",
    label: "Sticky",
    placeholderText: "sticky",
    color: "#f0a020",
    accentColor: "#ffd36d",
    image: require("../../../assets/messes/sticky.png")
  },
  mess_clothes: {
    key: "mess_clothes",
    kind: "mess",
    label: "Clothes",
    placeholderText: "shirt",
    color: "#4a72d9",
    accentColor: "#a8c3ff",
    image: require("../../../assets/messes/clothes.png")
  },
  mess_toys: {
    key: "mess_toys",
    kind: "mess",
    label: "Toys",
    placeholderText: "toys",
    color: "#9257c8",
    accentColor: "#d9b8ff",
    image: require("../../../assets/messes/toys.png")
  },
  mess_trash: {
    key: "mess_trash",
    kind: "mess",
    label: "Trash",
    placeholderText: "trash",
    color: "#3d8c61",
    accentColor: "#9be0b8",
    image: require("../../../assets/messes/trash.png")
  },
  character_mother_placeholder: {
    key: "character_mother_placeholder",
    kind: "character",
    label: "Mother",
    placeholderText: "MOM",
    color: "#2c2c2c",
    accentColor: "#ff5b6e",
    image: require("../../../assets/characters/mother-real.png")
  },
  character_ignacio: {
    key: "character_ignacio",
    kind: "character",
    label: "Ignacio",
    placeholderText: "😈",
    color: "#3a5a7a",
    accentColor: "#90c0e0",
    image: require("../../../assets/characters/ignacio.png")
  },
  character_mother_kiss: {
    key: "character_mother_kiss",
    kind: "character",
    label: "Mother Kiss",
    placeholderText: "💋",
    color: "#ff3366",
    accentColor: "#ffb3c6",
    image: require("../../../assets/characters/mother-kiss.png")
  },
  character_mother_scream: {
    key: "character_mother_scream",
    kind: "character",
    label: "Mother Scream",
    placeholderText: "😱",
    color: "#cc2244",
    accentColor: "#ff6688",
    image: require("../../../assets/characters/mother-scream.png")
  },
  tool_vacuum: {
    key: "tool_vacuum",
    kind: "tool",
    label: "Vacuum",
    placeholderText: "VAC",
    color: "#3457d5",
    accentColor: "#b9c9ff",
    image: require("../../../assets/tools/vacuum.png")
  },
  tool_mop: {
    key: "tool_mop",
    kind: "tool",
    label: "Mop",
    placeholderText: "MOP",
    color: "#008c8c",
    accentColor: "#a7f0e8",
    image: require("../../../assets/tools/mop.png")
  },
  tool_hand: {
    key: "tool_hand",
    kind: "tool",
    label: "Hand",
    placeholderText: "HAND",
    color: "#d87932",
    accentColor: "#ffd2a8",
    image: require("../../../assets/tools/hand.png")
  },
  sfx_clean: { key: "sfx_clean", kind: "sound", label: "Clean sound", sound: require("../../../assets/audio/clean.wav") },
  sfx_pickup: { key: "sfx_pickup", kind: "sound", label: "Pickup sound", sound: require("../../../assets/audio/pickup.wav") },
  sfx_wrong_tool: { key: "sfx_wrong_tool", kind: "sound", label: "Wrong tool sound", sound: require("../../../assets/audio/wrong-tool.wav") },
  sfx_mother_arrival: { key: "sfx_mother_arrival", kind: "sound", label: "Mother arrival sound", sound: require("../../../assets/audio/wrong-tool.wav") },
  sfx_scream: { key: "sfx_scream", kind: "sound", label: "Scream sound", sound: require("../../../assets/audio/scream.wav") },
  sfx_victory: { key: "sfx_victory", kind: "sound", label: "Victory sound", sound: require("../../../assets/audio/victory.wav") },
  music_panic_loop: { key: "music_panic_loop", kind: "sound", label: "Panic loop", sound: require("../../../assets/audio/panic-loop.wav") }
};

export function getAsset(assetKey: string): AssetDefinition {
  const asset = AssetRegistry[assetKey];

  if (!asset) {
    return {
      key: assetKey,
      kind: "mess",
      label: assetKey,
      placeholderText: "?",
      color: "#ff00aa",
      accentColor: "#ffffff"
    };
  }

  return asset;
}

// Real-person photos/cutouts should only be added here with consent and distribution permission.
// Character replacement should be a config change: assign an image module to the asset key above.
