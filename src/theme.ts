import { Platform } from 'react-native';

export const colors = {
  ink: '#181814',
  paper: '#F4F0E7',
  card: '#FFFCF5',
  white: '#FFFFFF',
  muted: '#77756D',
  line: '#DDD9CE',
  lime: '#D8FF52',
  coral: '#FF6B55',
  lilac: '#B9A7FF',
  sky: '#8EDCF0',
  butter: '#FFD66B',
  moss: '#3F6D56',
  softGreen: '#DDEBDF',
  blush: '#F8D7CF',
  shadow: '#332F24',
};
export const fonts = {
  sans: Platform.select({ ios: 'Avenir Next', android: 'sans-serif', default: 'System' }),
  sansMedium: Platform.select({ ios: 'Avenir Next Medium', android: 'sans-serif-medium', default: 'System' }),
  sansBold: Platform.select({ ios: 'Avenir Next Demi Bold', android: 'sans-serif', default: 'System' }),
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
};

export const shadows = {
  soft: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
  },
};
