import UploadPhotoScreen from '@/src/Feature/Add_Books/upload_photo';
import DataScreen from '@/src/Feature/Add_Books/Data';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
    Alert,
} from 'react-native';
import { ref, update } from 'firebase/database';
import { FIREBASE_DB } from '@/firebaseConfig';
import { useRouter } from 'expo-router';

export default function Add_Books() {   
    const [step, setStep] = React.useState(1);
    const [bookId, setBookId] = React.useState<string | null>(null);
    const { width } = useWindowDimensions();
    const router = useRouter();
    const horizontalPadding = Math.min(width * 0.05, 20);

    const handleUpdateBookData = async (data: any) => {
        if (!bookId) {
            Alert.alert('Error', 'Book ID missing. Please start over.');
            setStep(1);
            return;
        }
        
        try {
            const bookRef = ref(FIREBASE_DB, `Books/${bookId}`);
            await update(bookRef, {
                ...data,
                status: 'active', // Mark as active once details are added
                updatedAt: new Date().toISOString(),
            });
            
            Alert.alert(
                'Success', 
                'Book added successfully!',
                [{ text: 'OK', onPress: () => router.replace('/') }]
            );
        } catch (error) {
            console.error('Error updating book details:', error);
            Alert.alert('Error', 'Failed to save book details. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar barStyle="dark-content" backgroundColor="#F3F4F6" />
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
                        <UploadPhotoScreen 
                            onNext={(id: string) => {
                                setBookId(id);
                                setStep(2);
                            }} 
                        />
                    )}
                    {step === 2 && (
                        <DataScreen 
                            onNext={handleUpdateBookData}
                            onBack={() => setStep(1)}
                            initialData={{}} // Pass existing data if any
                        />
                    )}
                    {/* Add Step 3 and 4 placeholders here */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 24,
    },
    cardWrapper: {
        width: '100%',
    },
});
