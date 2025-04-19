import { View, Text, Pressable, TextInput, ScrollView, ActivityIndicator, SafeAreaView, Platform, StatusBar } from "react-native";
import tw from "tailwind-react-native-classnames";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { useEffect, useState } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { MaterialIcons } from "@expo/vector-icons";

export default function ProfileScreen() {
    const user = auth.currentUser;
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [birthday, setBirthday] = useState("");
    const [bio, setBio] = useState("");
    const [email, setEmail] = useState(user?.email || "");

    const [isEditingFirstname, setIsEditingFirstname] = useState(false);
    const [isEditingLastname, setIsEditingLastname] = useState(false);
    const [isEditingBirthday, setIsEditingBirthday] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setFirstname(data.firstname || "");
                    setLastname(data.lastname || "");
                    setBirthday(data.birthday || "");
                    setBio(data.bio || "");
                }
                setLoading(false);
            }
        };
        fetchProfile();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        await setDoc(doc(db, "users", user.uid), {
            firstname,
            lastname,
            birthday,
            bio,
            email,
        });
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const isAnyEditing = isEditingFirstname || isEditingLastname || isEditingBirthday || isEditingBio;

    if (loading) {
        return (
            <View style={tw`flex-1 items-center justify-center`}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={tw`mt-2 text-lg`}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={[ tw`flex-1 m-2 bg-gray-100 items-center`, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0} ]}>
            <ScrollView style={tw`flex-1 w-full h-full`} showsVerticalScrollIndicator={false} contentContainerStyle={tw`items-center`}>
                <View style={tw`items-center mb-4`}>
                    <View style={tw`w-20 h-20 bg-gray-300 rounded-full items-center justify-center`}>
                        <MaterialIcons name="person" size={40} color="white" />
                    </View>
                    <Text style={tw`text-xl font-bold mt-2 text-gray-700`}>
                        {firstname || lastname ? `${firstname} ${lastname}` : "N/A"}
                    </Text>
                    <Text style={tw`text-sm text-gray-500`}>{email}</Text>
                </View>
                <View style={tw`flex-1 w-full border border-gray-300 rounded-2xl p-4 bg-white`}>
                    <Text style={tw`text-gray-600 font-bold text-xl mb-2`}>Personal Info</Text>
                    <View style={tw`flex-row w-full mb-6`}>
                        <View style={tw`flex-1 mr-2 relative`}>
                            <Text style={tw`text-gray-600 mb-1 font-bold ml-2`}>Firstname</Text>
                            <View>
                                <TextInput
                                    placeholder="N/A"
                                    value={firstname}
                                    onChangeText={setFirstname}
                                    editable={isEditingFirstname}
                                    style={tw`rounded-3xl p-2 ${isEditingFirstname ? 'border border-gray-300 bg-gray-100' : ''}`}
                                />
                                <Pressable
                                    onPress={() => {
                                        setIsEditingFirstname(!isEditingFirstname);
                                        if (isEditingFirstname) handleSave();
                                    }}
                                    style={tw`absolute top-0 right-0`}
                                >
                                    <MaterialIcons
                                        name={isEditingFirstname ? "check" : "edit"}
                                        size={isEditingFirstname ? 22 : 18}
                                        color={isEditingFirstname ? "green" : "gray"}
                                        style={tw`p-2 ${!isEditingFirstname ? 'border border-gray-300 rounded-full' : ''}`}
                                    />
                                </Pressable>
                            </View>
                        </View>
                        <View style={tw`flex-1 ml-2 relative`}>
                            <Text style={tw`text-gray-600 mb-1 font-bold ml-2`}>Lastname</Text>
                            <View>
                                <TextInput
                                    placeholder="N/A"
                                    value={lastname}
                                    onChangeText={setLastname}
                                    editable={isEditingLastname}
                                    style={tw`rounded-3xl p-2 ${isEditingLastname ? 'border border-gray-300 bg-gray-100' : ''}`}
                                />
                                <Pressable
                                    onPress={() => {
                                        setIsEditingLastname(!isEditingLastname);
                                        if (isEditingLastname) handleSave();
                                    }}
                                    style={tw`absolute top-0 right-0`}
                                >
                                    <MaterialIcons
                                        name={isEditingLastname ? "check" : "edit"}
                                        size={isEditingLastname ? 22 : 18}
                                        color={isEditingLastname ? "green" : "gray"}
                                        style={tw`p-2 ${!isEditingLastname ? 'border border-gray-300 rounded-full' : ''}`}
                                    />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                    <View style={tw`border-b border-gray-300 mb-6`} />
                    <Text style={tw`text-gray-600 mb-1 font-bold self-center`}>Birthday</Text>
                    <View style={tw`w-full mb-6 relative`}>
                        <TextInput
                            value={birthday}
                            onChangeText={setBirthday}
                            placeholder="YYYY-MM-DD"
                            keyboardType="numeric"
                            editable={isEditingBirthday}
                            style={tw`rounded-3xl p-2 text-center ${isEditingBirthday ? 'border border-gray-300 bg-gray-100' : ''}`}
                        />
                        <Pressable
                            onPress={() => {
                                setIsEditingBirthday(!isEditingBirthday);
                                if (isEditingBirthday) handleSave();
                            }}
                            style={tw`absolute top-0 right-0`}
                        >
                            <MaterialIcons
                                name={isEditingBirthday ? "check" : "edit"}
                                size={isEditingBirthday ? 22 : 18}
                                color={isEditingBirthday ? "green" : "gray"}
                                style={tw`p-2 ${!isEditingBirthday ? 'border border-gray-300 rounded-full' : ''}`}
                            />
                        </Pressable>
                    </View>
                    <View style={tw`border-b border-gray-300 mb-6`} />
                    <Text style={tw`text-gray-600 mb-1 font-bold text-center`}>Bio</Text>
                    <View style={tw`w-full mb-4 relative`}>
                        <TextInput
                            placeholder="Write something about yourself..."
                            multiline
                            numberOfLines={3}
                            value={bio}
                            onChangeText={setBio}
                            editable={isEditingBio}
                            style={tw`rounded-2xl p-2 pr-8 text-gray-700 ${isEditingBio ? 'border border-gray-300 bg-gray-100' : ''}`}
                        />
                        <Pressable
                            onPress={() => {
                                setIsEditingBio(!isEditingBio);
                                if (isEditingBio) handleSave();
                            }}
                            style={tw`absolute top-0 right-0`}
                        >
                            <MaterialIcons
                                name={isEditingBio ? "check" : "edit"}
                                size={isEditingBio ? 22 : 18}
                                color={isEditingBio ? "green" : "gray"}
                                style={tw`p-2 ${!isEditingBio ? 'border border-gray-300 rounded-full' : ''}`}
                            />
                        </Pressable>
                    </View>
                </View>
                <Pressable
                    style={tw`bg-gray-700 px-4 py-2 rounded mt-4`}
                    onPress={handleLogout}
                    disabled={isAnyEditing}
                >
                    <Text style={tw`text-white text-center text-lg`}>Logout</Text>
                </Pressable>
                <Text style={tw`text-xs text-gray-400 mt-5`}>App version 1.0.0</Text>
            </ScrollView>
        </View>
    );
}