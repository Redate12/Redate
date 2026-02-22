import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import {COLORS} from '../constants/colors';
import {userService} from '../services/api';
import {signOut} from '../services/AuthService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({navigation}) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

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
              setLoading(true);
              await signOut();
              await AsyncStorage.clear();

              navigation.reset({
                index: 0,
                routes: [{name: 'Onboarding'}],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'No se pudo cerrar sesión');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción es permanente. ¿Estás seguro?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            // Call API to delete account
            try {
              await api.delete('/users/account');
              await AsyncStorage.clear();

              navigation.reset({
                index: 0,
                routes: [{name: 'Onboarding'}],
              });
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la cuenta');
            }
          },
        },
      ],
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handlePreferences = () => {
    navigation.navigate('Preferences');
  };

  const handlePrivacy = () => {
    navigation.navigate('Privacy');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Configuración</Text>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile}>
          <Text style={styles.menuItemText}>Editar perfil</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Cambiar contraseña</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Verificar email</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificaciones</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Push notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{false: COLORS.border, true: COLORS.primary}}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Notifications de matches</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{false: COLORS.border, true: COLORS.primary}}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Notifications de mensajes</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{false: COLORS.border, true: COLORS.primary}}
          />
        </TouchableOpacity>
      </View>

      {/* Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacidad</Text>

        <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
          <Text style={styles.menuItemText}>Política de privacidad</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
          <Text style={styles.menuItemText}>Términos de servicio</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
          <Text style={styles.menuItemText}>Datos y almacenamiento</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Location Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ubicación</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Compartir ubicación</Text>
          <Switch
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            trackColor={{false: COLORS.border, true: COLORS.primary}}
          />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Soporte</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Centro de ayuda</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Contactar soporte</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuItemText}>Reportar problema</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={[styles.section, styles.dangerSection]}>
        <TouchableOpacity
          style={[styles.menuItem, styles.dangerMenuItem]}
          onPress={handleLogout}
          disabled={loading}>
          <Text style={[styles.dangerText]}>Cerrar sesión</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, styles.dangerMenuItem]}
          onPress={handleDeleteAccount}>
          <Text style={[styles.dangerText]}>Eliminar cuenta</Text>
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 16,
    paddingBottom: 8,
  },
  section: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
  menuItemArrow: {
    fontSize: 24,
    color: COLORS.textMuted,
  },
  dangerSection: {
    marginTop: 32,
    borderTopColor: COLORS.danger,
    borderBottomColor: COLORS.danger,
  },
  dangerMenuItem: {
    backgroundColor: COLORS.background,
  },
  dangerText: {
    fontSize: 16,
    color: COLORS.danger,
    fontWeight: 'bold',
  },
  version: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: 32,
  },
});