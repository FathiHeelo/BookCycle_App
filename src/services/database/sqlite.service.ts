import AsyncStorage from '@react-native-async-storage/async-storage';
import { SQLiteMessage, SQLiteDraft } from './types';
export * from './types';

export class SQLiteService {
  // On web, we don't use SQLite at all to avoid bundling issues with WASM
  
  // --- Message Methods ---
  static async saveMessage(msg: SQLiteMessage) {
    const key = `msgs_${msg.chatId}`;
    const existing = await this.getMessages(msg.chatId);
    const updated = [...existing.filter(m => m.id !== msg.id), msg];
    await AsyncStorage.setItem(key, JSON.stringify(updated));
  }

  static async getMessages(chatId: string): Promise<SQLiteMessage[]> {
    const key = `msgs_${chatId}`;
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  static async clearChatMessages(chatId: string) {
    await AsyncStorage.removeItem(`msgs_${chatId}`);
  }

  // --- Draft Methods ---
  static async saveDraft(id: string, type: string, data: any) {
    await AsyncStorage.setItem(`draft_${id}`, JSON.stringify(data));
  }

  static async getDraft<T>(id: string): Promise<T | null> {
    const data = await AsyncStorage.getItem(`draft_${id}`);
    if (data) {
      try {
        return JSON.parse(data) as T;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  static async deleteDraft(id: string) {
    await AsyncStorage.removeItem(`draft_${id}`);
  }
}
