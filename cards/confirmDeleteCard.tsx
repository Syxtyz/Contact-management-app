import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import tw from "tailwind-react-native-classnames";
import { ConfirmDeleteCardProps } from "../types/props";

export default function ConfirmDeleteCard({ visible, onClose, onDelete }: ConfirmDeleteCardProps) {
    return (
        <Modal visible={visible} animationType="none" transparent={true}>
            <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
                <View style={tw`bg-white p-6 rounded-lg`}>
                    <Text style={tw`text-lg font-semibold text-center`}>Are you sure you want to delete this contact?</Text>
                    <View style={tw`flex-row mt-4`}>
                        <Pressable
                            style={tw`flex-1 bg-gray-300 p-2 rounded mr-3`}
                            onPress={onClose}
                        >
                            <Text style={tw`text-center`}>Cancel</Text>
                        </Pressable>
                        <Pressable
                            style={tw`flex-1 bg-red-500 p-2 rounded ml-3`}
                            onPress={onDelete}  // Trigger the onDelete function
                        >
                            <Text style={tw`text-white text-center`}>Delete</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}