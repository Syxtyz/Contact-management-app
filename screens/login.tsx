import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, ScrollView, Platform, Dimensions, } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useState } from "react";
import { RootStackParamList } from "../types/props";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import tw from "tailwind-react-native-classnames";
import CustomTextInput from "../components/customTextInput";
  
type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isLargeScreen = width >= 768;

export default function LoginScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
  
    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please enter your email and password.");
            return;
        } else {
            setLoading(true);
            try {
            await signInWithEmailAndPassword(auth, email, password);
            } catch (error: any) {
            setError("Please check your email and password and try again.");
            } finally {
            setLoading(false);
            }
        }
    };
  
    const handleError = () => {
        setError("");
    };
  
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={tw`flex-1`}
        >
            <ScrollView
            contentContainerStyle={tw`flex-grow justify-center items-center px-4 py-8`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            >
                <View
                    style={[
                    tw`w-full border border-black bg-white p-5 rounded-xl`,
                    isWeb && isLargeScreen && tw`max-w-md`,
                    ]}
                >
                    <View>
                    <CustomTextInput
                        label="Email Address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={(t) => {
                            setEmail(t);
                            handleError();
                        }}
                    />
                    <CustomTextInput
                        label="Password"
                        secure
                        value={password}
                        onChangeText={(t) => {
                            setPassword(t);
                            handleError();
                        }}
                    />
                    </View>
                    {error ? (
                        <Text style={tw`text-red-600 mb-3 font-medium text-center`}>
                            {error}
                        </Text>
                    ) : null}
                    {loading ? (
                        <View>
                            <ActivityIndicator size="large" style={tw`mb-3`} />
                            <Text style={tw`self-center`}>Please wait...</Text>
                        </View>
                    ) : (
                        <View
                            style={[
                            isWeb && isLargeScreen
                                ? tw`flex-row`
                                : tw`flex-row`,
                            ]}
                        >
                            <Pressable
                            style={[
                                tw`bg-gray-700 p-3 rounded items-center`,
                                isWeb && isLargeScreen
                                ? tw`flex-1 mr-1.5`
                                : tw`flex-1 mr-1.5`,
                            ]}
                            onPress={() => {
                                handleError();
                                handleLogin();
                            }}
                            disabled={loading}
                            >
                            <Text style={tw`text-white font-semibold`}>Login</Text>
                            </Pressable>
                            <Pressable
                            style={[
                                tw`bg-gray-700 p-3 rounded items-center`,
                                isWeb && isLargeScreen
                                ? tw`flex-1 ml-1.5`
                                : tw`flex-1 ml-1.5`,
                            ]}
                            onPress={() => navigation.navigate("Register")}
                            >
                            <Text style={tw`text-white font-semibold`}>Register</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}