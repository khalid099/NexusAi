import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#F4F2EE',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1A16',
      secondary: '#5A5750',
      disabled: '#9E9B93',
    },
    primary: {
      main: '#C8622A',
      dark: '#A34D1E',
      light: '#FDF1EB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1C1A16',
      contrastText: '#FFFFFF',
    },
    divider: 'rgba(0,0,0,0.08)',
  },
  typography: {
    fontFamily: "'Instrument Sans', sans-serif",
    h1: { fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '-0.04em' },
    h2: { fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontFamily: "'Syne', sans-serif", fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontFamily: "'Syne', sans-serif", fontWeight: 700 },
    h5: { fontFamily: "'Syne', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Syne', sans-serif", fontWeight: 600 },
    button: { fontFamily: "'Instrument Sans', sans-serif", fontWeight: 500, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 4px rgba(0,0,0,0.07),0 4px 16px rgba(0,0,0,0.04)',
    '0 2px 12px rgba(0,0,0,0.09),0 8px 32px rgba(0,0,0,0.05)',
    '0 8px 40px rgba(0,0,0,0.13)',
    ...Array(21).fill('none'),
  ] as any,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '2rem',
          fontFamily: "'Instrument Sans', sans-serif",
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: '#C8622A',
          '&:hover': { background: '#A34D1E' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=Instrument+Sans:ital,wght@0,400;0,500;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.14); border-radius: 10px; }
      `,
    },
  },
});

export default theme;
