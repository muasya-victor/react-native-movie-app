// components/UI/AppleStyleHeader.jsx
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface AppleStyleHeaderProps {
  title: string;
  subText?: string;
  onMoreActionsPress?: () => void;
  customActions?: React.ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  showBorder?: boolean;
}

export default function AppleStyleHeader({
  title,
  subText,
  onMoreActionsPress,
  customActions,
  backgroundColor = "bg-white",
  titleColor = "text-black",
  subtitleColor = "text-gray-500",
  showBorder = true,
}: AppleStyleHeaderProps) {
  const insets = useSafeAreaInsets();

  const handleMoreActionsPress = () => {
    onMoreActionsPress?.();
  };

  return (
    <View
      className={`${backgroundColor} px-4 ${
        showBorder ? "border-b border-gray-200" : ""
      }`}
      style={{
        paddingTop: insets.top + 12,
        paddingBottom: 12,
      }}
    >
      <View className="flex-row items-center justify-between">
        {/* Title and count */}
        <View className="flex-1">
          <Text className={`text-2xl font-bold ${titleColor}`}>{title}</Text>
          {subText && (
            <Text className={`${subtitleColor} text-sm mt-0.5`}>{subText}</Text>
          )}
        </View>

        {/* Actions */}
        <View className="flex-row items-center gap-3">
          {/* Custom actions slot */}
          {customActions}

          {/* More actions menu */}
          <TouchableOpacity
            className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center active:scale-95"
            onPress={handleMoreActionsPress}
          >
            <Text className="text-gray-600 text-lg">⋯</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
