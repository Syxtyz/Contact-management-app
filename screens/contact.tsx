import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, TextInput, Platform, StatusBar, } from "react-native";
import { BottomTabParamList } from "../types/props";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import tw from "tailwind-react-native-classnames";
import ContactCard from "../cards/contactCard";
import ConfirmDeleteCard from "../cards/confirmDeleteCard";
import ContactInfoCard from "../cards/contactInfoCard";
import { auth, db } from "../firebase/firebaseConfig";
import { doc, onSnapshot, setDoc, updateDoc, arrayUnion, arrayRemove, } from "firebase/firestore";
import ContactList from "../components/contactList";
import { ContactProps } from "../types/props";
import { MaterialIcons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<BottomTabParamList, "Contact">;

export default function ContactScreen({ navigation }: Props) {
    const [isAddContactVisible, setIsAddContactVisible] = useState(false);
    const [contactStack, setContactStack] = useState<ContactProps[]>([]);
    const [filteredContacts, setFilteredContacts] = useState<ContactProps[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedContact, setSelectedContact] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<string | null>(null);
    const [isContactInfoVisible, setIsContactInfoVisible] = useState(false);
    const userId = auth.currentUser?.uid;

    const loadContacts = () => {
        if (!userId) return;
        const contactsDocRef = doc(db, "contacts", userId);
        const unsubscribe = onSnapshot(
            contactsDocRef,
            (docSnap) => {
                setLoading(false);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const contacts = data?.contacts || [];
                    setContactStack(contacts);
                    setFilteredContacts(contacts);
                } else {
                    setDoc(contactsDocRef, { contacts: [] });
                }
            },
            (error) => {
                console.error("Error fetching contacts:", error);
                setLoading(false);
            }
        );
        return unsubscribe;
    };

    const handleAddContact = async (name: string, addresses: string[]) => {
        if (!name.trim() || !userId || addresses.length === 0) return;

        const newContact: ContactProps = {
            name: name.trim(),
            addresses: addresses.map((addr) => addr.trim()).filter((addr) => addr),
            isFavorite: false,
        };
        try {
            const contactRef = doc(db, "contacts", userId);
            await updateDoc(contactRef, {
                contacts: arrayUnion(newContact),
            });
        } catch (err) {
            console.error("Error adding contact:", err);
        }
    };

    const handleSelectContact = (contactName: string) => {
        setSelectedContact((prev) => (prev === contactName ? null : contactName));
    };
    
    const handleConfirmDelete = async () => {
        if (!userId || !contactToDelete) return;
        try {
            const contactRef = doc(db, "contacts", userId);
            const target = contactStack.find((c) => c.name === contactToDelete);
            if (!target) return;
            await updateDoc(contactRef, {
                contacts: arrayRemove(target),
            });
            setContactStack((prev) =>
                prev.filter((item) => item.name !== contactToDelete)
            );
            setFilteredContacts((prev) =>
                prev.filter((item) => item.name !== contactToDelete)
            );
            setIsConfirmDeleteVisible(false);
            setContactToDelete(null);
        } catch (err) {
            console.error("Error deleting contact:", err);
        }
    };

    const showConfirmDelete = (contactName: string) => {
        setContactToDelete(contactName);
        setIsConfirmDeleteVisible(true);
    };

    const showContactInfo = (contactName: string) => {
        setSelectedContact(contactName);
        setIsContactInfoVisible(true);
    };

    const handleAddToFavorite = async (contactName: string) => {
        if (!userId) return;
        const contactRef = doc(db, "contacts", userId);
        const targetContact = contactStack.find((contact) => contact.name === contactName);
        if (!targetContact) return;
        try {
            const updatedContact = {
                ...targetContact,
                isFavorite: !targetContact.isFavorite,
            };
            const updatedList = contactStack.map((contact) =>
                contact.name === contactName ? updatedContact : contact
            );
            setContactStack(updatedList);
            setFilteredContacts(updatedList);
            await updateDoc(contactRef, {
                contacts: updatedList,
            });
        } catch (err) {
            console.error("Error updating favorite status:", err);
        }
    };

    const handleSearch = (text: string) => {
        setSearchTerm(text);
        const filtered = contactStack.filter((contact) =>
            contact.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredContacts(filtered);
    };

    useEffect(() => {
        const unsubscribe = loadContacts();
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userId]);

    const getContactByName = (name: string) => contactStack.find((c) => c.name === name);

    return (
        <View style={[ tw`flex-1 m-2`, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0} ]}>
            <ContactCard
                visible={isAddContactVisible}
                onClose={() => setIsAddContactVisible(false)}
                onAdd={handleAddContact}
            />
            <ConfirmDeleteCard
                visible={isConfirmDeleteVisible}
                onClose={() => setIsConfirmDeleteVisible(false)}
                onDelete={handleConfirmDelete}
            />
            <ContactInfoCard
                visible={isContactInfoVisible}
                onClose={() => setIsContactInfoVisible(false)}
                contact={getContactByName(selectedContact || "")}
            />
            <TextInput
                style={tw`border border-gray-400 p-3 rounded-full mb-2 bg-white`}
                placeholder="Search Contact..."
                value={searchTerm}
                onChangeText={handleSearch}
            />
            {loading ? (
                <View style={tw`flex-1 justify-center items-center`}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={tw`mt-2 text-lg`}>Fetching contacts...</Text>
                </View>
            ) : filteredContacts.length === 0 ? (
                <View style={tw`flex-1 justify-center items-center`}>
                    <Text style={tw`text-xl text-gray-600`}>
                        No contacts found.
                    </Text>
                </View>
            ) : (
                <ContactList
                    contactStack={filteredContacts}
                    selectedContact={selectedContact}
                    loading={loading}
                    onSelect={handleSelectContact}
                    onDelete={showConfirmDelete}
                    onViewInfo={showContactInfo}
                    onToggleFavorite={handleAddToFavorite}
                />
            )}
            <View style={[tw`absolute bottom-6 right-6 rounded-full`]}>
                <Pressable
                    style={tw`bg-blue-500 w-14 h-14 justify-center items-center rounded-full`}
                    onPress={() => setIsAddContactVisible(true)}
                >
                    <MaterialIcons name="add" size={40} color="white" />
                </Pressable>
            </View>
        </View>
    );
}