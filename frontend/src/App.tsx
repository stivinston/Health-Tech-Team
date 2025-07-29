import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChatSidebar } from './components/ChatSidebar';
import { ChatInterface } from './components/ChatInterface';
import { HealthTracker, Appointment } from './components/HealthTracker';
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
  const [patientId, setpatientId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const appointmentsRef = useRef<Appointment[]>([]);
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
    const savedpatientId = localStorage.getItem('patientId');
    const cachedDescription = localStorage.getItem('patientDescription');
    
    if (savedpatientId) {
      setpatientId(savedpatientId);
      setIsAuthenticated(true);
      
      // Utiliser la description en cache si elle existe
      if (cachedDescription) {
        setDescription(cachedDescription);
      } else {
        fetchPatientDescription(savedpatientId);
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
      const response = await axios.post('https://health-tech-team.onrender.com/patient-description', {
        patient_id: id,
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

  const fetchAppointments = async (patientId: string) => {
    try {
      const response = await axios.post('https://health-tech-team.onrender.com/appointments', {
        patient_id: patientId,
        language: textLang
      });
      setAppointments(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des rendez-vous:', err);
      setAppointments([]);
    }
  };

  const handleLogin = async (id: string) => {
    try {
      // Vérifier d'abord dans le cache local
      const cachedDescription = localStorage.getItem('patientDescription');
      
      if (cachedDescription && localStorage.getItem('patientId') === id) {
        setDescription(cachedDescription);
      } else {
        // Si pas dans le cache, faire l'appel API
        const response = await axios.post('https://health-tech-team.onrender.com/patient-description', {
          patient_id: id,
          language: textLang
        });
        
        const patientDescription = response.data.description;
        setDescription(patientDescription);
        // Mettre en cache la description
        localStorage.setItem('patientDescription', patientDescription);
      }
      
      // Charger les rendez-vous
      await fetchAppointments(id);
      
      setpatientId(id);
      setIsAuthenticated(true);
      localStorage.setItem('patientId', id);
      setError('');
    } catch (err) {
      setError('Invalid patient ID. Please try again.');
      console.error('Login error:', err);
    }
  };

  // Charger les rendez-vous une seule fois lors de la connexion
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!patientId) return;
      
      try {
        setIsLoadingAppointments(true);
        const response = await fetch('https://health-tech-team.onrender.com/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_id: patientId, language: 'fr' }),
        });

        if (!response.ok) throw new Error('Failed to fetch appointments');

        const data = await response.json();
        const appointmentsWithDates = data.map((appt: any) => ({
          ...appt,
          date_recorded: typeof appt.date_recorded === 'string' 
            ? new Date(appt.date_recorded) 
            : appt.date_recorded
        }));
        
        setAppointments(appointmentsWithDates);
        appointmentsRef.current = appointmentsWithDates;
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [patientId]);

  const resetConversation = () => {
    setConversation({
      id: Date.now().toString(),
      title: 'Health Tech Assistant',
      messages: [],
      createdAt: new Date()
    });
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setpatientId('');
    setDescription('');
    setAppointments([]);
    appointmentsRef.current = [];
    localStorage.removeItem('patientId');
  };

  const handleSendMessage = async (message: string) => {
    if (!patientId) return;

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
      const response = await axios.post('https://health-tech-team.onrender.com/chat-response', {
        patient_id: patientId,
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
      await axios.post('https://health-tech-team.onrender.com/text-to-speech', {
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
          onViewChange={(view) => {
            setCurrentView(view);
            if (view === 'chat') {
              resetConversation();
            }
          }}
          description={description}
          audioLang={audioLang}
          patientId={patientId}
          onLogout={handleLogout}
          onThemeChange={handleThemeChange}
          onLanguageChange={handleLanguageChange}
          currentTheme={theme}
          currentLanguage={language}
          onNewChat={resetConversation}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {currentView === 'chat' ? (
            <ChatInterface 
              conversation={conversation} 
              onSendMessage={handleSendMessage} 
            />
          ) : (
            <HealthTracker 
              patientId={patientId} 
              appointments={appointments}
              isLoading={isLoadingAppointments}
            />
          )}
        </main>
      </div>
    </Router>
  );
}

export default App;