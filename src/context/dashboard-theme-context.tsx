
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
  category: 'Solid Colours' | 'Fun and new';
};

export const themes: Theme[] = [
    { 
        name: 'Aubergine', 
        light: { color: 'hsl(262.1 83.3% 57.8%)', colorHsl: '262.1 83.3% 57.8%', colorForeground: '300 100% 97%', gradient: 'linear-gradient(to right, hsl(262.1, 83.3%, 57.8%), hsl(285, 99%, 53%))' },
        dark: { color: 'hsl(262.1 83.3% 67.8%)', colorHsl: '262.1 83.3% 67.8%', colorForeground: '300 100% 97%', gradient: 'linear-gradient(to right, hsl(262.1, 83.3%, 67.8%), hsl(285, 99%, 63%))' },
        category: 'Solid Colours'
    },
    { 
        name: 'Clementine', 
        light: { color: 'hsl(30 90% 50%)', colorHsl: '30 90% 50%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(30, 90%, 50%), hsl(45, 90%, 50%))' },
        dark: { color: 'hsl(30 90% 60%)', colorHsl: '30 90% 60%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(30, 90%, 60%), hsl(45, 90%, 60%))' },
        category: 'Solid Colours'
    },
    { 
        name: 'Banana', 
        light: { color: 'hsl(54 90% 60%)', colorHsl: '54 90% 60%', colorForeground: '60 9.1% 9.8%', gradient: 'linear-gradient(to right, hsl(54, 90%, 60%), hsl(64, 90%, 60%))' },
        dark: { color: 'hsl(54 90% 70%)', colorHsl: '54 90% 70%', colorForeground: '60 9.1% 9.8%', gradient: 'linear-gradient(to right, hsl(54, 90%, 70%), hsl(64, 90%, 70%))' },
        category: 'Solid Colours'
    },
    { 
        name: 'Jade', 
        light: { color: 'hsl(160 80% 35%)', colorHsl: '160 80% 35%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(160, 80%, 35%), hsl(170, 80%, 35%))' },
        dark: { color: 'hsl(160 80% 45%)', colorHsl: '160 80% 45%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(160, 80%, 45%), hsl(170, 80%, 45%))' },
        category: 'Solid Colours'
    },
    { 
        name: 'Lagoon', 
        light: { color: 'hsl(200 80% 40%)', colorHsl: '200 80% 40%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(200, 80%, 40%), hsl(210, 80%, 40%))' },
        dark: { color: 'hsl(200 80% 50%)', colorHsl: '200 80% 50%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(200, 80%, 50%), hsl(210, 80%, 50%))' },
        category: 'Solid Colours'
    },
    { 
        name: 'Barbra', 
        light: { color: 'hsl(340 90% 65%)', colorHsl: '340 90% 65%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(340, 90%, 65%), hsl(350, 90%, 65%))' },
        dark: { color: 'hsl(340 90% 75%)', colorHsl: '340 90% 75%', colorForeground: '0 0% 0%', gradient: 'linear-gradient(to right, hsl(340, 90%, 75%), hsl(350, 90%, 75%))' },
        category: 'Solid Colours'
    },
    {
        name: 'Verdant',
        light: { color: 'hsl(142.1 76.2% 36.3%)', colorHsl: '142.1 76.2% 36.3%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(142.1, 76.2%, 36.3%), hsl(152.1, 76.2%, 36.3%))' },
        dark: { color: 'hsl(142.1 76.2% 46.3%)', colorHsl: '142.1 76.2% 46.3%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(142.1, 76.2%, 46.3%), hsl(152.1, 76.2%, 46.3%))' },
        category: 'Solid Colours'
    },
    {
        name: 'Sky',
        light: { color: 'hsl(210 90% 55%)', colorHsl: '210 90% 55%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(210, 90%, 55%), hsl(220, 90%, 55%))' },
        dark: { color: 'hsl(210 90% 65%)', colorHsl: '210 90% 65%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(210, 90%, 65%), hsl(220, 90%, 65%))' },
        category: 'Solid Colours'
    },
    {
        name: 'Rose',
        light: { color: 'hsl(346.8 90% 50%)', colorHsl: '346.8 90% 50%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(346.8, 90%, 50%), hsl(356.8, 90%, 50%))' },
        dark: { color: 'hsl(346.8 90% 60%)', colorHsl: '346.8 90% 60%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(346.8, 90%, 60%), hsl(356.8, 90%, 60%))' },
        category: 'Solid Colours'
    },
    { 
        name: 'Gray', 
        light: { color: 'hsl(220 9% 46%)', colorHsl: '220 9% 46%', colorForeground: '0 0% 98%', gradient: 'linear-gradient(to right, hsl(220, 9%, 46%), hsl(220, 9%, 56%))' },
        dark: { color: 'hsl(220 9% 76%)', colorHsl: '220 9% 76%', colorForeground: '220 9% 16%', gradient: 'linear-gradient(to right, hsl(220, 9%, 76%), hsl(220, 9%, 86%))' },
        category: 'Solid Colours'
    },
    { 
        name: 'Indigo', 
        light: { color: 'hsl(221.2 83.2% 53.3%)', colorHsl: '221.2 83.2% 53.3%', colorForeground: '0 0% 98%', gradient: 'linear-gradient(to right, hsl(221.2, 83.2%, 53.3%), hsl(231.2, 83.2%, 53.3%))' },
        dark: { color: 'hsl(221.2 83.2% 63.3%)', colorHsl: '221.2 83.2% 63.3%', colorForeground: '0 0% 98%', gradient: 'linear-gradient(to right, hsl(221.2, 83.2%, 63.3%), hsl(231.2, 83.2%, 63.3%))' },
        category: 'Solid Colours'
    },
    {
        name: 'Raspberry Beret',
        light: { color: 'hsl(322, 70%, 50%)', colorHsl: '322 70% 50%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(322, 70%, 50%), hsl(342, 70%, 50%))' },
        dark: { color: 'hsl(322, 70%, 60%)', colorHsl: '322 70% 60%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(322, 70%, 60%), hsl(342, 70%, 60%))' },
        category: 'Fun and new',
    },
    {
        name: 'Big Business',
        light: { color: 'hsl(220, 80%, 50%)', colorHsl: '220 80% 50%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(220, 80%, 50%), hsl(240, 80%, 50%))' },
        dark: { color: 'hsl(220, 80%, 60%)', colorHsl: '220 80% 60%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(220, 80%, 60%), hsl(240, 80%, 60%))' },
        category: 'Fun and new',
    },
    {
        name: 'POG',
        light: { color: 'hsl(30, 90%, 55%)', colorHsl: '30 90% 55%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(30, 90%, 55%), hsl(40, 90%, 55%))' },
        dark: { color: 'hsl(30, 90%, 65%)', colorHsl: '30 90% 65%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(30, 90%, 65%), hsl(40, 90%, 65%))' },
        category: 'Fun and new',
    },
    {
        name: 'Mint Chip',
        light: { color: 'hsl(170, 70%, 40%)', colorHsl: '170 70% 40%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(170, 70%, 40%), hsl(190, 70%, 40%))' },
        dark: { color: 'hsl(170, 70%, 50%)', colorHsl: '170 70% 50%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(170, 70%, 50%), hsl(190, 70%, 50%))' },
        category: 'Fun and new',
    },
    {
        name: 'PB&J',
        light: { color: 'hsl(290, 60%, 50%)', colorHsl: '290 60% 50%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(290, 60%, 50%), hsl(20, 60%, 50%))' },
        dark: { color: 'hsl(290, 60%, 60%)', colorHsl: '290 60% 60%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(290, 60%, 60%), hsl(20, 60%, 60%))' },
        category: 'Fun and new',
    },
    {
        name: 'Chill Vibes',
        light: { color: 'hsl(180, 50%, 45%)', colorHsl: '180 50% 45%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(180, 50%, 45%), hsl(200, 50%, 45%))' },
        dark: { color: 'hsl(180, 50%, 55%)', colorHsl: '180 50% 55%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(180, 50%, 55%), hsl(200, 50%, 55%))' },
        category: 'Fun and new',
    },
    {
        name: 'Forest Floor',
        light: { color: 'hsl(120, 60%, 30%)', colorHsl: '120 60% 30%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(120, 60%, 30%), hsl(100, 60%, 30%))' },
        dark: { color: 'hsl(120, 60%, 40%)', colorHsl: '120 60% 40%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(120, 60%, 40%), hsl(100, 60%, 40%))' },
        category: 'Fun and new',
    },
    {
        name: 'Slackr',
        light: { color: 'hsl(260, 80%, 60%)', colorHsl: '260 80% 60%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(260, 80%, 60%), hsl(280, 80%, 60%))' },
        dark: { color: 'hsl(260, 80%, 70%)', colorHsl: '260 80% 70%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(260, 80%, 70%), hsl(280, 80%, 70%))' },
        category: 'Fun and new',
    },
    {
        name: 'Sea Glass',
        light: { color: 'hsl(190, 80%, 60%)', colorHsl: '190 80% 60%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(190, 80%, 60%), hsl(210, 80%, 60%))' },
        dark: { color: 'hsl(190, 80%, 70%)', colorHsl: '190 80% 70%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(190, 80%, 70%), hsl(210, 80%, 70%))' },
        category: 'Fun and new',
    },
    {
        name: 'Lemon Lime',
        light: { color: 'hsl(80, 90%, 50%)', colorHsl: '80 90% 50%', colorForeground: '60 9.1% 9.8%', gradient: 'linear-gradient(to right, hsl(80, 90%, 50%), hsl(100, 90%, 50%))' },
        dark: { color: 'hsl(80, 90%, 60%)', colorHsl: '80 90% 60%', colorForeground: '60 9.1% 9.8%', gradient: 'linear-gradient(to right, hsl(80, 90%, 60%), hsl(100, 90%, 60%))' },
        category: 'Fun and new',
    },
    {
        name: 'Falling Leaves',
        light: { color: 'hsl(40, 80%, 50%)', colorHsl: '40 80% 50%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(40, 80%, 50%), hsl(20, 80%, 50%))' },
        dark: { color: 'hsl(40, 80%, 60%)', colorHsl: '40 80% 60%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(40, 80%, 60%), hsl(20, 80%, 60%))' },
        category: 'Fun and new',
    },
    {
        name: 'Sunrise',
        light: { color: 'hsl(10, 90%, 55%)', colorHsl: '10 90% 55%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(10, 90%, 55%), hsl(30, 90%, 55%))' },
        dark: { color: 'hsl(10, 90%, 65%)', colorHsl: '10 90% 65%', colorForeground: '0 0% 100%', gradient: 'linear-gradient(to right, hsl(10, 90%, 65%), hsl(30, 90%, 65%))' },
        category: 'Fun and new',
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

  useEffect(() => {
    if (typeof document !== 'undefined') {
        const body = document.body;
        const primaryHue = activeThemeVariant.colorHsl.split(' ')[0];
        body.style.setProperty('--dash-primary', activeThemeVariant.colorHsl);
        body.style.setProperty('--dash-primary-foreground', activeThemeVariant.colorForeground);
        body.style.setProperty('--ring', activeThemeVariant.colorHsl);
        body.style.setProperty('--dash-primary-hue', primaryHue);
    }
  }, [activeThemeVariant])

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
