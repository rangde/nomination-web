'use client';

import { Box, Paper, Typography } from '@mui/material';
import Title1 from '../Titel1';

type StatusMessage = {
  h1: string;
  h2: string;
  count: number;
  show: boolean;
  onClick?: () => void;
};

function StatsButtons({ h1, h2, count, show, onClick }: StatusMessage) {
  return (
    <Box sx={{ flex: 1, display: 'flex' }}>
      <Paper
        elevation={2}
        onClick={onClick}
        sx={{
          flex: 1,
          p: 1.5,
          borderRadius: 2,
          cursor: 'pointer',
          backgroundColor: 'white',
          border: '2px solid',
          borderColor: show ? '#000' : 'transparent',
        }}
      >
        <Title1
          h1={h1}
          h2={h2}
          h1style={{ fontSize: '0.8rem', fontWeight: 600 }}
          h2style={{ fontWeight: 400, fontSize: '0.7rem', mb: 0.5 }}
        />
        <Typography fontWeight={700} fontSize="1.5rem">
          {count}
        </Typography>
      </Paper>
    </Box>
  );
}

export default StatsButtons;
