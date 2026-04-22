import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { getDatabase, ref, get } from 'firebase/database';

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        if (!id) return;

        const db = getDatabase();
        const snapshot = await get(ref(db, `Books/${id}`));

        if (snapshot.exists()) {
          setBook(snapshot.val());
        } else {
          setBook(null);
        }
      } catch (error) {
        console.error('Error fetching book:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#0A3D78" />
      </SafeAreaView>
    );
  }

  if (!book) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={{ fontSize: 16, fontWeight: '700' }}>Book not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: '#0A3D78' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Book Details</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity>
            <Feather name="share-2" size={19} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View style={styles.bookImageWrap}>
            <Image
              source={{
                uri: book.imageUrl?.trim()
                  ? book.imageUrl
                  : 'https://via.placeholder.com/600x400?text=Book+Image',
              }}
              style={styles.bookImage}
            />
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {book.status === 'available' ? 'AVAILABLE NOW' : 'UNAVAILABLE'}
              </Text>
            </View>
          </View>

          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{book.facultyName || 'FACULTY'}</Text>
            </View>
            <View style={styles.tagGray}>
              <Text style={styles.tagGrayText}>{book.condition || 'Unknown'}</Text>
            </View>
          </View>

          <Text style={styles.bookTitle}>{book.title}</Text>
          <Text style={styles.authorText}>{book.courseName || 'No course name'}</Text>

          <View style={styles.infoCardsRow}>
            <View style={styles.smallCard}>
              <Text style={styles.smallCardLabel}>FACULTY</Text>
              <Text style={styles.smallCardValue}>{book.facultyName || '-'}</Text>
            </View>

            <View style={styles.smallCard}>
              <Text style={styles.smallCardLabel}>MAJOR</Text>
              <Text style={styles.smallCardValue}>{book.major || '-'}</Text>
            </View>
          </View>

          <View style={styles.conditionCard}>
            <Text style={styles.smallCardLabel}>CONDITION</Text>
            <Text style={styles.smallCardValue}>{book.condition || '-'}</Text>
          </View>

          <Text style={styles.sectionTitle}>Donor's Description</Text>
          <Text style={styles.description}>
            {book.description?.trim() ? book.description : 'No description provided.'}
          </Text>

          <Text style={styles.sectionTitle}>Gifting By</Text>
          <View style={styles.donorCard}>
            <View style={styles.donorTop}>
              <View style={styles.fakeAvatar}>
                <Ionicons name="person" size={24} color="#0A3D78" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.donorName}>{book.donorName || 'Unknown User'}</Text>
                <Text style={styles.donorMeta}>{book.donorEmail || 'No email'}</Text>
              </View>
            </View>

            <View style={styles.donorInfoRow}>
              <Ionicons name="location-outline" size={16} color="#64748B" />
              <Text style={styles.donorInfoText}>
                {book.pickupLocation || 'No pickup location'}
              </Text>
            </View>

            <View style={styles.donorInfoRow}>
              <Ionicons name="time-outline" size={16} color="#64748B" />
              <Text style={styles.donorInfoText}>
                Added on: {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : '-'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.requestBtn}>
          <Ionicons name="heart-outline" size={18} color="#fff" />
          <Text style={styles.requestBtnText}>Request this Book</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatBtn}>
          <Ionicons name="chatbubble-outline" size={20} color="#0A3D78" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  headerActions: { flexDirection: 'row', gap: 14 },
  topSection: { padding: 16, paddingBottom: 100 },
  bookImageWrap: { position: 'relative', marginBottom: 18 },
  bookImage: { width: '100%', height: 265, borderRadius: 20, backgroundColor: '#E5E7EB' },
  badge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: '#FACC15',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: { fontSize: 11, fontWeight: '800', color: '#1E293B' },
  tagsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tag: {
    backgroundColor: '#DDF2FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: { fontSize: 10, fontWeight: '700', color: '#355C9B' },
  tagGray: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagGrayText: { fontSize: 10, fontWeight: '700', color: '#475569' },
  bookTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  authorText: { fontSize: 16, color: '#475569', marginBottom: 20 },
  infoCardsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  smallCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  conditionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 22,
  },
  smallCardLabel: { fontSize: 10, fontWeight: '700', color: '#94A3B8', marginBottom: 8 },
  smallCardValue: { fontSize: 16, fontWeight: '700', color: '#0F172A', lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 24, color: '#475569', marginBottom: 24 },
  donorCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  donorTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  fakeAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: '#DCEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donorName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  donorMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  donorInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  donorInfoText: { fontSize: 13, color: '#475569' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestBtn: {
    flex: 1,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0A3D78',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  requestBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  chatBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});