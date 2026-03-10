'use client';

import { Box, Paper, IconButton } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import Title1 from '../Titel1';

type MessageType = 'error' | 'warning' | 'success';

type ErrorProps = {
  type: MessageType;
  hi: string;
  en?: string;
  onClose?: () => void;
};

function Error({ type, hi, en, onClose }: ErrorProps) {
  const config = {
    error: {
      color: '#EF4444',
      bg: '#FEE2E2',
      icon: <ErrorOutlineIcon />,
    },
    warning: {
      color: '#F59E0B',
      bg: '#FEF3C7',
      icon: <WarningAmberIcon />,
    },
    success: {
      color: '#22C55E',
      bg: '#DCFCE7',
      icon: <CheckCircleIcon />,
    },
  };

  const current = config[type];

  return (
    <Paper
      elevation={4}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: 3,
        backgroundColor: current.bg,
        color: current.color,
        minWidth: 260,
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>{current.icon}</Box>

        <Title1
          h1={hi}
          h2={en ? `(${en})` : ''}
          h1style={{ fontSize: 14, fontWeight: 600 }}
          h2style={{ fontSize: 12 }}
        />
      </Box>

      <IconButton
        size="small"
        onClick={onClose}
        sx={{
          color: current.color,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
}

export default Error;
