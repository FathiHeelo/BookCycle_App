import { ScrollView, StyleSheet, Text, View, Pressable, SafeAreaView, ActivityIndicator, Image, Dimensions, Platform, Alert, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ref, get, push, set } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';

import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

interface Book {
  id: string;
  title: string;
  courseName: string;
  facultyId: string;
  major: string;
  conditionId: string;
  description: string;
  pages: string;
  price: string;
  imageUrl?: string;
  image?: string;
  donorName: string;
  donorUid: string;
  [key: string]: any;
}

export default function BookDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useI18n();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherBooks, setOtherBooks] = useState<Book[]>([]);
  const [requesting, setRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'success'>('none');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError('No book ID provided');
        setLoading(false);
        return;
      }

      try {
        const bookRef = ref(FIREBASE_DB, `Books/${id}`);
        const snapshot = await get(bookRef);
        
        if (snapshot.exists()) {
          const bookData = { id: id as string, ...snapshot.val() };
          setBook(bookData);
          fetchOtherBooks(bookData.facultyId);
        } else {
          setError('Book not found');
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Failed to load book details');
      } finally {
        setLoading(false);
      }
    };

    const fetchOtherBooks = async (facultyId: string) => {
      try {
        const booksRef = ref(FIREBASE_DB, 'Books');
        // Simple fetch for others from same faculty
        const snapshot = await get(booksRef);
        if (snapshot.exists()) {
          const allBooks = snapshot.val();
          const list = Object.keys(allBooks)
            .map(key => ({ id: key, ...allBooks[key] }))
            .filter(b => b.facultyId === facultyId && b.id !== id)
            .slice(0, 5);
          setOtherBooks(list);
        }
      } catch (e) {
        console.log('Error fetching other books:', e);
      }
    };

    fetchBook();
  }, [id]);

  const handleRequest = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      Alert.alert(t('common.error'), t('auth.errors.mustBeLoggedIn'));
      return;
    }

    if (user.uid === book?.donorUid) {
      Alert.alert('Notice', "You cannot request your own book.");
      return;
    }

    setRequesting(true);
    try {
      const requestsRef = ref(FIREBASE_DB, 'Requests');
      const newRequestRef = push(requestsRef);
      
      await set(newRequestRef, {
        bookId: id,
        bookTitle: book?.title || 'Untitled Book',
        bookImage: book?.imageUrl || book?.image || '', // Ensure no undefined value
        requesterUid: user.uid,
        requesterName: user.displayName || user.email || 'Anonymous Student',
        donorUid: book?.donorUid || '',
        donorName: book?.donorName || 'Academic Donor',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      setRequestStatus('success');
      setModalVisible(false);
      Alert.alert('Success!', 'Your request has been sent to the donor.');
    } catch (e) {
      console.error('Request error:', e);
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (error || !book) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.error, fontSize: 16, fontWeight: '600' }}>{error || 'Book not found'}</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Overlay */}
      <View style={styles.floatingHeader}>
        <Pressable onPress={() => router.back()} style={styles.roundButton}>
          <Ionicons name="arrow-back" size={22} color={theme.primary} />
        </Pressable>
        <Pressable style={styles.roundButton}>
          <Ionicons name="share-outline" size={22} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Book Image */}
        <Image 
          source={{ uri: book.imageUrl || book.image || 'https://via.placeholder.com/600x800' }} 
          style={styles.heroImage} 
        />

        <View style={styles.mainContent}>
          {/* Badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: '#E0F2FE' }]}>
              <Text style={[styles.badgeText, { color: '#0369A1' }]}>
                {book.facultyId ? t(`faculties.${book.facultyId}`).toUpperCase() : 'GENERAL'}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.badgeText, { color: '#475569' }]}>HARDCOVER</Text>
            </View>
          </View>

          {/* Title & Author */}
          <Text style={[styles.title, { color: theme.primary }]}>{book.title}</Text>
          <Text style={[styles.author, { color: '#64748B' }]}>
            by {book.author || 'Academic Faculty'}
          </Text>

          {/* Info Grid */}
          <View style={styles.infoGrid}>
            <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
              <Text style={styles.infoLabel}>EDITION</Text>
              <Text style={[styles.infoValue, { color: theme.primary }]}>
                {book.edition || 'Latest Edition'}
              </Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
              <Text style={styles.infoLabel}>FACULTY</Text>
              <Text style={[styles.infoValue, { color: theme.primary }]} numberOfLines={1}>
                {book.facultyId ? t(`faculties.${book.facultyId}`) : 'Science & Eng'}
              </Text>
            </View>
          </View>
          <View style={[styles.infoCardWide, { backgroundColor: theme.card }]}>
            <Text style={styles.infoLabel}>CONDITION</Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              {book.conditionId ? t(`conditions.${book.conditionId}`) : 'Like New ✨'}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>Donor's Description</Text>
            <Text style={[styles.description, { color: '#475569' }]}>
              {book.description || 'This textbook was used for only one semester. It is in immaculate condition with no highlighting or folded pages. Hoping it helps another student succeed!'}
            </Text>
          </View>

          {/* Gifting By Card */}
          <View style={[styles.donorCard, { backgroundColor: '#F8FAFC' }]}>
            <Text style={styles.smallLabel}>GIFTING BY</Text>
            <View style={styles.donorHeader}>
              <View style={styles.donorAvatar}>
                <Ionicons name="person" size={24} color="#94A3B8" />
              </View>
              <View>
                <Text style={[styles.donorName, { color: theme.primary }]}>{book.donorName}</Text>
                <Text style={styles.donorSubtitle}>Active Donor • 5 Books Gifted</Text>
              </View>
            </View>
            <View style={styles.donorMeta}>
              <Ionicons name="location-outline" size={16} color="#64748B" />
              <Text style={styles.donorMetaText}>Main Campus Library, Area A</Text>
            </View>
            <View style={styles.donorMeta}>
              <Ionicons name="time-outline" size={16} color="#64748B" />
              <Text style={styles.donorMetaText}>Available for pickup: Sun-Thu</Text>
            </View>
            <Pressable style={styles.viewProfileBtn}>
              <Text style={styles.viewProfileText}>View Profile</Text>
            </Pressable>
          </View>

       

          {/* Others from Faculty */}
          {otherBooks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: theme.primary }]}>Others from Faculty</Text>
                <Pressable onPress={() => router.push('/explore')}>
                  <Text style={[styles.exploreLink, { color: theme.primary }]}>Explore all ›</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {otherBooks.map((other) => (
                  <Pressable 
                    key={other.id} 
                    style={styles.otherBookCard}
                    onPress={() => router.push(`../book-details/${other.id}`)}
                  >
                    <Image source={{ uri: other.imageUrl || other.image }} style={styles.otherBookImage} />
                    <Text style={styles.otherBookTitle} numberOfLines={1}>{other.title}</Text>
                    <Text style={styles.otherBookAuthor}>By {other.donorName}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.background }]}>
        <View style={styles.bottomBarInner}>
          <Pressable 
            style={[
              styles.requestBtn, 
              { backgroundColor: requestStatus === 'success' ? '#10B981' : theme.primary },
              requesting && { opacity: 0.7 }
            ]}
            onPress={() => requestStatus === 'none' && setModalVisible(true)}
            disabled={requesting || requestStatus === 'success'}
          >
            {requesting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons 
                  name={requestStatus === 'success' ? "checkmark-circle" : "heart-outline"} 
                  size={20} 
                  color="#FFF" 
                  style={{ marginRight: 8 }} 
                />
                <Text style={styles.requestBtnText}>
                  {requestStatus === 'success' ? 'Request Sent' : 'Request this Book'}
                </Text>
              </>
            )}
          </Pressable>
          <Pressable style={styles.messageBtn}>
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.primary} />
          </Pressable>
        </View>
      </View>

      {/* Request Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primary + '10' }]}>
                <Ionicons name="gift" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.primary }]}>Confirm Request</Text>
              <Text style={styles.modalSubtitle}>
                You are about to request "{book.title}". The donor will be notified to approve your request.
              </Text>
            </View>

            <View style={styles.modalDivider} />

            <View style={styles.modalFooter}>
              <Pressable 
                style={styles.cancelBtn} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable 
                style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
                onPress={handleRequest}
              >
                <Text style={styles.confirmBtnText}>Confirm Request</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  heroImage: {
    width: width,
    height: width * 1.2,
    resizeMode: 'cover',
  },
  mainContent: {
    marginTop: -30,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: Spacing.lg,
    minHeight: 500,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
    marginBottom: 6,
  },
  author: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoCardWide: {
    width: '100%',
    padding: 16,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 32,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 6,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  donorCard: {
    padding: 20,
    borderRadius: Radius.lg,
    marginBottom: 32,
  },
  smallLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 16,
  },
  donorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  donorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donorName: {
    fontSize: 17,
    fontWeight: '800',
  },
  donorSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  donorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  donorMetaText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  viewProfileBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
  mapPlaceholder: {
    height: 180,
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  mapOverlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  pickupLabel: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  pickupLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  exploreLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  horizontalScroll: {
    marginLeft: -Spacing.lg,
    paddingLeft: Spacing.lg,
  },
  otherBookCard: {
    width: 140,
    marginRight: 16,
  },
  otherBookImage: {
    width: 140,
    height: 180,
    borderRadius: Radius.md,
    marginBottom: 8,
  },
  otherBookTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  otherBookAuthor: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  bottomBarInner: {
    flexDirection: 'row',
    gap: 12,
  },
  requestBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  messageBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: Radius.pill,
    backgroundColor: '#F1F5F9',
  },
  backBtnText: {
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  modalDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 24,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: '#F1F5F9',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  confirmBtn: {
    flex: 2,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
});
