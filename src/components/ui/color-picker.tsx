
'use client';

import { useTheme, themes } from '@/context/dashboard-theme-context';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { useTheme as useNextTheme } from 'next-themes';
import { Button } from './button';

export function ColorPicker() {
  const { themeName, setThemeName } = useTheme();
  const { resolvedTheme } = useNextTheme();

  const groupedThemes = themes.reduce((acc, theme) => {
    (acc[theme.category] = acc[theme.category] || []).push(theme);
    return acc;
  }, {} as Record<string, typeof themes>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedThemes).map(([category, themeList]) => (
        <div key={category}>
          <h4 className="font-semibold mb-2">{category}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {themeList.map((t) => {
              const activeVariant = resolvedTheme === 'dark' ? t.dark : t.light;
              const isSelected = themeName === t.name;

              return (
                <button
                  key={t.name}
                  onClick={() => setThemeName(t.name)}
                  className={cn(
                    "flex items-center justify-start gap-3 rounded-md border-2 p-2 transition-colors",
                    isSelected ? 'border-dash-primary' : 'border-border'
                  )}
                  style={{
                      '--dash-primary': activeVariant.colorHsl,
                      '--dash-primary-foreground': activeVariant.colorForeground,
                  } as React.CSSProperties}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full border"
                    style={{ background: activeVariant.gradient ?? activeVariant.color }}
                  />
                  <span className="flex-1 text-left text-sm">{t.name}</span>
                  {isSelected && <Check className="h-5 w-5" />}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
