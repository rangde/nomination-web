'use client';

import { Box, Button, Paper } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Title1 from '../Titel1';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';
import { useRouter } from 'next/navigation';

type CreateNominationFlow = {
  disable?: boolean;
};

function CreateNominationBox({ disable = false }: CreateNominationFlow) {
  const router = useRouter();

  const openNominationForm = () => {
    router.push('/nomination_form/step-1');
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: 'white',
      }}
    >
      <Title1
        h1={hi?.dashboard?.nomi_new}
        h2={en?.dashboard?.nomi_new}
        h1style={{ fontSize: '1.1rem', fontWeight: 600 }}
        h2style={{ fontWeight: 400, fontSize: '0.8rem', mb: 1 }}
      />

      {!disable ? (
        <Button
          fullWidth
          onClick={openNominationForm}
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: 2,
            py: 1,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#333',
            },
          }}
        >
          <Title1
            h1={hi?.dashboard?.create_nomination}
            h2={en?.dashboard?.create_nomination}
            h1style={{
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
            h2style={{
              fontWeight: 400,
              fontSize: '0.75rem',
            }}
          />
        </Button>
      ) : (
        <Box
          sx={{
            mt: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            backgroundColor: '#F3F4F6',
            p: 1,
            borderRadius: 2,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />

          <Title1
            h1="केवल SHG उपयोगकर्ता नया नामांकन बना सकते हैं"
            h2="(Only SHG user can create nomination)"
            h1style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#6B7280',
            }}
            h2style={{
              pl: 1,
              fontSize: 12,
              fontWeight: 400,
              color: '#6B7280',
            }}
          />
        </Box>
      )}
    </Paper>
  );
}

export default CreateNominationBox;
