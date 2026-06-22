import { AssetDefinition } from "../types/gameTypes";

export const AssetRegistry: Record<string, AssetDefinition> = {
  room_bedroom_placeholder: {
    key: "room_bedroom_placeholder",
    kind: "room",
    label: "Bedroom",
    color: "#f8efe0",
    accentColor: "#5b8f8f"
  },
  mess_crumbs: {
    key: "mess_crumbs",
    kind: "mess",
    label: "Crumbs",
    placeholderText: "crumbs",
    color: "#9a6b36",
    accentColor: "#f0c06d"
  },
  mess_dust: {
    key: "mess_dust",
    kind: "mess",
    label: "Dust",
    placeholderText: "dust",
    color: "#a9a19a",
    accentColor: "#ded7cf"
  },
  mess_debris: {
    key: "mess_debris",
    kind: "mess",
    label: "Dry bits",
    placeholderText: "bits",
    color: "#785a42",
    accentColor: "#c7a27c"
  },
  mess_juice: {
    key: "mess_juice",
    kind: "mess",
    label: "Juice",
    placeholderText: "juice",
    color: "#d74252",
    accentColor: "#ff9aa9"
  },
  mess_mud: {
    key: "mess_mud",
    kind: "mess",
    label: "Mud",
    placeholderText: "mud",
    color: "#6b4d33",
    accentColor: "#a9784c"
  },
  mess_sticky: {
    key: "mess_sticky",
    kind: "mess",
    label: "Sticky",
    placeholderText: "sticky",
    color: "#f0a020",
    accentColor: "#ffd36d"
  },
  mess_clothes: {
    key: "mess_clothes",
    kind: "mess",
    label: "Clothes",
    placeholderText: "shirt",
    color: "#4a72d9",
    accentColor: "#a8c3ff"
  },
  mess_toys: {
    key: "mess_toys",
    kind: "mess",
    label: "Toys",
    placeholderText: "toys",
    color: "#9257c8",
    accentColor: "#d9b8ff"
  },
  mess_trash: {
    key: "mess_trash",
    kind: "mess",
    label: "Trash",
    placeholderText: "trash",
    color: "#3d8c61",
    accentColor: "#9be0b8"
  },
  character_mother_placeholder: {
    key: "character_mother_placeholder",
    kind: "character",
    label: "Mother Placeholder",
    placeholderText: "MOM",
    color: "#2c2c2c",
    accentColor: "#ff5b6e"
  },
  tool_vacuum: {
    key: "tool_vacuum",
    kind: "tool",
    label: "Vacuum",
    placeholderText: "VAC",
    color: "#3457d5",
    accentColor: "#b9c9ff"
  },
  tool_mop: {
    key: "tool_mop",
    kind: "tool",
    label: "Mop",
    placeholderText: "MOP",
    color: "#008c8c",
    accentColor: "#a7f0e8"
  },
  tool_hand: {
    key: "tool_hand",
    kind: "tool",
    label: "Hand",
    placeholderText: "HAND",
    color: "#d87932",
    accentColor: "#ffd2a8"
  },
  sfx_clean: { key: "sfx_clean", kind: "sound", label: "Clean sound placeholder" },
  sfx_wrong_tool: { key: "sfx_wrong_tool", kind: "sound", label: "Wrong tool sound placeholder" },
  sfx_mother_arrival: { key: "sfx_mother_arrival", kind: "sound", label: "Mother arrival placeholder" },
  sfx_scream: { key: "sfx_scream", kind: "sound", label: "Scream placeholder" },
  sfx_victory: { key: "sfx_victory", kind: "sound", label: "Victory placeholder" }
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
