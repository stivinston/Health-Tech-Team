import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatInterface } from './components/ChatInterface';
import { HealthTracker } from './components/HealthTracker';
import Login from './components/Login';
import axios from 'axios';

type View = 'chat' | 'health';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

type Theme = 'light' | 'dark';
type Language = 'french' | 'english';

function App() {
  const [currentView, setCurrentView] = useState<View>('chat');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [summaryId, setSummaryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [theme, setTheme] = useState<Theme>(() => {
    // Récupérer le thème depuis localStorage ou utiliser 'light' par défaut
    return (localStorage.getItem('theme') as Theme) || 'light';
  });
  const [language, setLanguage] = useState<Language>(() => {
    // Récupérer la langue depuis localStorage ou utiliser 'french' par défaut
    return (localStorage.getItem('language') as Language) || 'french';
  });
  const [textLang, setTextLang] = useState<string>('french');
  const [audioLang, setAudioLang] = useState<string>('fr');
  const [error, setError] = useState<string>('');
  const [conversation, setConversation] = useState<{
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
  }>({
    id: '1',
    title: 'Health Tech Assistant',
    messages: [],
    createdAt: new Date()
  });

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà authentifié depuis le localStorage
    const savedSummaryId = localStorage.getItem('summaryId');
    const cachedDescription = localStorage.getItem('patientDescription');
    
    if (savedSummaryId) {
      setSummaryId(savedSummaryId);
      setIsAuthenticated(true);
      
      // Utiliser la description en cache si elle existe
      if (cachedDescription) {
        setDescription(cachedDescription);
      } else {
        fetchPatientDescription(savedSummaryId);
      }
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (language === 'french') {
      setTextLang('french');
      setAudioLang('fr');
    } else {
      setTextLang('english');
      setAudioLang('en');
    }
  }, [language]);

  const fetchPatientDescription = async (id: string) => {
    try {
      // Vérifier d'abord dans le cache local
      const cachedDescription = localStorage.getItem('patientDescription');
      
      if (cachedDescription) {
        setDescription(cachedDescription);
        return;
      }
      
      // Si pas dans le cache, faire l'appel API
      const response = await axios.post('http://localhost:4000/patient-description', {
        summary_id: id,
        language: textLang
      });
      
      const patientDescription = response.data.description;
      setDescription(patientDescription);
      // Mettre en cache la description
      localStorage.setItem('patientDescription', patientDescription);
      setError('');
    } catch (err) {
      setError('Failed to fetch patient description');
      console.error('Error fetching patient description:', err);
    }
  };

  const handleLogin = async (id: string) => {
    try {
      // Vérifier d'abord dans le cache local
      const cachedDescription = localStorage.getItem('patientDescription');
      
      if (cachedDescription && localStorage.getItem('summaryId') === id) {
        setDescription(cachedDescription);
      } else {
        // Si pas dans le cache, faire l'appel API
        const response = await axios.post('http://localhost:4000/patient-description', {
          summary_id: id,
          language: textLang
        });
        
        const patientDescription = response.data.description;
        setDescription(patientDescription);
        // Mettre en cache la description
        localStorage.setItem('patientDescription', patientDescription);
      }
      
      setSummaryId(id);
      setIsAuthenticated(true);
      localStorage.setItem('summaryId', id);
      setError('');
    } catch (err) {
      setError('Invalid Summary ID. Please try again.');
      console.error('Login error:', err);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSummaryId('');
    setDescription('');
    localStorage.removeItem('summaryId');
    // Ne pas supprimer le cache de la description pour une réutilisation ultérieure
  };

  const handleSendMessage = async (message: string) => {
    if (!summaryId) return;

    const userMessage = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date()
    };

    // Update UI with user message immediately
    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }));

    try {
      // Send message to backend
      const response = await axios.post('http://localhost:4000/chat-response', {
        summary_id: summaryId,
        question: message
      });

      const botMessage = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        isUser: false,
        timestamp: new Date()
      };

      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage]
      }));
    } catch (err) {
      setError('Failed to send message');
      console.error('Error sending message:', err);
    }
  };

  const handleAudioPlay = async (text: string) => {
    try {
      await axios.post('http://localhost:4000/text-to-speech', {
        text,
        language: audioLang
      });
    } catch (err) {
      setError('Failed to play audio');
      console.error('Error playing audio:', err);
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} error={error} />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-white">
        <ChatSidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
          description={description}
          audioLang={audioLang}
          summaryId={summaryId}
          onLogout={handleLogout}
          onThemeChange={handleThemeChange}
          onLanguageChange={handleLanguageChange}
          currentTheme={theme}
          currentLanguage={language}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'chat' ? (
            <ChatInterface 
              conversation={conversation} 
              onSendMessage={handleSendMessage} 
            />
          ) : (
            <HealthTracker />
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;