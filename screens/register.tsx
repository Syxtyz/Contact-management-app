import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, Pressable, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from "react-native";
import { RootStackParamList } from "../types/props";
import { useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { setDoc, doc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import tw from "tailwind-react-native-classnames";
import { Eye, EyeOff } from "lucide-react-native";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailLabel, setEmailLabel] = useState(false);
    const [passwordLabel, setPasswordLabel] = useState(false);
    const [confirmLabel, setConfirmLabel] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { width } = Dimensions.get("window");
    const isWeb = Platform.OS === "web";
    const isLargeScreen = width >= 768;

    const handleError = () => setError("");

    const isDisabled =
        !email || 
        !password || 
        !confirmPassword || 
        password.length < 6 ||
        !/[A-Z]/.test(password) || 
        !/[0-9]/.test(password);

    const validatePassword = (password: string) => {
        const errors = [];
        if (password.length < 6) errors.push("Must be at least 6 characters");
        if (!/[A-Z]/.test(password)) errors.push("Needs an uppercase letter");
        if (!/[a-z]/.test(password)) errors.push("Needs a lowercase letter");
        if (!/\d/.test(password)) errors.push("Needs a number");
        setPasswordError(errors.length > 0 ? errors.join("\n") : "");
    };

    const handlePasswordChange = (text: string) => {
        setPassword(text);
        validatePassword(text);
    };

    const handleRegister = async () => {
        if (!email) return setError("Email is required");
        if (!password) return setError("Password is required");
        if (password.length < 6) return setError("Password must be at least 6 characters");
        if (confirmPassword !== password) return setError("Passwords do not match");
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password.trim());
            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                uid: user.uid,
                createdAt: new Date(),
            });
            setError("");
            navigation.navigate("Login");
        } catch (error: any) {
            const errorCode = error.code;
            let errorMessage;
            switch (errorCode) {
                case "auth/email-already-in-use":
                    errorMessage = "This email is already in use.";
                    break;
                case "auth/invalid-email":
                    errorMessage = "Please enter a valid email address.";
                    break;
                case "auth/weak-password":
                    errorMessage = "Password should be at least 6 characters.";
                    break;
                default:
                    errorMessage = "An unexpected error occurred. Please try again.";
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
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
                <View style={[ tw`w-full border border-black bg-white p-5 rounded-xl`, isWeb && isLargeScreen && tw`max-w-md` ]}>
                    {emailLabel && <Text style={tw`ml-2 mb-1`}>Email Address</Text>}
                    <TextInput
                        placeholder="Enter email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={(t) => {
                            setEmail(t);
                            setEmailLabel(t.trim() !== "");
                            handleError();
                        }}
                        style={tw`border border-gray-300 rounded p-2 mb-3`}
                    />
                    {passwordLabel && <Text style={tw`ml-2 mb-1`}>Password</Text>}
                    <View>
                        <TextInput
                            placeholder="Password"
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={(t) => {
                            setPassword(t);
                            setPasswordLabel(t.trim() !== "");
                            handlePasswordChange(t);
                            handleError();
                            }}
                            style={tw`border border-gray-300 rounded p-2 pr-10 mb-3`}
                        />
                        <Pressable
                            onPress={() => setShowPassword(!showPassword)}
                            style={tw`absolute right-3 top-0 mt-2.5`}
                        >
                            {showPassword ? <EyeOff size={20} color="gray" /> : <Eye size={20} color="gray" />}
                        </Pressable>
                    </View>
                    {passwordError ? (
                        <Text style={tw`text-red-600 text-sm mb-2 text-center`}>{passwordError}</Text>
                    ) : null}
                    {confirmLabel && <Text style={tw`ml-2 mb-1`}>Confirm Password</Text>}
                    <View>
                        <TextInput
                            placeholder="Confirm Password"
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={(t) => {
                                setConfirmPassword(t);
                                setConfirmLabel(t.trim() !== "");
                                handleError();
                            }}
                            style={tw`border border-gray-300 rounded p-2 mb-3`}
                        />
                        <Pressable
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={tw`absolute right-3 top-0 mt-2.5`}
                        >
                            {showConfirmPassword ? <EyeOff size={20} color="gray" /> : <Eye size={20} color="gray" />}
                        </Pressable>
                    </View>
                    {error ? (
                        <Text style={tw`text-red-600 text-center mb-3`}>{error}</Text>
                    ) : null}
                    {loading ? (
                        <View style={tw`items-center`}>
                            <ActivityIndicator size="large" style={tw`mb-2`} />
                            <Text>Please wait...</Text>
                        </View>
                    ) : (
                        <Pressable
                            onPress={handleRegister}
                            disabled={isDisabled}
                            style={[tw`bg-gray-700 p-3 rounded w-full items-center self-center ${isDisabled ? "opacity-50" : ""}`, { width: `50%` }]}
                        >
                            <Text style={tw`text-white`}>Register</Text>
                        </Pressable>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}