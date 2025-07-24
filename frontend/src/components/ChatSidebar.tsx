import { 
  MessageSquare, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  ChevronLeft, 
  LogOut 
} from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { SettingsMenu } from './SettingsMenu';

type Theme = 'light' | 'dark';
type Language = 'french' | 'english';

type View = 'chat' | 'health';

interface ChatSidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  description?: string;
  onAudioPlay?: (text: string) => void;
  audioLang?: string;
  summaryId?: string;
  onLogout?: () => void;
  onThemeChange?: (theme: Theme) => void;
  onLanguageChange?: (lang: Language) => void;
  currentTheme?: Theme;
  currentLanguage?: Language;
}

export function ChatSidebar({ 
  currentView, 
  onViewChange, 
  description, 
  onAudioPlay, 
  audioLang, 
  onLogout, 
  onThemeChange = () => {}, 
  onLanguageChange = () => {},
  currentTheme = 'light',
  currentLanguage = 'french'
}: ChatSidebarProps) {
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleDescription = () => {
    setIsDescriptionOpen(!isDescriptionOpen);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} h-full bg-gray-50 border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
      <div className="p-4 border-b flex justify-between items-center">
        {!isCollapsed && <h1 className="text-xl font-semibold">Health App</h1>}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <div className="p-4 border-b">
        <Button className="w-full mb-2" onClick={() => onViewChange('chat')}>
          <MessageSquare className="mr-2 h-4 w-4" />
          New Chat
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onViewChange('health')}
        >
          <Activity className="mr-2 h-4 w-4" />
          Health Tracker
        </Button>
      </div>
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation items */}
        <div className="p-2 space-y-1">
          <Button
            variant={currentView === 'chat' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('chat')}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat
          </Button>
          <Button
            variant={currentView === 'health' ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onViewChange('health')}
          >
            <Activity className="mr-2 h-4 w-4" />
            Health Tracker
          </Button>
        </div>
        
        {/* Patient Description Section */}
        {!isCollapsed && description && (
          <div className="flex-1 flex flex-col border-t mt-2 overflow-hidden">
            <button
              onClick={toggleDescription}
              className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-100"
            >
              <span>Patient Description</span>
              {isDescriptionOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            {isDescriptionOpen && (
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 bg-white">
                  <p className="text-sm text-gray-700 whitespace-pre-line">{description}</p>
                  {onAudioPlay && audioLang && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() => onAudioPlay(description)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Écouter ({audioLang})
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t">
        <SettingsMenu 
          isCollapsed={isCollapsed}
          currentTheme={currentTheme}
          currentLanguage={currentLanguage}
          onThemeChange={onThemeChange}
          onLanguageChange={onLanguageChange}
        />
        {onLogout && (
          <Button
            variant="ghost"
            className="w-full justify-start rounded-none"
            onClick={onLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {!isCollapsed && 'Déconnexion'}
          </Button>
        )}
      </div>
    </div>
  );
}