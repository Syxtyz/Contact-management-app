import { useState } from "react";
import { View, Text, TextInput, TextInputProps, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import tw from "tailwind-react-native-classnames";

type FloatingInputProps = TextInputProps & {
  label: string;
  secure?: boolean;
};

export default function CustomTextInput({ label, secure = false, value, onChangeText, ...props }: FloatingInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const floating = isFocused || (value?.toString().length ?? 0) > 0;

  return (
    <View style={tw`mb-4`}>
      {floating && <Text style={tw`ml-2 mb-1 text-sm text-gray-700`}>{label}</Text>}
      <View style={tw`relative`}>
        <TextInput
          {...props}
          secureTextEntry={secure && !showPassword}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={floating ? "" : label}
          style={tw`border border-gray-300 rounded p-2 pr-10`}
        />
        {secure && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={tw`absolute right-3 top-1/2 -mt-2.5`}
          >
            {showPassword ? (
              <EyeOff size={20} color="gray" />
            ) : (
              <Eye size={20} color="gray" />
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}