import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { matchService } from '../services/api';

export default function MatchesScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await matchService.getMatches();
      setMatches(response.data.matches || []);
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMatches();
    setRefreshing(false);
  };

  const handleMatchPress = (match) => {
    navigation.navigate('Chat', { matchId: match.match_id });
  };

  const renderMatch = ({ item }) => (
    <TouchableOpacity
      style={styles.matchItem}
      onPress={() => handleMatchPress(item)}
    >
      {item.other_user_photos && item.other_user_photos.length > 0 ? (
        <Image
          source={{ uri: item.other_user_photos[0] }}
          style={styles.matchPhoto}
        />
      ) : (
        <View style={[styles.matchPhoto, styles.placeholder]} />
      )}

      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.other_user_name}</Text>
        {item.last_message_content ? (
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.last_message_content}
          </Text>
        ) : (
          <Text style={styles.noMessage}>Sin mensajes</Text>
        )}
        {item.last_message_time && (
          <Text style={styles.messageTime}>
            {formatTime(item.last_message_time)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `hace ${diffMins} min`;
    if (diffHours < 24) return `hace ${diffHours} h`;
    if (diffDays < 7) return `hace ${diffDays} días`;
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Matches</Text>

      <FlatList
        data={matches}
        renderItem={renderMatch}
        keyExtractor={(item) => item.match_id.toString()}
        contentContainerStyle={matches.length === 0 ? styles.emptyList : null}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes matches aún</Text>
              <Text style={styles.emptySubtext}>
                ¡Dale like para empezar a conectar!
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  matchItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.border,
  },
  placeholder: {
    backgroundColor: COLORS.border,
  },
  matchInfo: {
    flex: 1,
    marginLeft: 12,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  noMessage: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
    fontStyle: 'italic',
  },
  messageTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});