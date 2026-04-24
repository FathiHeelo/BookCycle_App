import { AddBookUploadScreen, AddBookDataScreen } from '@/src/features/add_books';
import React, { useEffect, useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Text,
} from 'react-native';
import { ref, push, set, get, update } from 'firebase/database';
import { FIREBASE_DB, FIREBASE_AUTH } from '@/firebaseConfig';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { CustomHeader } from '@/src/components/shared/CustomHeader';
import { uploadImageToCloudinary } from '@/src/services/cloudinary.service';

export default function Add_Books() {   
    const [step, setStep] = useState(1);
    const [bookId, setBookId] = useState<string | undefined>(undefined); // Only used for editing
    const [tempImageUri, setTempImageUri] = useState<string | undefined>(undefined);
    const [initialData, setInitialData] = useState<any>(undefined);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const { width } = useWindowDimensions();
    const router = useRouter();
    const params = useLocalSearchParams();
    const editId = params.editId as string;
    const { theme } = useAppTheme();
    const themeColors = Colors[theme];
    
    const horizontalPadding = Math.min(width * 0.05, 20);
    const { t, isRTL } = useI18n();

    useEffect(() => {
        if (editId) {
            setLoading(true);
            const bookRef = ref(FIREBASE_DB, `Books/${editId}`);
            get(bookRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    setInitialData(data);
                    setBookId(editId);
                    setTempImageUri(data.imageUrl || data.image);
                    setStep(2); 
                }
                setLoading(false);
            }).catch((err) => {
                console.error(err);
                setLoading(false);
            });
        }
    }, [editId]);

    const handleSaveBook = async (formData: any) => {
        const user = FIREBASE_AUTH.currentUser;
        if (!user) {
            Alert.alert(t('common.error'), t('auth.errors.mustBeLoggedIn'));
            return;
        }

        if (!tempImageUri) {
            Alert.alert(t('common.error'), isRTL ? 'يرجى اختيار صورة أولاً' : 'Please select an image first');
            setStep(1);
            return;
        }

        setSaving(true);
        try {
            let finalImageUrl = tempImageUri;

            // Only upload if it's a new local URI (doesn't start with http)
            if (tempImageUri && !tempImageUri.startsWith('http')) {
                finalImageUrl = await uploadImageToCloudinary({
                    uri: tempImageUri,
                    folder: `bookcycle/resources/${user.uid}`,
                    fileName: `${Date.now()}`,
                });
            }

            const bookData = {
                ...formData,
                imageUrl: finalImageUrl,
                donorUid: user.uid,
                donorName: user.displayName || 'Contributor',
                status: initialData?.status || 'active',
                createdAt: initialData?.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            if (bookId) {
                // Editing existing book
                const bookRef = ref(FIREBASE_DB, `Books/${bookId}`);
                await update(bookRef, bookData);
            } else {
                // Creating new book
                const booksRef = ref(FIREBASE_DB, 'Books');
                const newBookRef = push(booksRef);
                await set(newBookRef, bookData);
            }

            Alert.alert(
                t('common.success'), 
                isRTL ? 'تم حفظ المصدر بنجاح!' : 'Resource saved successfully!',
                [{ text: t('common.save'), onPress: () => router.replace('/(tabs)/profile') }]
            );
        } catch (error) {
            console.error('Error saving book:', error);
            Alert.alert(t('common.error'), isRTL ? 'فشل في حفظ البيانات.' : 'Failed to save data.');
        } finally {
            setSaving(false);
        }
    };

    if (loading || saving) {
        return (
            <View style={[styles.screen, { backgroundColor: themeColors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={themeColors.primary} />
                {saving && (
                    <Text style={{ marginTop: 16, fontWeight: '700', color: themeColors.text }}>
                        {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                    </Text>
                )}
            </View>
        );
    }

    return (
        <View style={[styles.screen, { backgroundColor: themeColors.background }]}>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
            <View style={[styles.container, { backgroundColor: themeColors.background }]}>
                <CustomHeader 
                    title={initialData ? (isRTL ? 'تعديل الكتاب' : 'Edit Book') : (isRTL ? 'إضافة كتاب' : 'Give a Book')}
                    leftMode="none"
                    rightIcons={['search']}
                    hideSafeArea={true}
                />
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingHorizontal: horizontalPadding },
                        ]}
                        showsVerticalScrollIndicator={false}
                        bounces={true}
                    >
                        <View style={styles.cardWrapper}>
                            {step === 1 && (
                                <AddBookUploadScreen 
                                    initialImage={tempImageUri ?? undefined}
                                    onNext={(uri: string) => {
                                        setTempImageUri(uri);
                                        setStep(2);
                                    }} 
                                />
                            )}
                            {step === 2 && (
                                <AddBookDataScreen 
                                    onNext={handleSaveBook}
                                    onBack={() => setStep(1)}
                                    initialData={initialData} 
                                />
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 24,
        paddingBottom: 120, // Prevent tab bar overlap
    },
    cardWrapper: {
        width: '100%',
    },
});
