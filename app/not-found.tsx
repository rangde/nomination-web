'use client';

import { Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import Title1 from '@/components/Titel1';

export default function NotFound() {
  const router = useRouter();

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
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Title1
          h1="404 - पेज नहीं मिला"
          h2="404 - Page Not Found"
          boxStyle={{ alignItems: 'center' }}
          h1style={{
            fontSize: 28,
            fontWeight: 700,
            color: '#111111',
          }}
          h2style={{
            fontSize: 14,
            color: '#6B7280',
          }}
        />

        <Title1
          h1="आप जिस पेज को खोज रहे हैं वह मौजूद नहीं है"
          h2="The page you are looking for does not exist"
          boxStyle={{ alignItems: 'center' }}
          h1style={{
            fontSize: 14,
            color: '#374151',
            fontWeight: 600,
          }}
          h2style={{
            fontSize: 12,
            color: '#9CA3AF',
          }}
        />

        <Button
          variant="contained"
          onClick={() => router.push('/dashboard')}
          sx={{
            mt: 2,
            bgcolor: '#111111',
            borderRadius: 2,
            textTransform: 'none',
            '&:hover': {
              bgcolor: '#000000',
            },
          }}
        >
          <Title1
            h1="होम पेज पर जाएं"
            h2="Go to Home Page"
            h1style={{
              fontWeight: 600,
              textAlign: 'center',
              fontSize: 15,
            }}
            h2style={{
              fontWeight: 400,
              fontSize: 12,
              textAlign: 'center',
            }}
          />
        </Button>
      </Box>
    </Box>
  );
}
