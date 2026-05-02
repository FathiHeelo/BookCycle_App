import React from 'react';
import { ScrollView, Text, View, Pressable, TouchableOpacity, SafeAreaView, ActivityIndicator, Image, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { FIREBASE_AUTH } from '@/firebaseConfig';
import { DetailStyles as styles } from '../styles';
import { useBookDetails } from '../hooks/useBookDetails';

type BookDetailsUIProps = ReturnType<typeof useBookDetails>;

export const BookDetailsUI = (props: BookDetailsUIProps) => {
  const { 
    book, loading, error, otherBooks, requesting, 
    requestStatus, modalVisible, setModalVisible, handleRequest, handleShare, 
    donorProfile, donorStats, t, isRTL 
  } = props;

  const router = useRouter();
  const { theme: themeKey } = useAppTheme();
  const theme = Colors[themeKey];

  const bookImageUri = book?.imageUrl || book?.image;
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

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
        <Pressable onPress={() => router.back()} style={[styles.roundButton, { backgroundColor: themeKey === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255,255,255,0.9)' }]}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={22} color={theme.primary} />
        </Pressable>
        <Pressable onPress={handleShare} style={[styles.roundButton, { backgroundColor: themeKey === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255,255,255,0.9)' }]}>
          <Ionicons name="share-outline" size={22} color={theme.primary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image 
          source={{ uri: bookImageUri || 'https://via.placeholder.com/600x800' }} 
          style={styles.heroImage} 
        />

        <View style={[styles.mainContent, { backgroundColor: theme.card }]}>
          <View style={[styles.badgeRow, { flexDirection }]}>
            {book.facultyIds ? (
              book.facultyIds.map((fId: string) => (
                <View key={fId} style={[styles.badge, { backgroundColor: themeKey === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7' }]}>
                  <Text style={[styles.badgeText, { color: theme.primary }]}>
                    {t(`faculties.${fId}`).toUpperCase()}
                  </Text>
                </View>
              ))
            ) : (
              <View style={[styles.badge, { backgroundColor: themeKey === 'dark' ? 'rgba(245, 158, 11, 0.15)' : '#FEF3C7' }]}>
                <Text style={[styles.badgeText, { color: theme.primary }]}>
                  {book.facultyId ? t(`faculties.${book.facultyId}`).toUpperCase() : (isRTL ? 'عام' : 'GENERAL')}
                </Text>
              </View>
            )}
            <View style={[styles.badge, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}>
              <Text style={[styles.badgeText, { color: theme.textSecondary }]}>{isRTL ? 'غلاف مقوى' : 'HARDCOVER'}</Text>
            </View>
          </View>

          <Text style={[styles.title, { color: theme.text, textAlign }]}>
            {isRTL ? (book.titleAr || book.title) : book.title}
          </Text>
          <Text style={[styles.author, { color: theme.textSecondary, textAlign }]}>
            {t('bookDetails.by', { defaultValue: isRTL ? 'بواسطة' : 'by' })} {book.author || (isRTL ? 'عضو هيئة تدريس' : 'Academic Faculty')}
          </Text>

          {book.price && (
            <View style={[styles.infoCardWide, { 
              backgroundColor: 'rgba(16, 185, 129, 0.05)', 
              borderColor: '#10B981', 
              borderWidth: 1,
              marginBottom: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }]}>
              <View>
                <Text style={[styles.infoLabel, { textAlign, color: '#10B981', marginBottom: 0 }]}>
                  {(isRTL ? 'السعر المطلوب' : 'REQUESTED PRICE').toUpperCase()}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 11, textAlign }}>
                  {isRTL ? 'هذا المصدر متاح للبيع' : 'This resource is available for sale'}
                </Text>
              </View>
              <Text style={{ color: '#10B981', fontSize: 24, fontWeight: '900' }}>₪{book.price}</Text>
            </View>
          )}

          <View style={[styles.infoGrid, { flexDirection }]}>
            <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.infoLabel, { textAlign }]}>{t('categories.title').toUpperCase()}</Text>
              <Text style={[styles.infoValue, { color: theme.primary, textAlign }]}>
                {book.categoryId ? t(`categories.${book.categoryId}`) : (isRTL ? 'مصدر دراسي' : 'Study Resource')}
              </Text>
            </View>
            <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.infoLabel, { textAlign }]}>{(isRTL ? 'الطبعة/الموديل' : 'EDITION/MODEL').toUpperCase()}</Text>
              <Text style={[styles.infoValue, { color: theme.primary, textAlign }]}>
                {book.edition || (isRTL ? 'أحدث طبعة' : 'Latest')}
              </Text>
            </View>
          </View>

          {/* Majors Section */}
          {(book.majors || book.major) && (
            <View style={[styles.infoCardWide, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.infoLabel, { textAlign }]}>{t('auth.signup.majorLabel').toUpperCase()}</Text>
              <View style={[styles.tagContainer, { flexDirection }]}>
                {book.majors ? (
                  book.majors.map((m: string) => (
                    <View key={m} style={[styles.majorTag, { backgroundColor: themeKey === 'dark' ? theme.background : '#F1F5F9' }]}>
                      <Text style={[styles.majorTagText, { color: theme.textSecondary }]}>{m}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={[styles.infoValue, { color: theme.primary, textAlign }]}>{book.major}</Text>
                )}
              </View>
            </View>
          )}

          <View style={[styles.infoCardWide, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.infoLabel, { textAlign }]}>{(isRTL ? 'الحالة' : 'CONDITION').toUpperCase()}</Text>
            <Text style={[styles.infoValue, { color: theme.primary, textAlign }]}>
              {book.conditionId ? t(`conditions.${book.conditionId}`) : (isRTL ? 'مثل الجديد ✨' : 'Like New ✨')}
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text, textAlign }]}>{t('bookDetails.description')}</Text>
            <Text style={[styles.description, { color: theme.textSecondary, textAlign }]}>
              {isRTL ? (book.descriptionAr || book.description) : (book.description || t('bookDetails.noDescription'))}
            </Text>
          </View>

          <View style={[styles.donorSection, { backgroundColor: themeKey === 'dark' ? 'rgba(245, 158, 11, 0.05)' : '#F8FAFC', borderColor: theme.border, borderWidth: 1 }]}>
            <Text style={[styles.donorLabel, { textAlign }]}>{isRTL ? 'بواسطة' : 'GIFTING BY'}</Text>
            
            <View style={[styles.donorHeader, { flexDirection }]}>
              <View style={[styles.donorAvatar, { backgroundColor: themeKey === 'dark' ? theme.background : '#F1F5F9' }]}>
                {donorProfile?.photoURL ? (
                  <Image source={{ uri: donorProfile.photoURL }} style={styles.avatarImg} />
                ) : (
                  <Ionicons name="person" size={28} color={theme.textSecondary} />
                )}
              </View>
              
              <View style={[styles.donorInfo, isRTL ? { marginRight: 16 } : { marginLeft: 16 }]}>
                <Text style={[styles.donorName, { textAlign, color: theme.text }]}>
                  {book.donorName}
                </Text>
                <Text style={[styles.donorSubtext, { textAlign, color: theme.textSecondary }]}>
                  {donorProfile?.role === 'professor' ? t('auth.signup.professor') : t('auth.signup.student')}
                  {' • '}
                  {isRTL ? `${donorStats?.impact || 0} مساهمة` : `${donorStats?.impact || 0} Contributions`}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.viewProfileBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
              onPress={() => router.push(`../public-profile/${book.donorUid}`)}
            >
              <Text style={[styles.viewProfileText, { color: theme.primary }]}>{isRTL ? 'عرض الملف الشخصي' : 'View Profile'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <View style={[styles.bottomBarInner, { flexDirection }]}>
          <Pressable 
            style={[
              styles.requestBtn, 
              { backgroundColor: requestStatus === 'success' ? '#10B981' : theme.primary },
              (requesting || book.status === 'requested' || book.status === 'received' || book.status === 'completed') && { opacity: 0.7 }
            ]}
            onPress={() => {
              if (book.status === 'requested' || book.status === 'received' || book.status === 'completed') {
                Alert.alert(isRTL ? 'غير متوفر' : 'Not Available', isRTL ? 'هذا المصدر تم حجزه أو استلامه بالفعل.' : 'This resource has already been requested or received.');
                return;
              }
              requestStatus === 'none' && setModalVisible(true);
            }}
            disabled={requesting || requestStatus === 'success' || book.status === 'requested' || book.status === 'received' || book.status === 'completed'}
          >
            {requesting ? (
              <ActivityIndicator color={themeKey === 'dark' ? '#0B1020' : '#FFF'} />
            ) : (
              <View style={{ flexDirection, alignItems: 'center' }}>
                <Ionicons 
                  name={requestStatus === 'success' ? "checkmark-circle" : (book.status === 'requested' || book.status === 'received' || book.status === 'completed' ? "lock-closed" : "heart-outline")} 
                  size={20} 
                  color={themeKey === 'dark' ? '#0B1020' : '#FFF'} 
                  style={isRTL ? { marginLeft: 8 } : { marginRight: 8 }} 
                />
                <Text style={[styles.requestBtnText, { color: themeKey === 'dark' ? '#0B1020' : '#FFF' }]}>
                  {requestStatus === 'success' 
                    ? (isRTL ? 'تم إرسال الطلب' : 'Request Sent') 
                    : (book.status === 'requested' || book.status === 'received' || book.status === 'completed' 
                        ? (isRTL ? 'غير متوفر' : 'Not Available') 
                        : (isRTL ? 'اطلب هذا المصدر' : 'Request this Resource'))}
                </Text>
              </View>
            )}
          </Pressable>
          <Pressable 
            style={[styles.messageBtn, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
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
              <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                {isRTL ? 'أنت على وشك طلب هذا الكتاب. سيتم إخطار المساهم للموافقة على طلبك.' : 'You are about to request this book. The contributor will be notified to approve your request.'}
              </Text>
            </View>
            <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />
            <View style={[styles.modalFooter, { flexDirection }]}>
              <Pressable style={[styles.cancelBtn, { backgroundColor: themeKey === 'dark' ? theme.background : '#F1F5F9' }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>{t('common.cancel')}</Text>
              </Pressable>
              <Pressable style={[styles.confirmBtn, { backgroundColor: theme.primary }]} onPress={handleRequest}>
                <Text style={[styles.confirmBtnText, { color: themeKey === 'dark' ? '#0B1020' : '#FFF' }]}>{isRTL ? 'تأكيد الطلب' : 'Confirm Request'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
