import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { getAuth } from 'firebase/auth';


export default function Profile_Card() {
  const auth = getAuth();
  const user = auth.currentUser;
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();

  // Responsive sizing based on screen width
  const imageSize = Math.min(width * 0.30, 130);
  const nameFontSize = Math.min(width * 0.065, 26);
  const cardPadding = Math.min(width * 0.07, 28);

  const textAlign = isRTL ? 'right' : 'center';

  return (
    <View style={[styles.cardContainer, { padding: cardPadding }]}>
      {/* Decorative background shape */}
      <View style={[styles.decorativeShape, isRTL ? { left: -40, right: undefined } : { right: -40 }]} />

      {/* Avatar Section */}
      <View style={styles.profileHeader}>
        <View style={[styles.imageContainer, { borderRadius: imageSize }]}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000' }}
            style={[styles.profileImage, { width: imageSize, height: imageSize, borderRadius: imageSize / 2 }]}
          />
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>{t('profile.card.verified')}</Text>
          </View>
        </View>
      </View>

      {/* User Info Section */}
      <View style={styles.infoSection}>
        <Text style={[styles.nameText, { fontSize: nameFontSize, textAlign }]}>
          {user?.displayName ?? 'Ahmed Al-Masri'}
        </Text>

        <View style={[styles.universityRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="school-outline" size={15} color="#4B5563" />
          <Text style={[styles.universityText, { textAlign, marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>
            {t('profile.card.university')}
          </Text>
        </View>

        {/* Rating Pill */}
        <View style={[styles.ratingPill, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="star" size={15} color="#001B39" />
          <Text style={[styles.ratingText, { marginLeft: isRTL ? 0 : 6, marginRight: isRTL ? 6 : 0 }]}>4.9 / 5.0</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="pencil-outline" size={18} color="#fff" style={isRTL ? { marginLeft: 8 } : { marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>{t('profile.card.edit')}</Text>
        </Pressable>

        <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
          <Text style={styles.secondaryButtonText}>{t('profile.card.share')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeShape: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F3F4F6',
    zIndex: -1,
  },
  profileHeader: {
    marginBottom: 24,
    zIndex: 1,
  },
  imageContainer: {
    position: 'relative',
    padding: 6,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImage: {
    // width/height/borderRadius set inline
    
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  badgeInner: {
    backgroundColor: '#FDE047',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000',
    backgroundColor: '#FDE047',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  nameText: {
    fontWeight: '800',
    color: '#001B39',
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  universityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  universityText: {
    fontSize: 13,
    color: '#4B5563',
    marginLeft: 6,
    fontWeight: '500',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 14,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 6,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#001B39',
    height: 54,
    borderRadius: 27,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#E5E7EB',
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#001B39',
    fontSize: 16,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});