import React from "react";
import { View, Text, FlatList, Pressable, ActivityIndicator } from "react-native";
import tw from "tailwind-react-native-classnames";
import { MaterialIcons } from "@expo/vector-icons";
import { ContactListProps } from "../types/props";

const ContactList: React.FC<ContactListProps> = ({ contactStack, selectedContact, loading, onSelect, onDelete, onViewInfo, onToggleFavorite }) => {
  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={tw`mt-2 text-lg`}>Fetching contacts...</Text>
      </View>
    );
  }
  if (contactStack.length === 0) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-xl text-gray-600`}>No contacts available.</Text>
      </View>
    );
  }
  return (
    <FlatList
      contentContainerStyle={tw`pb-20`}
      data={contactStack}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={tw`bg-white rounded mb-2`}>
          <Pressable
            style={tw`bg-white p-4 px-14 rounded`}
            onPress={() => onSelect(item.name)}
          >
            <Text style={tw`text-gray-900`}>{item.name}</Text>
          </Pressable>
          <MaterialIcons name="person" size={50} color="black" style={tw`absolute`}/>

          {selectedContact === item.name && (
            <View style={tw`flex-row mb-2 ml-2 mr-2`}>
              <Pressable
                style={tw`bg-yellow-500 px-4 py-2 rounded mr-1 flex-1 justify-center`}
                onPress={() => onToggleFavorite(item.name)}
              >
                <Text style={tw`text-white text-center text-xs`}>
                  {item.isFavorite ? "Remove from Favorite" : "Add to Favorite"}
                </Text>
              </Pressable>
              <Pressable
                style={tw`bg-blue-500 px-4 py-2 rounded ml-1 flex-1 justify-center`}
                onPress={() => onViewInfo(item.name)}
              >
                <Text style={tw`text-white text-center text-xs`}>Contact Info</Text>
              </Pressable>
              <Pressable
                style={tw`bg-red-500 px-4 py-2 rounded ml-2 flex-1 justify-center`}
                onPress={() => onDelete(item.name)}
              >
                <Text style={tw`text-white text-center text-xs`}>Delete</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    />
  );
};

export default ContactList;