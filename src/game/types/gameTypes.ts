import { AVPlaybackSource } from "expo-av";
import { ImageSourcePropType } from "react-native";

export type ToolType = "vacuum" | "mop" | "hand";

export type MessType = "dry_dirt" | "wet_spill" | "pickup";

export type AssetKind = "room" | "mess" | "character" | "tool" | "sound";

export type AssetDefinition = {
  key: string;
  kind: AssetKind;
  label: string;
  placeholderText?: string;
  color?: string;
  accentColor?: string;
  image?: ImageSourcePropType;
  sound?: AVPlaybackSource;
};

export type MessItemDefinition = {
  id: string;
  label: string;
  messType: MessType;
  requiredTool: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  assetKey: string;
  cleanedAssetKey?: string;
  cleanProgressRequired: number;
  scoreValue: number;
  roomAssociation?: string;
};

export type LevelDefinition = {
  id: string;
  title: string;
  roomAssetKey: string;
  worldWidth: number;
  worldHeight: number;
  timeLimitSeconds: number;
  messItems: MessItemDefinition[];
  inspector: {
    characterAssetKey: string;
    arrivalSoundKey: string;
    screamSoundKey: string;
  };
};

export type MessRuntimeState = MessItemDefinition & {
  progress: number;
  cleaned: boolean;
  wrongToolFlashUntil: number;
};

export type Camera = {
  x: number;
  y: number;
};

export type GamePhase = "playing" | "inspection" | "won" | "lost";
