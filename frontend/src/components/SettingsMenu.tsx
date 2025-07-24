import { Settings, Moon, Sun, Languages, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

type Theme = 'light' | 'dark';
type Language = 'french' | 'english';

interface SettingsMenuProps {
  isCollapsed: boolean;
  currentTheme: Theme;
  currentLanguage: Language;
  onThemeChange: (theme: Theme) => void;
  onLanguageChange: (lang: Language) => void;
}

export function SettingsMenu({ 
  isCollapsed, 
  currentTheme, 
  currentLanguage, 
  onThemeChange, 
  onLanguageChange 
}: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSettings = () => {
    setIsOpen(!isOpen);
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    onThemeChange(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  const changeLanguage = (lang: Language) => {
    onLanguageChange(lang);
    localStorage.setItem('language', lang);
  };

  if (isCollapsed) {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSettings}
          className="w-full justify-center"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="border-t mt-auto">
      <button
        onClick={toggleSettings}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div className="flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          <span>Settings</span>
        </div>
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-4 bg-white dark:bg-gray-900 border-t">
          {/* Thème */}
          <div>
            <div className="flex items-center mb-2">
              {currentTheme === 'dark' ? (
                <Moon className="h-4 w-4 mr-2" />
              ) : (
                <Sun className="h-4 w-4 mr-2" />
              )}
              <span className="text-sm font-medium">Theme</span>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={currentTheme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onThemeChange('light')}
                className="flex-1"
              >
                Light
              </Button>
              <Button
                variant={currentTheme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onThemeChange('dark')}
                className="flex-1"
              >
                Dark
              </Button>
            </div>
          </div>
          
          {/* Langue */}
          <div>
            <div className="flex items-center mb-2">
              <Languages className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Language</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={currentLanguage === 'french' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeLanguage('french')}
              >
                French
              </Button>
              <Button
                variant={currentLanguage === 'english' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeLanguage('english')}
              >
                English
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
