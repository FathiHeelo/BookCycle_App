import { StyleSheet } from 'react-native';

export const SettingsStyles = StyleSheet.create({
  // Screen layout
  screen: { flex: 1 },
  scrollContent: { paddingTop: 12, paddingBottom: 24 },
  header: { marginBottom: 28, paddingTop: 8 },
  pageTitle: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8, marginBottom: 6 },
  titleAccent: { width: 40, height: 4, borderRadius: 2 },
  bottomPad: { height: 32 },

  // Section label
  sectionLabel: {
    fontSize: 12, fontWeight: '700', letterSpacing: 1,
    marginBottom: 8, marginTop: 4, paddingHorizontal: 4,
  },

  // Card wrapper
  card: {
    borderRadius: 24, paddingHorizontal: 18, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },

  // Profile card
  profileCard: {
    borderRadius: 24, padding: 18, alignItems: 'center', marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
  },
  avatarWrapper: { position: 'relative' },
  avatar: { resizeMode: 'cover' },
  onlineDot: {
    position: 'absolute', bottom: 2, right: 2,
    width: 13, height: 13, borderRadius: 7,
    backgroundColor: '#10B981', borderWidth: 2, borderColor: '#fff',
  },
  profileInfoContainer: { flex: 1, justifyContent: 'center' },
  profileName: { fontSize: 18, fontWeight: '800', marginBottom: 3, letterSpacing: -0.3 },
  profileEmail: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  idRow: {
    alignItems: 'center', backgroundColor: '#F3F4F6',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
  },
  idText: { fontSize: 12, fontWeight: '600' },
  arrow: { marginLeft: 8 },

  // Logout row
  logoutRow: { paddingVertical: 16, alignItems: 'center', justifyContent: 'space-between' },
  logoutIconBg: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center',
  },
  logoutLabel: { fontSize: 16, fontWeight: '700', color: '#EF4444', marginBottom: 2 },
  logoutSubtitle: { fontSize: 12, fontWeight: '500', color: '#F87171' },

  // Language switcher
  optionRow: { paddingVertical: 16, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'space-between' },
  optionLeftSection: { alignItems: 'center', flex: 1 },
  optionLabel: { fontSize: 16 },
  checkBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#001B39', justifyContent: 'center', alignItems: 'center',
  },

  // Theme toggle
  themeRow: { paddingVertical: 14, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'space-between' },
  themeLeftSection: { flex: 1, alignItems: 'center' },
  themeIconBg: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  themeLabel: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  themeSubtitle: { fontSize: 12, fontWeight: '500' },
});
