'use client';

import { Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import DualLanguageText from '@/components/DualLanguageText';
import { storage } from '@/app/utils/localStorage';
import { clearAllUserCaches } from '../utils/user';
export default function NoPermissionPage() {
  const router = useRouter();

  const handleLogout = () => {
    Object.keys(Cookies.get()).forEach((cookieName) => {
      Cookies.remove(cookieName);
    });
    clearAllUserCaches();
    storage.clear();
    sessionStorage.clear();
    router.push('/login');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
        textAlign: 'center',
      }}
    >
      <DualLanguageText
        h1="आपके पास अनुमति नहीं है"
        h2="You don’t have permission"
        h1style={{ fontSize: 22, fontWeight: 700 }}
        h2style={{ mt: 0.5, color: '#6B7280', fontSize: 14 }}
      />

      <DualLanguageText
        h1="कृपया SHG / VO / CLF भूमिका देने के लिए अपने एडमिन से संपर्क करें।"
        h2="Please contact your admin to assign SHG / VO / CLF role."
        h1style={{ mt: 2, fontSize: 16 }}
        h2style={{ mt: 0.5, fontSize: 13, color: '#6B7280' }}
      />

      <Button
        variant="contained"
        onClick={handleLogout}
        sx={{
          backgroundColor: '#000',
          borderRadius: 3,
          mt: 5,
          p: 2,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: '0px 6px 10px rgba(0,0,0,0.2)',
          '&:hover': {
            backgroundColor: '#111',
          },
        }}
      >
        <DualLanguageText
          h1="लॉग आउट"
          h2="Logout"
          h1style={{ fontSize: 14, fontWeight: 600 }}
          h2style={{ fontSize: 12 }}
        />
      </Button>
    </Box>
  );
}
