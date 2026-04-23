import Books_Given from '@/src/Feature/ProfilePage/Books_Given';
import Books_Received from '@/src/Feature/ProfilePage/Books_Received';
import ContributorCard from '@/src/Feature/ProfilePage/Contributor';
import TotalBook_Card from '@/src/Feature/ProfilePage/TotalBook_Card';
import Profile_Card from '@/src/Feature/ProfilePage/Profile_Card';
import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
    ActivityIndicator,
} from 'react-native';
import { getAuth } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';
import { FIREBASE_DB } from '@/firebaseConfig';

export default function Profile() {
    const { width } = useWindowDimensions();
    const horizontalPadding = Math.min(width * 0.05, 20);
    const auth = getAuth();
    const user = auth.currentUser;

    const [stats, setStats] = useState({
        rating: 0,
        reliability: 0,
        impact: 0,
        totalGiven: 0,
        totalReceived: 0,
    });
    const [userProfile, setUserProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        // Fetch Stats
        const statsRef = ref(FIREBASE_DB, `Users/${user.uid}/stats`);
        const unsubStats = onValue(statsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                setStats(prev => ({ 
                    ...prev, 
                    ...data,
                    // Handle both old and new database schemas for rating
                    rating: data.rating !== undefined ? data.rating : (data.averageRating || 0)
                }));
            }
        });

        // Fetch Profile (for role, etc.)
        const userRef = ref(FIREBASE_DB, `Users/${user.uid}`);
        const unsubProfile = onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                setUserProfile(snapshot.val());
            }
        });

        // Live calculation of Books Given
        const booksRef = ref(FIREBASE_DB, 'Books');
        const { query, orderByChild, equalTo } = require('firebase/database');
        const userBooksQuery = query(booksRef, orderByChild('donorUid'), equalTo(user.uid));
        
        const unsubBooks = onValue(userBooksQuery, (snapshot) => {
            if (snapshot.exists()) {
                const count = Object.keys(snapshot.val()).length;
                setStats(prev => ({ ...prev, totalGiven: count }));
            } else {
                setStats(prev => ({ ...prev, totalGiven: 0 }));
            }
            setLoading(false);
        });

        return () => {
            unsubStats();
            unsubProfile();
            unsubBooks();
        };
    }, [user]);

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#001B39" />
            </SafeAreaView>
        );
    }

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
                    <Profile_Card stats={stats} userProfile={userProfile} />
                    <TotalBook_Card stats={stats} />
                    <ContributorCard stats={stats} />
                    <Books_Given />
                    <Books_Received />
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    scrollContent: {
        flexGrow: 1,
        paddingVertical: 24,
    },
    cardWrapper: {
        width: '100%',
    },
});
