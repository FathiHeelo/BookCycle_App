import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/hooks/use-i18n';
import { ref, get, update, set } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useAppTheme } from '@/context/ThemeContext';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  targetUid: string;
  targetName: string;
  onSuccess?: () => void;
}

export default function RatingModal({ visible, onClose, targetUid, targetName, onSuccess }: RatingModalProps) {
  const { t, isRTL } = useI18n();
  const { theme: themeKey, colors: themeColors, isAccessible } = useAppTheme();
  const currentUser = FIREBASE_AUTH.currentUser;
  const [selectedRating, setSelectedRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleRating = async () => {
    if (selectedRating === 0) return;
    if (!currentUser) return;

    setSubmitting(true);
    try {
      // 1. Save individual rating
      const ratingRef = ref(FIREBASE_DB, `Ratings/${targetUid}/${currentUser.uid}`);
      await set(ratingRef, {
        rating: selectedRating,
        timestamp: new Date().toISOString(),
        raterName: currentUser.displayName || 'Anonymous',
      });

      // 2. Recalculate average stats
      const ratingsRef = ref(FIREBASE_DB, `Ratings/${targetUid}`);
      const snap = await get(ratingsRef);
      if (snap.exists()) {
        const allRatings = snap.val();
        const rValues = Object.values(allRatings).map((r: any) => r.rating);
        const sum = rValues.reduce((a, b) => a + b, 0);
        const avg = sum / rValues.length;

        const statsRef = ref(FIREBASE_DB, `Users/${targetUid}/stats`);
        await update(statsRef, {
          rating: avg,
          totalRatings: rValues.length,
          impact: rValues.length, // Each rating represents a person helped
        });
      }

      Alert.alert(t('common.success'), isRTL ? 'شكراً على تقييمك!' : 'Thank you for your rating!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (e) {
      console.error(e);
      Alert.alert(t('common.error'), 'Failed to submit rating');
    } finally {
      setSubmitting(false);
      setSelectedRating(0);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: isAccessible ? themeColors.accent + '20' : '#FEF3C7', borderWidth: isAccessible ? 1 : 0, borderColor: themeColors.accent }]}>
              <Ionicons name="star" size={32} color={isAccessible ? themeColors.accent : "#F59E0B"} />
            </View>
            <ThemedText style={styles.modalTitle}>{isRTL ? 'قيم تجربتك' : 'Rate your experience'}</ThemedText>
            <ThemedText style={styles.modalSubtitle}>
              {isRTL ? `كيف كانت معاملة ${targetName}؟` : `How was your experience with ${targetName}?`}
            </ThemedText>
          </View>
          
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setSelectedRating(star)}>
                <Ionicons 
                  name={star <= selectedRating ? "star" : "star-outline"} 
                  size={42} 
                  color={star <= selectedRating ? (isAccessible ? themeColors.accent : "#F59E0B") : (isAccessible ? themeColors.textSecondary : "#CBD5E1")} 
                  style={{ marginHorizontal: 6 }}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <ThemedText style={styles.cancelBtnText}>{t('common.cancel')}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitBtn, { 
                backgroundColor: themeColors.primary, 
                opacity: selectedRating === 0 ? 0.6 : 1,
                borderWidth: isAccessible ? 2 : 0,
                borderColor: '#FFF'
              }]} 
              onPress={handleRating}
              disabled={submitting || selectedRating === 0}
            >
              {submitting ? <ActivityIndicator color="#fff" /> : <ThemedText style={[styles.submitBtnText, { color: themeKey === 'dark' ? '#0B1020' : '#fff', fontWeight: isAccessible ? '900' : '800' }]}>{isRTL ? 'إرسال التقييم' : 'Submit Rating'}</ThemedText>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 24, fontWeight: '800', marginBottom: 8, color: '#001B39' },
  modalSubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center', fontWeight: '500', lineHeight: 22 },
  starsRow: { flexDirection: 'row', marginBottom: 32 },
  modalButtons: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 16, backgroundColor: '#F1F5F9' },
  cancelBtnText: { fontWeight: '700', color: '#64748B', fontSize: 16 },
  submitBtn: { flex: 2, height: 56, justifyContent: 'center', alignItems: 'center', borderRadius: 16 },
  submitBtnText: { fontWeight: '800', color: '#fff', fontSize: 16 },
});
