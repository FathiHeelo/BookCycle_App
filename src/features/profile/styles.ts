import { StyleSheet } from 'react-native';

export const ProfileStyles = StyleSheet.create({
  // Profile Screen
  screen: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6' },
  scrollContent: { flexGrow: 1, paddingVertical: 24 },
  cardWrapper: { width: '100%' },

  // Profile Card
  profileCardContainer: {
    backgroundColor: '#fff', borderRadius: 32, padding: 24, marginBottom: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5,
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: { alignItems: 'center', gap: 16 },
  imageContainer: {
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8, position: 'relative',
  },
  profileImage: { resizeMode: 'cover' },
  placeholderImage: { backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  editIconBadge: {
    position: 'absolute', bottom: 4, right: 4, backgroundColor: '#001B39', width: 38, height: 38, borderRadius: 19,
    justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  infoContainer: { alignItems: 'center', width: '100%' },
  userName: { fontSize: 24, fontWeight: '900', color: '#001B39', marginBottom: 8 },
  blueEditBtn: { backgroundColor: '#001B39', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, gap: 8, marginBottom: 16 },
  blueEditBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  roleBadge: { backgroundColor: '#F1F4F7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#E2E8F0' },
  roleText: { fontSize: 12, fontWeight: '800', color: '#001B39', textTransform: 'uppercase' },
  universityRow: { alignItems: 'center', gap: 6, marginBottom: 4 },
  universityName: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  facultyRow: { alignItems: 'center', gap: 6 },
  facultyName: { fontSize: 14, fontWeight: '700', color: '#001B39' },

  // Edit Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#001B39', marginBottom: 20 },
  nameInput: { width: '100%', height: 56, backgroundColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, fontSize: 16, fontWeight: '600', marginBottom: 12 },
  removePhotoBtn: { width: '100%', paddingVertical: 10, borderRadius: 12 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cancelBtn: { backgroundColor: '#F1F5F9' },
  saveBtn: { backgroundColor: '#001B39' },
  cancelBtnText: { color: '#64748B', fontWeight: '700' },
  saveBtnText: { color: '#fff', fontWeight: '700' },

  // TotalBook Card
  totalBookCardContainer: {
    backgroundColor: '#003366', borderRadius: 24, width: '100%', marginTop: 16,
    shadowColor: '#001B39', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10, overflow: 'hidden', position: 'relative',
  },
  watermarkIcon: { position: 'absolute', bottom: -20 },
  totalLabel: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.65)', marginBottom: 8 },
  totalTitle: { fontWeight: '800', color: '#FFFFFF', lineHeight: 44, marginBottom: 12, letterSpacing: -0.5 },
  totalSavings: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.65)' },

  // Contributor Card
  contributorCardContainer: {
    backgroundColor: '#FFFFFF', borderRadius: 32, width: '100%', marginTop: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 5,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#001B39', marginBottom: 24 },
  statSection: { marginBottom: 24 },
  statHeader: { justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  labelRow: { alignItems: 'center', gap: 12 },
  statLabel: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  statValue: { fontSize: 18, fontWeight: '800', color: '#001B39' },
  progressBarBg: { height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden', marginBottom: 10 },
  progressBarFill: { height: '100%', backgroundColor: '#001B39', borderRadius: 5 },
  description: { fontSize: 13, color: '#6B7280', fontWeight: '500', lineHeight: 18 },
  impactCard: { backgroundColor: '#001B39', borderRadius: 20, padding: 20, marginTop: 8, alignItems: 'center', gap: 16 },
  impactIconContainer: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  impactInfo: { flex: 1 },
  impactTitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 4 },
  impactValue: { fontSize: 18, color: '#fff', fontWeight: '800' },

  // History Lists (Books_Given & Books_Received)
  historyContainer: { width: '100%', marginTop: 24, marginBottom: 20 },
  historyHeader: { marginBottom: 20, paddingHorizontal: 4 },
  historyHeaderTitle: { fontSize: 22, fontWeight: '800', color: '#001B39', marginBottom: 4 },
  viewAllButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  bookCard: {
    backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  bookImageContainer: { width: 70, height: 90, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F3F4F6' },
  bookImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  bookContentContainer: { flex: 1, justifyContent: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 6, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
  bookTitle: { fontSize: 16, fontWeight: '800', color: '#001B39', marginBottom: 4 },
  metaRow: { alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: '#6B7280', fontWeight: '500', flex: 1 },
  actionRow: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, gap: 12 },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 40, borderRadius: 10, gap: 6 },
  editButton: { backgroundColor: '#F3F4F6' },
  deleteButton: { backgroundColor: '#FEF2F2' },
  editButtonText: { fontSize: 13, fontWeight: '700', color: '#4B5563' },
  deleteButtonText: { fontSize: 13, fontWeight: '700', color: '#EF4444' },
  cancelRequestButton: { borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 12, alignItems: 'center', justifyContent: 'center', gap: 8 },
  cancelRequestButtonText: { fontSize: 14, fontWeight: '700', color: '#EF4444' },
  emptyContainer: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#F9FAFB', borderRadius: 24, borderWidth: 1, borderColor: '#F1F5F9', borderStyle: 'dashed' },
  emptyText: { color: '#94A3B8', marginTop: 10, fontSize: 14, fontWeight: '600' }
});
