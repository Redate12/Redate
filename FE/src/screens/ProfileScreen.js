import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import {COLORS, STATUS_COLORS} from '../constants/colors';
import {userService} from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen({navigation}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      setUser(response.data.user);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres cerrar sesión?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Cerrar',
          style: 'destructive',
          onPress: async () => {
            try {
              userService.logout();
              // Clear AsyncStorage
              await AsyncStorage.clear();

              // Navigate to Login
              navigation.reset({
                index: 0,
                routes: [{name: 'Onboarding'}],
              });
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ],
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', {user});
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleSubscription = () => {
    navigation.navigate('Subscription');
  };

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  const tierColor = STATUS_COLORS[user.tier] || STATUS_COLORS.free;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
      </View>

      {/* User Info */}
      <View style={styles.section}>
        <View style={styles.photoContainer}>
          {user.photos && user.photos.length > 0 ? (
            <Image
              source={{uri: user.photos[0]}}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={[styles.profilePhoto, styles.photoPlaceholder]}>
              <Text style={styles.photoPlaceholderText}>
                {user.name ? user.name.charAt(0).toUpperCase() : ''}
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.editPhotoButton}
            onPress={handleEditProfile}>
            <Text style={styles.editPhotoText}>✏️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        {user.birth_date && (
          <Text style={styles.info}>
            {user.age} años • {user.gender} • buscando {user.looking_for}
          </Text>
        )}
      </View>

      <View style={[styles.tierBadge, {borderColor: tierColor}]}>
        <Text style={[styles.tierText, {color: tierColor}]}>
          {user.tier.toUpperCase()}
        </Text>
      </View>

      {/* Bio */}
      {user.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre mí</Text>
          <Text style={styles.bio}>{user.bio}</Text>
        </View>
      )}

      {/* Menu Options */}
      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleEditProfile}>
          <Text style={styles.menuItemText}>Editar perfil</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleSubscription}>
          <Text style={styles.menuItemText}>Suscripción</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={handleSettings}>
          <Text style={styles.menuItemText}>Configuración</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <View style={[styles.menuItem, styles.menuItemSeparator]}>
          <Text style={styles.menuItemText}>Ayuda y soporte</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.version}>REDATE v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 32,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.border,
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.card,
  },
  photoPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.secondary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.background,
  },
  editPhotoText: {
    fontSize: 18,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  email: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  info: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  tierBadge: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
  },
  tierText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    alignSelf: 'flex-start',
    width: '100%',
  },
  bio: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
    textAlign: 'center',
  },
  menu: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemSeparator: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  menuItemArrow: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  logoutButton: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.danger,
    marginHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  version: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: 32,
  },
});