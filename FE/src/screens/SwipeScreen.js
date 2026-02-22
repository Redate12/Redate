import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { userService, swipeService } from '../services/api';

const { width, height } = Dimensions.get('window');

export default function SwipeScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNearbyUsers();
  }, []);

  const loadNearbyUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getNearbyUsers({
        distance: 50,
        minAge: 18,
        maxAge: 100,
        limit: 20,
      });

      setUsers(response.data.users || []);
      setCurrentUserIndex(0);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipeLeft = async (userId) => {
    try {
      await swipeService.dislike(userId);
      goToNextUser();
    } catch (error) {
      console.error('Swipe left error:', error);
    }
  };

  const handleSwipeRight = async (userId) => {
    try {
      const response = await swipeService.like(userId);

      if (response.data.match_created) {
        Alert.alert(
          '¡Match! 💕',
          '¡Tienes un nuevo match!',
          [
            {
              text: 'Ver match',
              onPress: () => navigation.navigate('Matches'),
            },
            { text: 'OK' },
          ]
        );
      }

      goToNextUser();
    } catch (error) {
      console.error('Swipe right error:', error);
    }
  };

  const handleSuperLike = async (userId) => {
    try {
      const response = await swipeService.superLike(userId);

      if (response.data.match_created) {
        Alert.alert(
          '¡Match! ⭐',
          '¡Te super likearon de vuelta!',
          [
            {
              text: 'Ver match',
              onPress: () => navigation.navigate('Matches'),
            },
            { text: 'OK' },
          ]
        );
      }

      goToNextUser();
    } catch (error) {
      console.error('Super like error:', error);
    }
  };

  const goToNextUser = () => {
    if (currentUserIndex < users.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
    } else {
      // Load more users
      loadNearbyUsers();
    }
  };

  const currentUser = users[currentUserIndex];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando perfiles...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No hay más usuarios cerca de ti</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadNearbyUsers}>
          <Text style={styles.refreshText}>Actualizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* User Card */}
      <View style={styles.card}>
        {currentUser.photos && currentUser.photos.length > 0 ? (
          <Image
            source={{ uri: currentUser.photos[0] }}
            style={styles.photo}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <Text style={styles.photoPlaceholderText}>Sin foto</Text>
          </View>
        )}

        <View style={styles.cardInfo}>
          <Text style={styles.name}>
            {currentUser.name}, {currentUser.age}
          </Text>
          {/* Add distance and other info here */}
          {currentUser.distance && (
            <Text style={styles.distance}>{currentUser.distance} km</Text>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.buttonLeft]}
          onPress={() => handleSwipeLeft(currentUser.id)}
        >
          <Text style={styles.buttonIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSuperLike]}
          onPress={() => handleSuperLike(currentUser.id)}
        >
          <Text style={styles.buttonIcon}>⭐</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonRight]}
          onPress={() => handleSwipeRight(currentUser.id)}
        >
          <Text style={styles.buttonIcon}>💚</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    flex: 1,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  photo: {
    flex: 1,
    width: '100%',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.border,
  },
  photoPlaceholderText: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  cardInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundImage: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  distance: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 32,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  buttonLeft: {
    backgroundColor: COLORS.danger,
  },
  buttonSuperLike: {
    backgroundColor: COLORS.warning,
  },
  buttonRight: {
    backgroundColor: COLORS.primary,
  },
  buttonIcon: {
    fontSize: 32,
    color: COLORS.text,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 32,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 32,
  },
  refreshButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    marginHorizontal: 32,
  },
  refreshText: {
    color: COLORS.text,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});