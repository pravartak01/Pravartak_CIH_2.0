
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, X, MessageCircle } from 'lucide-react';
import { GeminiChatbotProps } from './GeminiChat/types';
import { useGeminiChat } from './GeminiChat/useGeminiChat';
import ChatMessages from './GeminiChat/ChatMessages';
import ChatInput from './GeminiChat/ChatInput';
import ApiKeyErrorAlert from './GeminiChat/ApiKeyErrorAlert';

const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ startExpanded = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(!startExpanded);
  const [isMinimized, setIsMinimized] = useState(!startExpanded);
  
  const { 
    messages, 
    inputMessage, 
    setInputMessage, 
    isLoading, 
    apiKeyError, 
    sendMessage, 
    clearChat,
    addWelcomeMessage
  } = useGeminiChat();
  
  useEffect(() => {
    if (!isMinimized) {
      addWelcomeMessage();
    }
  }, [isMinimized, addWelcomeMessage]);
  
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isMinimized) {
      setIsCollapsed(false);
    }
  };
  
  if (isMinimized) {
    return (
      <Button 
        onClick={toggleMinimize}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all duration-300 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }
  
  // Full page mode (when startExpanded is true)
  if (startExpanded) {
    return (
      <div className="w-full h-full">
        {apiKeyError && <ApiKeyErrorAlert />}
        
        <div className="flex flex-col h-full bg-white rounded-lg shadow-inner">
          <ChatMessages messages={messages} />
          <ChatInput 
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            sendMessage={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }
  
  // Floating widget mode
  return (
    <Card className={`fixed bottom-4 right-4 w-80 md:w-96 shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'h-14' : 'h-[500px]'} z-50`}>
      <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between cursor-pointer" onClick={toggleCollapse}>
        <div className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          <span className="font-medium">Security Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          {!isCollapsed && <X className="h-4 w-4 cursor-pointer hover:text-gray-200" onClick={(e) => { e.stopPropagation(); clearChat(); }} />}
          <X className="h-5 w-5 cursor-pointer hover:text-gray-200" onClick={(e) => { e.stopPropagation(); toggleMinimize(); }} />
        </div>
      </div>
      
      {!isCollapsed && (
        <>
          {apiKeyError && <ApiKeyErrorAlert />}
          
          <ChatMessages messages={messages} />
          
          <ChatInput 
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            sendMessage={sendMessage}
            isLoading={isLoading}
          />
        </>
      )}
    </Card>
  );
};

export default GeminiChatbot;
