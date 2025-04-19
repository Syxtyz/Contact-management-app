export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Main: undefined;
    Search: undefined;
};

export type BottomTabParamList = {
    Profile: undefined;
    Contact: undefined;
    Favorite: undefined;
};

export type ConfirmDeleteCardProps = {
    visible: boolean;
    onClose: () => void;
    onDelete: () => Promise<void>;
};

export type ContactCardProps = {
    visible: boolean;
    onClose: () => void;
    onAdd: (name: string, addresses: string[]) => void;
};

export type ContactProps = {
    name: string;
    addresses: string[];
    isFavorite: boolean;
};

export type ContactInfoProps = {
    name: string;
    addresses: string[];
};

export type DeleteSaveProps = {
    visible: boolean;
    onClose: () => void;
    contact?: ContactInfoProps;
    onSave?: (updated: ContactInfoProps) => void;
};

export type ContactListProps = {
  contactStack: ContactProps[];
  selectedContact: string | null;
  loading: boolean;
  onSelect: (name: string) => void;
  onDelete: (name: string) => void;
  onViewInfo: (name: string) => void;
  onToggleFavorite: (name: string) => void;
};