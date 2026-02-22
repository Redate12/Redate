import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {COLORS, TIERS} from '../constants/colors';
import {subscriptionService} from '../services/api';

export default function SubscriptionScreen({navigation}) {
  const [subscription, setSubscription] = useState(null);
  const [tier, setTier] = useState(TIERS.FREE);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await subscriptionService.getSubscriptionStatus();
      setSubscription(response.data.subscription);
      setTier(response.data.tier || TIERS.FREE);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (newTier) => {
    if (tier === newTier) return;

    Alert.alert(
      'Upgrade suscripción',
      `¿Quieres upgrade a ${newTier.toUpperCase()}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Upgrade',
          onPress: async () => {
            try {
              setProcessing(true);
              await subscriptionService.createSubscription(newTier, 'pm_test_...');
              await loadSubscription();
              Alert.alert('Éxito', 'Suscripción actualizada');
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const handleCancelSubscription = async () => {
    Alert.alert(
      'Cancelar suscripción',
      '¿Seguro que quieres cancelar? Perderás acceso al final del periodo.',
      [
        {text: 'Mantener suscripción', style: 'cancel'},
        {
          text: 'Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setProcessing(true);
              await subscriptionService.cancelSubscription();
              await loadSubscription();
              Alert.alert('Éxito', 'Suscripción cancelada');
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const purchaseBoost = async (boostType) => {
    Alert.alert(
      'Purchase Boost',
      `¿Quieres comprar ${boostType}?`,
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Comprar',
          onPress: async () => {
            try {
              setProcessing(true);
              await subscriptionService.purchaseBoost(boostType, 'pm_test_...');
              Alert.alert('Éxito', 'Boost activado');
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setProcessing(false);
            }
          },
        },
      ],
    );
  };

  const renderTierCard = (tierType, price, features, title) => {
    const isCurrent = tier === tierType;

    return (
      <TouchableOpacity
        style={[
          styles.tierCard,
          isCurrent && styles.tierCardActive,
          isCurrent && tierType === TIERS.PLATINUM && styles.tierCardPlatinum,
        ]}
        onPress={() => !isCurrent && !processing && handleUpgrade(tierType)}
        disabled={processing}>
        <View style={styles.tierHeader}>
          <Text style={styles.tierTitle}>{title}</Text>
          {isCurrent && <Text style={styles.currentBadge}>ACTUAL</Text>}
        </View>

        <Text style={styles.tierPrice}>{price}</Text>

        <View style={styles.features}>
          {features.map((feature, index) => (
            <View key={index} style={styles.feature}>
              <Text style={styles.featureBullet}>✓</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        {!isCurrent && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => handleUpgrade(tierType)}>
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Suscripción 💫</Text>

      {loading ? (
        <Text style={styles.loadingText}>Cargando...</Text>
      ) : (
        <>
          {/* Current Tier */}
          <View style={styles.currentTierSection}>
            <Text style={styles.sectionTitle}>Tu suscripción actual</Text>
            <Text style={[styles.currentTier, styles[`tier${tier.toUpperCase()}`]]}>
              {tier.toUpperCase()}
            </Text>
            {subscription?.cancel_at_period_end && (
              <Text style={styles.warningText}>
                Tu suscripción se cancelará al final del periodo
              </Text>
            )}
          </View>

          {/* Tier Cards */}
          {renderTierCard(
            TIERS.PLUS,
            '€9.99/mes',
            [
              'Swipes ilimitados',
              '5 Super Likes/día',
              'Undo ilimitado',
              'Ver quién te dio like',
              'Distancia hasta 150km',
            ],
            'PLUS',
          )}

          {renderTierCard(
            TIERS.GOLD,
            '€19.99/mes',
            [
              'Todo de PLUS +',
              'Passport (otros países)',
              'Leer mensajes antes de match',
              'Distancia ilimitada',
              'Perfiles prioritarios',
            ],
            'GOLD',
          )}

          {renderTierCard(
            TIERS.PLATINUM,
            '€29.99/mes',
            [
              'Todo de GOLD +',
              '3 mensajes pre-match/sem',
              'Soporte prioritario 24/7',
              'Match garantizado/sem',
              'Badge exclusivo',
            ],
            'PLATINUM',
          )}

          {/* Boosts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Boosts (compras únicas)</Text>

            <View style={styles.boostsGrid}>
              <TouchableOpacity
                style={styles.boostCard}
                onPress={() => purchaseBoost('super_like')}>
                <Text style={styles.boostIcon}>⭐</Text>
                <Text style={styles.boostTitle}>Super Like</Text>
                <Text style={styles.boostPrice}>€0.49</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.boostCard}
                onPress={() => purchaseBoost('boost_30m')}>
                <Text style={styles.boostIcon}>🚀</Text>
                <Text style={styles.boostTitle}>Boost 30 min</Text>
                <Text style={styles.boostPrice}>€1.49</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.boostCard}
                onPress={() => purchaseBoost('boost_1h')}>
                <Text style={styles.boostIcon}>🔥</Text>
                <Text style={styles.boostTitle}>Boost 1 hora</Text>
                <Text style={styles.boostPrice}>€2.49</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Subscription Management */}
          {tier !== TIERS.FREE && (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                subscription?.cancel_at_period_end && styles.cancelButtonDisabled,
              ]}
              onPress={handleCancelSubscription}
              disabled={subscription?.cancel_at_period_end || processing}>
              <Text style={styles.cancelButtonText}>
                {subscription?.cancel_at_period_end
                  ? 'Cancelación pendiente'
                  : 'Cancelar suscripción'}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
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
  loadingText: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    padding: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    paddingLeft: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  currentTierSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  currentTier: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  tierFREE: {color: STATUS_COLORS.free, backgroundColor: 'rgba(148, 163, 184, 0.1)'},
  tierPLUS: {color: STATUS_COLORS.plus, backgroundColor: 'rgba(59, 130, 246, 0.1)'},
  tierGOLD: {color: STATUS_COLORS.gold, backgroundColor: 'rgba(245, 158, 11, 0.1)'},
  tierPLATINUM: {color: STATUS_COLORS.platinum, backgroundColor: 'rgba(229, 231, 235, 0.1)'},
  warningText: {
    fontSize: 14,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 8,
  },
  tierCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tierCardActive: {
    borderColor: COLORS.primary,
  },
  tierCardPlatinum: {
    borderColor: COLORS.card,
    backgroundColor: COLORS.card,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tierTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  currentBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tierPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
  },
  features: {
    marginBottom: 24,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureBullet: {
    fontSize: 18,
    color: COLORS.success,
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  boostsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  boostCard: {
    flex: 1,
    minWidth: '30%',
    margin: 4,
    padding: 16,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    alignItems: 'center',
  },
  boostIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  boostTitle: {
    fontSize: 12,
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  boostPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.danger,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
    marginTop: 0,
  },
  cancelButtonDisabled: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
});