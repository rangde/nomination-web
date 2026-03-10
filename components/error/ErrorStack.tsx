'use client';

import { Box } from '@mui/material';
import Error from './Error';
import { useEffect, useState } from 'react';
import { subscribe, ToastItem, removeToast } from './toastStore';

export default function ErrorStack() {
  const [messages, setMessages] = useState<ToastItem[]>([]);

  useEffect(() => {
    return subscribe(setMessages);
  }, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 9999,
        top: 20,
        right: { md: 20 },
        left: { xs: '50%', md: 'auto' },
        transform: { xs: 'translateX(-50%)', md: 'none' },

        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {messages.map((msg) => (
        <Error key={msg.id} {...msg} onClose={() => removeToast(msg.id)} />
      ))}
    </Box>
  );
}
