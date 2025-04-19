import React, { useState } from "react";
import { Modal, View, Text, TextInput, Pressable, ScrollView } from "react-native";
import tw from "tailwind-react-native-classnames";
import { MaterialIcons } from "@expo/vector-icons";
import { ContactCardProps } from "../types/props";

export default function ContactCard({ visible, onClose, onAdd }: ContactCardProps ) {
    const [name, setName] = useState("");
    const [addresses, setAddresses] = useState([""]);
    const [nameError, setNameError] = useState("");
    const [addressErrors, setAddressErrors] = useState<string[]>([]);
    const [addressErrorMessage, setAddressErrorMessage] = useState("");

    const handleAddAddressField = () => {
        setAddresses([...addresses, ""]);
        setAddressErrors([...addressErrors, ""]);
    };

    const handleChangeAddress = (text: string, index: number) => {
        const updated = [...addresses];
        updated[index] = text;
        setAddresses(updated);
        const updatedErrors = [...addressErrors];
        updatedErrors[index] = text.trim() === "" ? "Address cannot be empty" : "";
        setAddressErrors(updatedErrors);
        const anyEmpty = updatedErrors.some(err => err !== "");
        setAddressErrorMessage(anyEmpty ? "Address cannot be empty" : "");
    };

    const handleSubmit = () => {
        let isValid = true;
        if (name.trim() === "") {
            setNameError("Name is required");
            isValid = false;
        } else {
            setNameError("");
        }
        const updatedErrors = addresses.map((addr) =>
            addr.trim() === "" ? "Address cannot be empty" : ""
        );
        setAddressErrors(updatedErrors);
        const hasEmpty = updatedErrors.some((err) => err !== "");
        setAddressErrorMessage(hasEmpty ? "Address cannot be empty" : "");
        if (hasEmpty || name.trim() === "") {
            isValid = false;
        }
        if (isValid) {
            const trimmedAddresses = addresses.map(a => a.trim()).filter(Boolean);
            onAdd(name.trim(), trimmedAddresses);
            setName("");
            setAddresses([""]);
            setAddressErrors([]);
            setAddressErrorMessage("");
            onClose();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-40 px-4`}>
                <View style={tw`bg-white w-full rounded-2xl p-5 shadow-lg`}>
                    <Text style={tw`text-2xl font-bold text-gray-800 mb-4`}>Add New Contact</Text>

                    <ScrollView style={tw`max-h-96`}>
                        <Text style={tw`text-base text-gray-700 font-semibold`}>Name:</Text>
                        <TextInput
                            value={name}
                            onChangeText={(text) => {
                                setName(text);
                                setNameError(text.trim() === "" ? "Name is required" : "");
                            }}
                            placeholder="Enter name"
                            style={tw`border px-3 py-2 rounded-2xl mt-1 mb-2 ${
                                nameError ? "border-red-500" : "border-gray-300"
                            }`}
                        />
                        {nameError ? (
                            <Text style={tw`text-red-500 text-sm mb-2`}>{nameError}</Text>
                        ) : null}

                        <Text style={tw`text-base text-gray-700 font-semibold mt-3`}>Addresses:</Text>

                        {addresses.map((addr, idx) => (
                            <View key={idx} style={tw`flex-row items-center mb-2`}>
                                <TextInput
                                    value={addr}
                                    onChangeText={(text) => handleChangeAddress(text, idx)}
                                    placeholder={`Address ${idx + 1}`}
                                    style={tw`flex-1 border px-3 py-2 rounded-2xl mr-2 ${
                                        addressErrors[idx] ? "border-red-500" : "border-gray-300"
                                    }`}
                                />
                                <Pressable
                                    onPress={() => {
                                        const updated = [...addresses];
                                        updated.splice(idx, 1);
                                        setAddresses(updated);

                                        const updatedErrors = [...addressErrors];
                                        updatedErrors.splice(idx, 1);
                                        setAddressErrors(updatedErrors);

                                        const anyEmpty = updatedErrors.some(err => err !== "");
                                        setAddressErrorMessage(anyEmpty ? "Address cannot be empty" : "");
                                    }}
                                    style={tw`px-2 py-1 bg-red-500 rounded-full`}
                                >
                                    <MaterialIcons name="close" size={20} color="white" />
                                </Pressable>
                            </View>
                        ))}

                        {addressErrorMessage ? (
                            <Text style={tw`text-red-500 text-sm mb-1 ml-1`}>
                                {addressErrorMessage}
                            </Text>
                        ) : null}
                    </ScrollView>
                    <View style={tw`flex-row items-center justify-between mt-4`}>
                        <Pressable onPress={handleAddAddressField}>
                            <Text style={tw`text-blue-600 font-semibold`}>+ Add Address</Text>
                        </Pressable>
                        <View style={tw`flex-row`}>
                            <Pressable onPress={onClose} style={tw`bg-gray-300 px-4 py-2 rounded-full mr-4`}>
                                <Text style={tw`text-gray-800 font-semibold`}>Cancel</Text>
                            </Pressable>
                            <Pressable onPress={handleSubmit} style={tw`bg-blue-600 px-4 py-2 rounded-full`}>
                                <Text style={tw`text-white font-semibold`}>Add</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}