import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { getDatabase, ref, get, push, set } from 'firebase/database';
import { FIREBASE_AUTH } from '@/firebaseConfig';

export default function GiveBookScreen() {
  const [bookTitle, setBookTitle] = useState('');
  const [courseName, setCourseName] = useState('');
  const [faculty, setFaculty] = useState('');
  const [condition, setCondition] = useState('New');
  const [description, setDescription] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddBook = async () => {
    try {
      const currentUser = FIREBASE_AUTH.currentUser;

      if (!currentUser?.uid) {
        Alert.alert('Error', 'No logged in user found.');
        return;
      }

      if (!bookTitle.trim() || !courseName.trim()) {
        Alert.alert('Missing Data', 'Please fill in book title and course name.');
        return;
      }

      setLoading(true);

      const db = getDatabase();

      // جيب بيانات اليوزر من users/{uid}
      const userRef = ref(db, `users/${currentUser.uid}`);
      const userSnap = await get(userRef);

      if (!userSnap.exists()) {
        Alert.alert('Error', 'User data not found in database.');
        setLoading(false);
        return;
      }

      const userData = userSnap.val();

      // إذا المستخدم ما اختار faculty من الفورم، خذها من بياناته
      const finalFaculty = faculty || userData.facultyName || '';
      const finalFacultyId = userData.facultyId || '';

      // اعمل book جديد
      const booksRef = ref(db, 'Books');
      const newBookRef = push(booksRef);
      const bookId = newBookRef.key;

      const newBook = {
        id: bookId,
        title: bookTitle.trim(),
        courseName: courseName.trim(),
        facultyName: finalFaculty,
        facultyId: finalFacultyId,
        condition: condition,
        description: description.trim(),
        pickupLocation: pickupLocation.trim(),
        imageUrl: imageUrl.trim(),
        donorUid: currentUser.uid,
        donorName: userData.fullName || currentUser.displayName || 'Unknown User',
        donorEmail: userData.email || currentUser.email || '',
        major: userData.major || '',
        createdAt: new Date().toISOString(),
        status: 'available',
      };

      await set(newBookRef, newBook);

      Alert.alert('Success', 'Book added successfully!');

      // روح مباشرة على الديتيلز لنفس الكتاب

    } catch (error) {
      console.error('Error adding book:', error);
      Alert.alert('Error', 'Something went wrong while adding the book.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Give a Book</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="search" size={18} color="#475569" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.stepText}>STEP 1 OF 4</Text>

        <View style={styles.progressRow}>
          <Text style={styles.sectionTitle}>Book Details</Text>
          <Text style={styles.progressPercent}>25% Complete</Text>
        </View>

        <View style={styles.progressBarBg}>
          <View style={styles.progressBarFill} />
        </View>

        <TouchableOpacity style={styles.uploadCard}>
          <View style={styles.uploadIconWrap}>
            <MaterialIcons name="photo-camera" size={26} color="#355C9B" />
          </View>
          <Text style={styles.uploadTitle}>Upload book photos</Text>
          <Text style={styles.uploadDesc}>
            For now, paste an image URL below so it saves directly in Firebase.
          </Text>
        </TouchableOpacity>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            placeholder="https://example.com/book.jpg"
            placeholderTextColor="#94A3B8"
            value={imageUrl}
            onChangeText={setImageUrl}
            style={styles.input}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Book Title</Text>
          <TextInput
            placeholder="e.g. Fundamentals of Organic Chemistry"
            placeholderTextColor="#94A3B8"
            value={bookTitle}
            onChangeText={setBookTitle}
            style={styles.input}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Course Name</Text>
          <TextInput
            placeholder="e.g. CHEM101"
            placeholderTextColor="#94A3B8"
            value={courseName}
            onChangeText={setCourseName}
            style={styles.input}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Faculty</Text>
          <TextInput
            placeholder="e.g. Engineering"
            placeholderTextColor="#94A3B8"
            value={faculty}
            onChangeText={setFaculty}
            style={styles.input}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Condition</Text>
          <TextInput
            placeholder="e.g. New / Like New / Used"
            placeholderTextColor="#94A3B8"
            value={condition}
            onChangeText={setCondition}
            style={styles.input}
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            placeholder="Write a short description..."
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.multiLineInput]}
            multiline
          />
        </View>

        <View style={styles.fieldBlock}>
          <Text style={styles.label}>Pickup Location</Text>
          <TextInput
            placeholder="e.g. Main Campus Library"
            placeholderTextColor="#94A3B8"
            value={pickupLocation}
            onChangeText={setPickupLocation}
            style={styles.input}
          />
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Ionicons name="sparkles-outline" size={18} color="#355C9B" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>Your gift matters</Text>
            <Text style={styles.infoDesc}>
              Once you submit, the book will be saved directly to Firebase and can
              appear later as a card in your app.
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.mainButton} onPress={handleAddBook} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.mainButtonText}>Add Book</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.saveDraft}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: { marginRight: 8 },
  scrollContent: { padding: 18, paddingBottom: 30 },
  stepText: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 28, fontWeight: '800', color: '#0F172A' },
  progressPercent: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  progressBarBg: {
    height: 8,
    width: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 22,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '25%',
    height: '100%',
    backgroundColor: '#0A3D78',
    borderRadius: 10,
  },
  uploadCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  uploadTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  uploadDesc: { textAlign: 'center', fontSize: 13, color: '#64748B', lineHeight: 19 },
  fieldBlock: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  input: {
    minHeight: 54,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 14,
    color: '#0F172A',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  multiLineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EAF4FF',
    borderRadius: 16,
    padding: 14,
    marginTop: 8,
    marginBottom: 24,
    gap: 12,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D6E9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  infoDesc: { fontSize: 12, lineHeight: 18, color: '#475569' },
  mainButton: {
    backgroundColor: '#0A3D78',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  mainButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  saveDraft: { textAlign: 'center', marginTop: 18, fontSize: 14, color: '#334155' },
});