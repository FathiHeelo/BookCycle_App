export interface SQLiteMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  status: string; // 'pending', 'sent', 'read'
}

export interface SQLiteDraft {
  id: string; // e.g., 'book_upload_draft'
  type: string;
  data: string; // JSON stringified data
  updatedAt: string;
}
