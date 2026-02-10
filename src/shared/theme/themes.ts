export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  mode: ThemeMode;
  colors: {
    screen: string;
    card: string;
    cardStrong: string;
    border: string;
    text: string;
    mutedText: string;
    primary: string;
    primaryText: string;
    danger: string;
    tabInactive: string;
    flame: string;
    avatarBg: string;
  };
}

export const lightTheme: AppTheme = {
  mode: 'light',
  colors: {
    screen: '#f4f7fb',
    card: '#ffffff',
    cardStrong: '#eef3ff',
    border: '#d7e1f2',
    text: '#0f172a',
    mutedText: '#475569',
    primary: '#0284c7',
    primaryText: '#f0f9ff',
    danger: '#be123c',
    tabInactive: '#64748b',
    flame: '#ea580c',
    avatarBg: '#dbeafe',
  },
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  colors: {
    screen: '#060b1f',
    card: '#111a33',
    cardStrong: '#18213a',
    border: '#24304f',
    text: '#f8fafc',
    mutedText: '#94a3b8',
    primary: '#0284c7',
    primaryText: '#e0f2fe',
    danger: '#fda4af',
    tabInactive: '#64748b',
    flame: '#fb923c',
    avatarBg: '#172036',
  },
};

export const getAppTheme = (mode: ThemeMode): AppTheme => (mode === 'light' ? lightTheme : darkTheme);
