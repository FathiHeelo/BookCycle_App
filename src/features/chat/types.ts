export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  imageUrl?: string;
  isRead?: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}
