import Books_Given from '@/src/Feature/ProfilePage/Books_Given';
import Books_Received from '@/src/Feature/ProfilePage/Books_Received';
import ContributorCard from '@/src/Feature/ProfilePage/Contributor';
import TotalBook_Card from '@/src/Feature/ProfilePage/TotalBook_Card';
import Profile_Card from '@/src/Feature/ProfilePage/Profile_Card';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    useWindowDimensions,
    View,
} from 'react-native';

export default function Profile() {
    const { width } = useWindowDimensions();
    const horizontalPadding = Math.min(width * 0.05, 20);

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
                    <Profile_Card />
                    <TotalBook_Card />
                    <ContributorCard />
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
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingVertical: 24,
    },
    cardWrapper: {
        width: '100%',
    },
});
