import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';

export default function TotalBook_Card() {
  const { width } = useWindowDimensions();
  const { t, isRTL } = useI18n();
  const currentUser = FIREBASE_AUTH.currentUser;

  const [totalGiven, setTotalGiven] = useState(0);
  const [loading, setLoading] = useState(true);

  const cardPadding = Math.min(width * 0.06, 24);
  const titleFontSize = Math.min(width * 0.085, 36);
  const textAlign = isRTL ? 'right' : 'left';

  useEffect(() => {
    if (!currentUser) return;

    const booksRef = ref(FIREBASE_DB, 'Books');
    const userBooksQuery = query(booksRef, orderByChild('donorUid'), equalTo(currentUser.uid));

    const unsubscribe = onValue(userBooksQuery, (snapshot) => {
      if (snapshot.exists()) {
        setTotalGiven(Object.keys(snapshot.val()).length);
      } else {
        setTotalGiven(0);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  return (
    <View style={[styles.cardContainer, { padding: cardPadding }]}>
      <View style={[styles.watermarkIcon, isRTL ? { left: -10, right: undefined } : { right: -10 }]} pointerEvents="none">
        <Ionicons name="heart" size={130} color="rgba(255,255,255,0.07)" />
      </View>

      <Text style={[styles.label, { textAlign }]}>{t('profile.stats.communityImpact')}</Text>

      {loading ? (
        <ActivityIndicator color="#FFFFFF" style={{ alignSelf: textAlign === 'right' ? 'flex-end' : 'flex-start', marginVertical: 10 }} />
      ) : (
        <Text style={[styles.title, { fontSize: titleFontSize, textAlign }]}>
          {t('profile.stats.totalBooks')}{'\n'}
          {t('profile.stats.given')}: {totalGiven}
        </Text>
      )}

      <Text style={[styles.savings, { textAlign }]}>
        {t('profile.stats.thankYou')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#003366',
    borderRadius: 24,
    width: '100%',
    marginTop: 16,
    shadowColor: '#001B39',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  watermarkIcon: {
    position: 'absolute',
    bottom: -20,
    right: -10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 8,
  },
  title: {
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 44,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  savings: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
  },
});