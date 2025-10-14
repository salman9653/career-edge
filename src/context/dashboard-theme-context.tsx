
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';
import { useSession } from '@/hooks/use-session';
import { updateThemePreferencesAction } from '@/app/dashboard/settings/actions';

type ThemeVariant = {
  color: string;
  colorHsl: string;
  colorForeground: string;
  gradient?: string;
};

type Theme = {
  name: string;
  light: ThemeVariant;
  dark: ThemeVariant;
};

export const themes: Theme[] = [
    { 
        name: 'Aubergine', 
        light: { color: 'hsl(262.1 83.3% 57.8%)', colorHsl: '262.1 83.3% 57.8%', colorForeground: '300 100% 97%', gradient: 'linear-gradient(to right, hsl(262.1, 83.3%, 57.8%), hsl(285, 99%, 53%))' },
        dark: { color: 'hsl(262.1 83.3% 67.8%)', colorHsl: '262.1 83.3% 67.8%', colorForeground: '300 100% 97%', gradient: 'linear-gradient(to right, hsl(262.1, 83.3%, 67.8%), hsl(285, 99%, 63%))' }
    },
    { 
        name: 'Clementine', 
        light: { color: 'hsl(30 90% 50%)', colorHsl: '30 90% 50%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(30, 90%, 50%), hsl(45, 90%, 50%))' },
        dark: { color: 'hsl(30 90% 60%)', colorHsl: '30 90% 60%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(30, 90%, 60%), hsl(45, 90%, 60%))' }
    },
    { 
        name: 'Banana', 
        light: { color: 'hsl(54 90% 60%)', colorHsl: '54 90% 60%', colorForeground: '60 9.1% 9.8%', gradient: 'linear-gradient(to right, hsl(54, 90%, 60%), hsl(64, 90%, 60%))' },
        dark: { color: 'hsl(54 90% 70%)', colorHsl: '54 90% 70%', colorForeground: '60 9.1% 9.8%', gradient: 'linear-gradient(to right, hsl(54, 90%, 70%), hsl(64, 90%, 70%))' }
    },
    { 
        name: 'Jade', 
        light: { color: 'hsl(160 80% 35%)', colorHsl: '160 80% 35%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(160, 80%, 35%), hsl(170, 80%, 35%))' },
        dark: { color: 'hsl(160 80% 45%)', colorHsl: '160 80% 45%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(160, 80%, 45%), hsl(170, 80%, 45%))' }
    },
    { 
        name: 'Lagoon', 
        light: { color: 'hsl(200 80% 40%)', colorHsl: '200 80% 40%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(200, 80%, 40%), hsl(210, 80%, 40%))' },
        dark: { color: 'hsl(200 80% 50%)', colorHsl: '200 80% 50%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(200, 80%, 50%), hsl(210, 80%, 50%))' }
    },
    { 
        name: 'Barbra', 
        light: { color: 'hsl(340 90% 65%)', colorHsl: '340 90% 65%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(340, 90%, 65%), hsl(350, 90%, 65%))' },
        dark: { color: 'hsl(340 90% 75%)', colorHsl: '340 90% 75%', colorForeground: '0 0% 0%', gradient: 'linear-gradient(to right, hsl(340, 90%, 75%), hsl(350, 90%, 75%))' }
    },
    {
        name: 'Verdant',
        light: { color: 'hsl(142.1 76.2% 36.3%)', colorHsl: '142.1 76.2% 36.3%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(142.1, 76.2%, 36.3%), hsl(152.1, 76.2%, 36.3%))' },
        dark: { color: 'hsl(142.1 76.2% 46.3%)', colorHsl: '142.1 76.2% 46.3%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(142.1, 76.2%, 46.3%), hsl(152.1, 76.2%, 46.3%))' }
    },
    {
        name: 'Sky',
        light: { color: 'hsl(210 90% 55%)', colorHsl: '210 90% 55%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(210, 90%, 55%), hsl(220, 90%, 55%))' },
        dark: { color: 'hsl(210 90% 65%)', colorHsl: '210 90% 65%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(210, 90%, 65%), hsl(220, 90%, 65%))' }
    },
    {
        name: 'Rose',
        light: { color: 'hsl(346.8 90% 50%)', colorHsl: '346.8 90% 50%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(346.8, 90%, 50%), hsl(356.8, 90%, 50%))' },
        dark: { color: 'hsl(346.8 90% 60%)', colorHsl: '346.8 90% 60%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(346.8, 90%, 60%), hsl(356.8, 90%, 60%))' }
    },
    { 
        name: 'Gray', 
        light: { color: 'hsl(220 9% 46%)', colorHsl: '220 9% 46%', colorForeground: '0 0% 98%', gradient: 'linear-gradient(to right, hsl(220, 9%, 46%), hsl(220, 9%, 56%))' },
        dark: { color: 'hsl(220 9% 76%)', colorHsl: '220 9% 76%', colorForeground: '220 9% 16%', gradient: 'linear-gradient(to right, hsl(220, 9%, 76%), hsl(220, 9%, 86%))' }
    },
    { 
        name: 'Indigo', 
        light: { color: 'hsl(221.2 83.2% 53.3%)', colorHsl: '221.2 83.2% 53.3%', colorForeground: '0 0% 98%', gradient: 'linear-gradient(to right, hsl(221.2, 83.2%, 53.3%), hsl(231.2, 83.2%, 53.3%))' },
        dark: { color: 'hsl(221.2 83.2% 63.3%)', colorHsl: '221.2 83.2% 63.3%', colorForeground: '0 0% 98%', gradient: 'linear-gradient(to right, hsl(221.2, 83.2%, 63.3%), hsl(231.2, 83.2%, 63.3%))' }
    },
];

const defaultThemeName = 'Aubergine';
const defaultTheme = themes.find(t => t.name === defaultThemeName)!;

interface DashboardThemeContextType {
  theme: ThemeVariant;
  themeName: string;
  setThemeName: (themeName: string) => void;
}

const DashboardThemeContext = createContext<DashboardThemeContextType | undefined>(undefined);

export const DashboardThemeProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useSession();
  const { resolvedTheme, setTheme } = useNextTheme();
  
  const [themeName, setThemeNameState] = useState<string>(session?.preferences?.themeColor || defaultThemeName);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    if (session?.preferences) {
        setThemeNameState(session.preferences.themeColor || defaultThemeName);
        if (session.preferences.themeMode) {
            setTheme(session.preferences.themeMode);
        }
    }
  }, [session, setTheme]);

  const setThemeName = async (newThemeName: string) => {
    if (!session) return;
    setThemeNameState(newThemeName);
    await updateThemePreferencesAction({ themeColor: newThemeName });
  };
  
  const currentTheme = themes.find(t => t.name === themeName) || defaultTheme;

  const activeThemeVariant = !mounted ? defaultTheme.light : (resolvedTheme === 'dark' ? currentTheme.dark : currentTheme.light);

  const value = {
    theme: activeThemeVariant,
    themeName,
    setThemeName,
  };

  return (
    <DashboardThemeContext.Provider value={value}>
      {children}
    </DashboardThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(DashboardThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a DashboardThemeProvider');
  }
  return context;
};
