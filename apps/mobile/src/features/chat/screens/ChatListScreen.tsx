import { Ionicons } from '@expo/vector-icons';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { conversations } from '../../../core/data/mock/pets';
import type { Conversation } from '../../../core/types/chat.types';
import { theme } from '../../../core/theme/tokens';
import { styles } from './ChatListScreen.styles';

export function ChatListScreen() {
  const insets = useSafeAreaInsets();

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir chat con ${item.ownerName}`}
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
    >
      <View style={styles.row}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} accessibilityLabel={`Foto de ${item.ownerName}`} />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text numberOfLines={1} style={styles.name}>
              {item.ownerName}
            </Text>
            <Text style={styles.time}>{item.timeLabel}</Text>
          </View>
          <Text numberOfLines={2} style={styles.message}>
            {item.petName}: {item.lastMessage}
          </Text>
          <View style={styles.badgeRow}>
            <View style={styles.intent}>
              <Text style={styles.intentText}>{item.intent}</Text>
            </View>
            {item.unread ? <View style={styles.unread} /> : null}
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={renderConversation}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top + theme.spacing.md, theme.spacing.xl) },
        ]}
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Mensajes</Text>
            <Text style={styles.subtitle}>Coordina citas, cruza responsable y encuentros seguros.</Text>
            <View style={styles.search} accessibilityRole="search">
              <Ionicons name="search" size={20} color={theme.colors.textMuted} />
              <Text style={styles.searchText}>Buscar conversaciones</Text>
            </View>
          </View>
        }
      />
    </View>
  );
}
