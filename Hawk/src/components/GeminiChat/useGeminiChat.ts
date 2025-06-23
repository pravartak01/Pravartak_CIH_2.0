
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { ChatMessage } from './types';

export function useGeminiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiConversation, setApiConversation] = useState<any[]>([]);
  const [apiKeyError, setApiKeyError] = useState(false);

  const addWelcomeMessage = () => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! I\'m your security assistant. How can I help you today?',
          timestamp: new Date()
        }
      ]);
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Chat history cleared. How can I help you today?',
      timestamp: new Date()
    }]);
    setApiConversation([]);
    setApiKeyError(false);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    setApiKeyError(false);
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { 
          message: inputMessage,
          conversation: apiConversation
        }
      });
      
      if (error) throw error;
      
      if (!data.success) {
        if (data.errorType === 'missing_api_key') {
          setApiKeyError(true);
          throw new Error('Gemini API key is not configured. Please add it to Supabase Edge Function secrets.');
        } else {
          throw new Error(data.error || "Failed to get a response");
        }
      }
      
      if (data.conversation) {
        setApiConversation(data.conversation);
      }
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message || "I'm having trouble understanding that. Could you try rephrasing?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      const errorMessage = error.message.includes('API key') 
        ? 'The Gemini API key is not configured. Please add it to Supabase Edge Function secrets.'
        : 'Failed to get a response from the AI assistant. Please try again later.';
      
      toast.error(errorMessage);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    inputMessage,
    setInputMessage,
    isLoading,
    apiKeyError,
    sendMessage,
    clearChat,
    addWelcomeMessage
  };
}
