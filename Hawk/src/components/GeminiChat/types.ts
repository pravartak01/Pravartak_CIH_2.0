
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface GeminiChatbotProps {
  startExpanded?: boolean;
}
