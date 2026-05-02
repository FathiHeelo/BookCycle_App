import { serverTimestamp } from "firebase/database";

export type NotificationType = "resource_request" | "message";
export type ActionTarget = "request_details" | "resource_requests" | "chat";

export interface Notification {
  id?: string;
  recipientId: string;
  senderId: string;
  senderName: string;
  type: NotificationType;
  title: string;
  body: string;
  resourceId?: string;
  resourceTitle?: string;
  chatId?: string;
  messageId?: string;
  read: boolean;
  createdAt: any; // serverTimestamp
  actionTarget: ActionTarget;
}
