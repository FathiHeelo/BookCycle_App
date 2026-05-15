import * as SQLite from 'expo-sqlite';
import { SQLiteMessage, SQLiteDraft } from './types';
export * from './types';

const DB_NAME = 'bookcycle.db';

export class SQLiteService {
  private static db: SQLite.SQLiteDatabase | null = null;

  static async getDb() {
    if (!this.db) {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.initTables();
    }
    return this.db;
  }

  private static async initTables() {
    const db = await SQLite.openDatabaseAsync(DB_NAME);
    
    // Messages Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY NOT NULL,
        chatId TEXT NOT NULL,
        senderId TEXT NOT NULL,
        senderName TEXT,
        text TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        status TEXT DEFAULT 'sent'
      );
    `);

    // Drafts Table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS drafts (
        id TEXT PRIMARY KEY NOT NULL,
        type TEXT NOT NULL,
        data TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );
    `);

    console.log('SQLite Tables initialized (Native)');
  }

  // --- Message Methods ---
  static async saveMessage(msg: SQLiteMessage) {
    const db = await this.getDb();
    await db.runAsync(
      'INSERT OR REPLACE INTO messages (id, chatId, senderId, senderName, text, timestamp, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [msg.id, msg.chatId, msg.senderId, msg.senderName, msg.text, msg.timestamp, msg.status]
    );
  }

  static async getMessages(chatId: string): Promise<SQLiteMessage[]> {
    const db = await this.getDb();
    const rows = await db.getAllAsync<SQLiteMessage>(
      'SELECT * FROM messages WHERE chatId = ? ORDER BY timestamp ASC',
      [chatId]
    );
    return rows;
  }

  static async clearChatMessages(chatId: string) {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM messages WHERE chatId = ?', [chatId]);
  }

  // --- Draft Methods ---
  static async saveDraft(id: string, type: string, data: any) {
    const db = await this.getDb();
    const updatedAt = new Date().toISOString();
    const jsonData = JSON.stringify(data);
    await db.runAsync(
      'INSERT OR REPLACE INTO drafts (id, type, data, updatedAt) VALUES (?, ?, ?, ?)',
      [id, type, jsonData, updatedAt]
    );
  }

  static async getDraft<T>(id: string): Promise<T | null> {
    const db = await this.getDb();
    const row = await db.getFirstAsync<SQLiteDraft>(
      'SELECT * FROM drafts WHERE id = ?',
      [id]
    );
    if (row) {
      try {
        return JSON.parse(row.data) as T;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  static async deleteDraft(id: string) {
    const db = await this.getDb();
    await db.runAsync('DELETE FROM drafts WHERE id = ?', [id]);
  }
}
