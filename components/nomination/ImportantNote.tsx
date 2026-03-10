'use client';

import { Box, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import Title1 from '@/components/Titel1';

type Props = {
  h1: string;
  h2: string;
  desc_1: string;
  desc_2: string;
};

function ImportantNote({ h1, h2, desc_1, desc_2 }: Props) {
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        borderRadius: 3,
        backgroundColor: '#D1D5DB',
      }}
    >
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <WarningAmberIcon sx={{ fontSize: 18 }} />

        <Title1
          h1={h1}
          h2={h2}
          boxStyle={{ display: 'flex', flexDirection: 'column' }}
          h1style={{ fontSize: 13, fontWeight: 700 }}
          h2style={{ fontSize: 12 }}
        />
      </Box>

      <Typography fontSize={12} fontWeight={700} mb={1}>
        {desc_1}
      </Typography>

      <Typography fontSize={12}>{desc_2}</Typography>
    </Box>
  );
}

export default ImportantNote;
