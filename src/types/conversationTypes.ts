export interface ConversationMessageType {
  text?: string;
  senderName?: string;
  date?: string;
  files?: Array<any>;
  replyMessageId?: number;
}

export interface ConversationType {
  userName?: string;
  sessionTime?: string;
  messages?: ConversationMessageType[];
}
