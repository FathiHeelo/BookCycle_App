import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Radius, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

export const ChatStyles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerInfoContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  headerSubRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  headerSub: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  avatarSmall: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 20 },
  
  listContent: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16 },
  
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 24,
  },
  dateBadge: {
    backgroundColor: 'rgba(142, 155, 174, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E9BAE',
    letterSpacing: 1,
  },

  messageWrapper: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '85%',
    gap: 8,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  myBubble: {
    backgroundColor: '#001B39',
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: '#F1F5F9',
    borderBottomLeftRadius: 4,
  },
  messageImage: {
    width: width * 0.6,
    height: 180,
    borderRadius: 16,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  readReceipt: {
    marginLeft: 2,
  },

  inputBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 28,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  attachBtn: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarMessage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationContainer: {
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    minWidth: 150,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700',
  },
  viewMapBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    marginTop: 4,
  },
  viewMapText: {
    fontSize: 12,
    fontWeight: '800',
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: width,
    height: width * 1.5,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
});

