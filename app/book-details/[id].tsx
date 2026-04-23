import { ScrollView, StyleSheet, Text, View, Pressable, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Dimensions, Platform, Alert, Modal, Share } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Radius, Spacing } from '../../constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ref, get, push, set } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useI18n } from '@/hooks/use-i18n';
import React, { useState, useEffect } from 'react';

const { width } = Dimensions.get('window');

interface Book {
  id: string;
  title: string;
  courseName: string;
  facultyId?: string; // Legacy
  facultyIds?: string[]; // New
  major?: string; // Legacy
  majors?: string[]; // New
  conditionId: string;
  description: string;
  pages: string;
  price: string;
  imageUrl?: string;
  image?: string;
  donorName: string;
  donorUid: string;
  author?: string;
  edition?: string;
  [key: string]: any;
}

export default function BookDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t, isRTL } = useI18n();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherBooks, setOtherBooks] = useState<Book[]>([]);
  const [requesting, setRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<'none' | 'pending' | 'success'>('none');
  const [modalVisible, setModalVisible] = useState(false);
  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [donorStats, setDonorStats] = useState<any>(null);

  const bookImageUri = book?.imageUrl || book?.image;
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  useEffect(() => {
    const fetchBook = async () => {
      if (!id) {
        setError(t('bookDetails.noBookId', { defaultValue: 'No book ID provided' }));
        setLoading(false);
        return;
      }

      try {
        const bookRef = ref(FIREBASE_DB, `Books/${id}`);
        const snapshot = await get(bookRef);
        
        if (snapshot.exists()) {
          const bookData = { id: id as string, ...snapshot.val() };
          setBook(bookData);
          
          // Fetch Donor Profile for role
          if (bookData.donorUid) {
            const donorRef = ref(FIREBASE_DB, `Users/${bookData.donorUid}`);
            const donorSnap = await get(donorRef);
            if (donorSnap.exists()) {
              setDonorProfile(donorSnap.val());
            }

            const statsRef = ref(FIREBASE_DB, `Users/${bookData.donorUid}/stats`);
            const statsSnap = await get(statsRef);
            if (statsSnap.exists()) {
              setDonorStats(statsSnap.val());
            }
          }

          // For suggestions, use the first faculty ID
          const suggestionFaculty = bookData.facultyIds?.[0] || bookData.facultyId;
          if (suggestionFaculty) fetchOtherBooks(suggestionFaculty);
        } else {
          setError(t('bookDetails.notFound', { defaultValue: 'Book not found' }));
        }
      } catch (err) {
        console.error('Error fetching book:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    const fetchOtherBooks = async (facultyId: string) => {
      try {
        const booksRef = ref(FIREBASE_DB, 'Books');
        const snapshot = await get(booksRef);
        if (snapshot.exists()) {
          const allBooks = snapshot.val();
          const list = Object.keys(allBooks)
            .map(key => ({ id: key, ...allBooks[key] }))
            .filter(b => (b.facultyIds?.includes(facultyId) || b.facultyId === facultyId) && b.id !== id)
            .slice(0, 5);
          setOtherBooks(list);
        }
      } catch (e) {
        console.log('Error fetching other books:', e);
      }
    };

    fetchBook();
  }, [id, t]);

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `${book?.title}\n\n${t('bookDetails.description')}: ${book?.description || ''}\n\nShared via BookCycle App`,
        title: book?.title,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  const handleRequest = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      Alert.alert(t('common.error'), t('auth.errors.mustBeLoggedIn'));
      return;
    }

    if (user.uid === book?.donorUid) {
      Alert.alert(t('common.notice', { defaultValue: 'Notice' }), t('bookDetails.ownBookError', { defaultValue: "You cannot request your own book." }));
      return;
    }

    setRequesting(true);
    try {
      const requestsRef = ref(FIREBASE_DB, 'Requests');
      const newRequestRef = push(requestsRef);
      
      await set(newRequestRef, {
        bookId: id,
        bookTitle: book?.title || 'Untitled Book',
        bookImage: book?.imageUrl || book?.image || '',
        requesterUid: user.uid,
        requesterName: user.displayName || user.email || 'Anonymous Student',
        donorUid: book?.donorUid || '',
        donorName: book?.donorName || 'Academic Contributor',
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      setRequestStatus('success');
      setModalVisible(false);
      Alert.alert(t('common.success', { defaultValue: 'Success!' }), t('bookDetails.requestSent', { defaultValue: 'Your request has been sent to the contributor.' }));
    } catch (e) {
      console.error('Request error:', e);
      Alert.alert(t('common.error'), t('bookDetails.requestFailed', { defaultValue: 'Failed to send request. Please try again.' }));
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
        <Text style={{ color: theme.error, fontSize: 16, fontWeight: '600' }}>{error}</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{t('common.back')}</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Overlay */}
      <View style={[styles.floatingHeader, { flexDirection }]}>
        <Pressable onPress={() => router.back()} style={styles.roundButton}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={22} color={theme.primary} />
        </Pressable>
        <Pressable onPress={handleShare} style={styles.roundButton}>
          <Ionicons name="share-outline" size={22} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image 
          source={{ uri: bookImageUri || 'https://via.placeholder.com/600x800' }} 
          style={styles.heroImage} 
        />

        <View style={styles.mainContent}>
          <View style={[styles.badgeRow, { flexDirection }]}>
            {book.facultyIds ? (
              book.facultyIds.map((fId: string) => (
                <View key={fId} style={[styles.badge, { backgroundColor: '#E0F2FE' }]}>
                  <Text style={[styles.badgeText, { color: '#0369A1' }]}>
                    {t(`faculties.${fId}`).toUpperCase()}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[styles.badge, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.badgeText, { color: '#0369A1' }]}>
                  {book.facultyId ? t(`faculties.${book.facultyId}`).toUpperCase() : (isRTL ? 'عام' : 'GENERAL')}
                </Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.badgeText, { color: '#475569' }]}>{isRTL ? 'غلاف مقوى' : 'HARDCOVER'}</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: theme.primary, textAlign }]}>{book.title}</Text>
          <Text style={[styles.author, { color: '#64748B', textAlign }]}>
            {t('bookDetails.by', { defaultValue: isRTL ? 'بواسطة' : 'by' })} {book.author || (isRTL ? 'عضو هيئة تدريس' : 'Academic Faculty')}
          </Text>

          <View style={[styles.infoGrid, { flexDirection }]}>
            <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.infoLabel, { textAlign }]}>{t('categories.title').toUpperCase()}</Text>
              <Text style={[styles.infoValue, { color: theme.primary, textAlign }]}>
                {book.categoryId ? t(`categories.${book.categoryId}`) : (isRTL ? 'مصدر دراسي' : 'Study Resource')}
              </Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.infoLabel, { textAlign }]}>{(isRTL ? 'الطبعة/الموديل' : 'EDITION/MODEL').toUpperCase()}</Text>
              <Text style={[styles.infoValue, { color: theme.primary, textAlign }]}>
                {book.edition || (isRTL ? 'أحدث طبعة' : 'Latest')}
              </Text>
            </View>
          </View>

          {/* Majors Section */}
          {(book.majors || book.major) && (
            <View style={[styles.infoCardWide, { backgroundColor: theme.card }]}>
              <Text style={[styles.infoLabel, { textAlign }]}>{t('auth.signup.majorLabel').toUpperCase()}</Text>
              <View style={[styles.tagContainer, { flexDirection }]}>
                {book.majors ? (
                  book.majors.map((m: string) => (
                    <View key={m} style={styles.majorTag}>
                      <Text style={styles.majorTagText}>{m}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.infoValue, { color: theme.primary, textAlign }]}>{book.major}</Text>
                )}
              </View>
            </View>
          )}

          <View style={[styles.infoCardWide, { backgroundColor: theme.card }]}>
            <Text style={[styles.infoLabel, { textAlign }]}>{(isRTL ? 'الحالة' : 'CONDITION').toUpperCase()}</Text>
            <Text style={[styles.infoValue, { color: theme.primary, textAlign }]}>
              {book.conditionId ? t(`conditions.${book.conditionId}`) : (isRTL ? 'مثل الجديد ✨' : 'Like New ✨')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.primary, textAlign }]}>{t('bookDetails.description')}</Text>
            <Text style={[styles.description, { color: '#475569', textAlign }]}>
              {book.description || t('bookDetails.noDescription')}
            </Text>
          </View>

          <View style={styles.donorSection}>
            <Text style={[styles.donorLabel, { textAlign }]}>{isRTL ? 'بواسطة' : 'GIFTING BY'}</Text>
            
            <View style={[styles.donorHeader, { flexDirection }]}>
              <View style={[styles.donorAvatar, { backgroundColor: '#fff' }]}>
                {donorProfile?.photoURL ? (
                  <Image source={{ uri: donorProfile.photoURL }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={28} color="#94A3B8" />
                )}
              </View>
              
              <View style={[styles.donorInfo, isRTL ? { marginRight: 16 } : { marginLeft: 16 }]}>
                <Text style={[styles.donorName, { textAlign, color: '#001B39' }]}>
                  {book.donorName}
                </Text>
                <Text style={[styles.donorSubtext, { textAlign }]}>
                  {donorProfile?.role === 'professor' ? t('auth.signup.professor') : t('auth.signup.student')}
                  {' • '}
                  {isRTL ? `${donorStats?.impact || 0} مساهمة` : `${donorStats?.impact || 0} Contributions`}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.viewProfileBtn}
              onPress={() => router.push(`../public-profile/${book.donorUid}`)}
            >
              <Text style={styles.viewProfileBtnText}>{isRTL ? 'عرض الملف الشخصي' : 'View Profile'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.background }]}>
        <View style={[styles.bottomBarInner, { flexDirection }]}>
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
              <View style={{ flexDirection, alignItems: 'center' }}>
                <Ionicons 
                  name={requestStatus === 'success' ? "checkmark-circle" : "heart-outline"} 
                  size={20} 
                  color="#FFF" 
                  style={isRTL ? { marginLeft: 8 } : { marginRight: 8 }} 
                />
                <Text style={styles.requestBtnText}>
                  {requestStatus === 'success' ? (isRTL ? 'تم إرسال الطلب' : 'Request Sent') : (isRTL ? 'اطلب هذا المصدر' : 'Request this Material')}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable 
            style={styles.messageBtn}
            onPress={() => {
              const currentUser = FIREBASE_AUTH.currentUser;
              if (!currentUser) {
                Alert.alert(t('common.error'), t('auth.errors.mustBeLoggedIn'));
                return;
              }
              const chatId = [currentUser.uid, book.donorUid].sort().join('_');
              router.push({
                pathname: `../chat/${chatId}`,
                params: { 
                  otherName: book.donorName,
                  otherId: book.donorUid,
                  bookTitle: book.title
                }
              });
            }}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.primary} />
          </Pressable>
        </View>
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primary + '10' }]}>
                <Ionicons name="gift" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.modalTitle, { color: theme.primary }]}>{isRTL ? 'تأكيد الطلب' : 'Confirm Request'}</Text>
              <Text style={styles.modalSubtitle}>
                {isRTL ? 'أنت على وشك طلب هذا الكتاب. سيتم إخطار المساهم للموافقة على طلبك.' : 'You are about to request this book. The contributor will be notified to approve your request.'}
              </Text>
            </View>
            <View style={styles.modalDivider} />
            <View style={[styles.modalFooter, { flexDirection }]}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable style={[styles.confirmBtn, { backgroundColor: theme.primary }]} onPress={handleRequest}>
                <Text style={styles.confirmBtnText}>{isRTL ? 'تأكيد الطلب' : 'Confirm Request'}</Text>
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
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
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
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  majorTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  majorTagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
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
    marginBottom: 12,
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
    marginTop: 20,
  },
  sectionHeader: {
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
  donorSection: {
    marginTop: 24,
    marginBottom: 32,
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  donorLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#94A3B8',
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  donorHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  donorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  donorInfo: {
    flex: 1,
  },
  donorName: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  donorSubtext: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  viewProfileBtn: {
    backgroundColor: '#E2E8F0',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewProfileBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#001B39',
  },
  conditionSection: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  donorMetaText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  exploreLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  horizontalScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
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
    gap: 12,
  },
  requestBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.pill,
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
