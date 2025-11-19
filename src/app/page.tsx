'use client';

import { useAuthOptional } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';

export default function Home() {
  const { isAuthenticated, loading } = useAuthOptional();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, loading, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'light'
          ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #d946ef 100%)'
          : 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 50%, #86198f 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(60px)',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -150,
          left: -150,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(80px)',
        }}
      />

      <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <AccountBalanceWallet sx={{ fontSize: 48, color: 'white' }} />
          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              color: 'white',
            }}
          >
            Expense Tracker
          </Typography>
        </Box>
        <CircularProgress size={48} sx={{ color: 'white' }} />
        <Typography variant="body1" sx={{ mt: 2, color: 'rgba(255, 255, 255, 0.9)' }}>
          Loading...
        </Typography>
      </Box>
    </Box>
  );
}