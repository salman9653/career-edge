
'use client';

import { useTheme } from '@/context/dashboard-theme-context';

export function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    const primaryHue = theme.colorHsl.split(' ')[0];

    const style = {
        '--dash-primary': theme.colorHsl,
        '--dash-primary-foreground': theme.colorForeground,
        '--dash-gradient': theme.gradient,
        '--ring': theme.colorHsl,
        '--dash-primary-hue': primaryHue,
    } as React.CSSProperties;

    return (
        <div style={style} className="contents">
            {children}
        </div>
    );
}
