import * as Haptics from "expo-haptics";

export type HapticStyle = "light" | "success" | "warning";

export function triggerHaptic(style: HapticStyle) {
  if (style === "success") {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return;
  }

  if (style === "warning") {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    return;
  }

  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}
