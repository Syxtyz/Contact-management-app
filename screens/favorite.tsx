import React, { useState, useEffect } from "react";
import { View, TextInput, Platform, StatusBar, ActivityIndicator, Text, } from "react-native";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";
import ContactList from "../components/contactList";
import ConfirmDeleteCard from "../cards/confirmDeleteCard";
import ContactInfoCard from "../cards/contactInfoCard";
import { ContactProps } from "../types/props";
import { arrayRemove } from "firebase/firestore";
import tw from "tailwind-react-native-classnames";

export default function FavoriteScreen() {
  const userId = auth.currentUser?.uid;
  const [contactStack, setContactStack] = useState<ContactProps[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<ContactProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);
  const [isContactInfoVisible, setIsContactInfoVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const contactRef = doc(db, "contacts", userId);
    const unsubscribe = onSnapshot(contactRef, (snapshot) => {
      setLoading(false);
      if (snapshot.exists()) {
        const allContacts = snapshot.data()?.contacts || [];
        const favorites = allContacts.filter((c: ContactProps) => c.isFavorite);
        setContactStack(favorites);
        setFilteredContacts(favorites);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  const handleSelectContact = (contactName: string) => {
    setSelectedContact((prev) => (prev === contactName ? null : contactName));
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = contactStack.filter((contact) =>
      contact.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredContacts(filtered);
  };

  const handleConfirmDelete = async () => {
    if (!userId || !contactToDelete) return;
    const contactRef = doc(db, "contacts", userId);
    const target = contactStack.find((c) => c.name === contactToDelete);
    if (!target) return;
    try {
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
    const target = contactStack.find((c) => c.name === contactName);
    if (!target) return;
    const updatedContact = { ...target, isFavorite: !target.isFavorite };
    const updatedList = contactStack.map((c) =>
      c.name === contactName ? updatedContact : c
    );
    try {
      const snapshot = await getDoc(contactRef);
      const fullData = snapshot.data()?.contacts || [];
  
      const updatedFullList = fullData.map((c: ContactProps) =>
        c.name === contactName ? updatedContact : c
      );
      await updateDoc(contactRef, { contacts: updatedFullList });
      if (!updatedContact.isFavorite) {
        setContactStack(updatedList.filter((c) => c.isFavorite));
        setFilteredContacts(updatedList.filter((c) => c.isFavorite));
      } else {
        setContactStack(updatedList);
        setFilteredContacts(updatedList);
      }
    } catch (err) {
      console.error("Error updating favorite:", err);
    }
  };

  const getContactByName = (name: string) =>
    contactStack.find((c) => c.name === name);

  return (
    <View style={[ tw`flex-1 m-2`, { paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0} ]}>
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
        placeholder="Search Contact..."
        value={searchQuery}
        onChangeText={handleSearch}
        style={tw`border border-gray-400 p-3 rounded-full mb-2 bg-white`}
      />
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={tw`mt-2 text-lg`}>Fetching contacts...</Text>
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-xl text-gray-600`}>No favorite found.</Text>
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
    </View>
  );
}