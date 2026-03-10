'use client';

import { Box, CircularProgress } from '@mui/material';
import Title1 from '@/components/Titel1';

export default function Loading() {
  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <CircularProgress
          thickness={5}
          sx={{
            color: '#bfbebb',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />

        <Title1
          h1="लोड हो रहा है..."
          h2="Loading..."
          boxStyle={{ alignItems: 'center' }}
          h1style={{ color: '#111111', fontSize: 24, fontWeight: 700 }}
          h2style={{ color: '#6B7280', fontSize: 18, fontWeight: 500 }}
        />
      </Box>
    </Box>
  );
}
