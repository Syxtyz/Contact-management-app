import React, { useEffect, useRef, useState } from "react";
import { Modal, View, Text, Pressable, ScrollView, TextInput } from "react-native";
import tw from "tailwind-react-native-classnames";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { ContactInfoProps } from "../types/props";
import { DeleteSaveProps } from "../types/props";

export default function ContactInfoCard({ visible, onClose, contact, onSave }: DeleteSaveProps) {
  const [name, setName] = useState("");
  const [addresses, setAddresses] = useState<string[]>([]);
  const [nameError, setNameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const addressRefs = useRef<TextInput[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setAddresses(contact.addresses);
      setNameError("");
      setAddressError("");
    }
  }, [contact]);

  const updateAddress = (index: number, newAddress: string) => {
    const updated = [...addresses];
    updated[index] = newAddress;
    setAddresses(updated);
    if (newAddress.trim() !== "") setAddressError("");
  };

  const addAddress = () => {
    setAddresses((prev) => [...prev, ""]);
    setTimeout(() => {
      const nextIndex = addresses.length;
      addressRefs.current[nextIndex]?.focus();
    }, 100);
  };

  const deleteAddress = (index: number) => {
    const updated = [...addresses];
    updated.splice(index, 1);
    setAddresses(updated);
  };

  const handleSave = async () => {
    let isValid = true;
    if (name.trim() === "") {
      setNameError("Name is required");
      isValid = false;
    } else {
      setNameError("");
    }
    const hasEmptyAddress = addresses.some((addr) => addr.trim() === "");
    if (hasEmptyAddress) {
      setAddressError("Address cannot be empty");
      isValid = false;
    } else {
      setAddressError("");
    }
    if (isValid && contact) {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        const contactRef = doc(db, "contacts", userId);
        const docSnap = await getDoc(contactRef);
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        const existingContacts: ContactInfoProps[] = data.contacts || [];
        const updatedContact: ContactInfoProps = {
          name: name.trim(),
          addresses: addresses.map((a) => a.trim()).filter((a) => a),
        };
        const updatedContacts = existingContacts.map((c) =>
          c.name === contact.name &&
          JSON.stringify(c.addresses) === JSON.stringify(contact.addresses)
            ? updatedContact
            : c
        );
        setLoading(true);
        await updateDoc(contactRef, {
          contacts: updatedContacts,
        });
        onSave?.(updatedContact);
        onClose();
      } catch (err) {
        console.error("Error updating contact:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-40 px-4`}>
        <View style={tw`bg-white w-full rounded-2xl p-5 shadow-lg`}>
          <View style={tw`flex-row items-center mb-4`}>
            <MaterialIcons name="person" size={26} color="#1f2937" style={tw`mr-2`} />
            <Text style={tw`text-2xl font-bold text-gray-800`}>Contact Information</Text>
          </View>
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
            <Text style={tw`text-base text-gray-700 font-semibold mt-3`}>
              Addresses:
            </Text>
            {addresses.map((addr, idx) => (
              <View key={idx} style={tw`flex-row items-center mb-2`}>
                <TextInput
                  ref={(el) => {
                    if (el) addressRefs.current[idx] = el;
                  }}
                  value={addr}
                  onChangeText={(text) => updateAddress(idx, text)}
                  placeholder={`Address ${idx + 1}`}
                  style={tw`flex-1 border px-3 py-2 rounded-2xl mr-2 ${
                    addr.trim() === "" && addressError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <Pressable
                  onPress={() => deleteAddress(idx)}
                  style={tw`px-2 py-1 bg-red-500 rounded-full`}
                >
                  <MaterialIcons name="close" size={20} color="white" />
                </Pressable>
              </View>
            ))}
            {addressError ? (
              <Text style={tw`text-red-500 text-sm mb-2`}>{addressError}</Text>
            ) : null}
          </ScrollView>
          <View style={tw`flex-row justify-between items-center mt-4`}>
            <Pressable onPress={addAddress} style={tw`mt-2`}>
              <Text style={tw`text-blue-600 font-semibold`}>+ Add Address</Text>
            </Pressable>
            <View style={tw`flex-row`}>
              <Pressable onPress={onClose} style={tw`bg-gray-300 px-4 py-2 rounded-full mr-2`}>
                <Text style={tw`text-gray-800 font-semibold`}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={loading}
                style={tw`bg-blue-600 px-4 py-2 ml-2 rounded-full ${loading ? "opacity-50" : ""}`}
              >
                <Text style={tw`text-white font-semibold`}>
                  {loading ? "Saving..." : "Save"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}