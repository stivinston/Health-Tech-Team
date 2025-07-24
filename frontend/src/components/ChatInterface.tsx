import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, User } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { VoiceInput } from '@/components/VoiceInput';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  conversation: {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
  } | undefined;
  onSendMessage: (message: string) => void;
}

function MessageBubble({ message }: { message: Message }) {
  return (
    <div className={`flex items-start gap-3 mb-4 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      {!message.isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <img 
            src="/robot-favicon.svg" 
            alt="AI Assistant" 
            className="w-6 h-6"
          />
        </div>
      )}
      
      <div
        className={`rounded-xl px-4 py-2 text-sm max-w-[75%] ${
          message.isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        {message.content}
      </div>
      
      {message.isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}

export function ChatInterface({ conversation, onSendMessage }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
      // Réinitialiser la hauteur de la zone de texte après l'envoi
      if (textareaRef.current) {
        textareaRef.current.style.height = '60px';
      }
    }
  };

  const handleVoiceInput = (transcript: string) => {
    setMessage(transcript);
    setIsListening(false);
    // Focus sur la zone de texte après la reconnaissance vocale
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    // Ajustement automatique de la hauteur de la zone de texte
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = '60px';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${Math.min(scrollHeight, 200)}px`; // Hauteur max de 200px
    }
  }, [message]);

  useEffect(() => {
    // Défilement vers le bas pour les nouveaux messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* En-tête de la conversation */}
      <div className="border-b bg-white p-4">
        <h2 className="text-lg font-semibold text-gray-800">
          {conversation?.title || 'New Chat'}
        </h2>
      </div>

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {conversation?.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="bg-blue-50 p-4 rounded-full mb-4">
              <MessageSquare className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">Start a conversation</h3>
            <p className="text-gray-500 max-w-md">
              Type a message below or use the voice input to begin chatting about your health concerns.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full">
            {conversation?.messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="border-t bg-white p-4 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <VoiceInput 
              onTranscription={handleVoiceInput} 
              isListening={isListening}
              onStartListening={() => setIsListening(true)}
              onStopListening={() => setIsListening(false)}
            />
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="min-h-[60px] max-h-48 resize-none pr-12"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-2 bottom-2 h-8 w-8 p-0 rounded-full" 
                disabled={!message.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send • Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}