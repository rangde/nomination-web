'use client';

import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

import en from '@/messages/en.json';
import hi from '@/messages/hi.json';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function CreditScoreInfoDialog({ open, onClose }: Props) {
  const [lang, setLang] = useState<'hi' | 'en'>('en');

  const isHi = lang === 'hi';

  const ranges = isHi
    ? [
        {
          r: `681 ${hi?.credit_score?.below}`,
          t: hi?.credit_score?.needs_help,
        },
        { r: '681 - 730', t: hi?.credit_score?.average },
        { r: '731 - 770', t: hi?.credit_score?.fair },
        { r: '771 - 790', t: hi?.credit_score?.good },
        { r: `790 ${hi?.credit_score?.above}`, t: hi?.credit_score?.excellent },
      ]
    : [
        {
          r: `${en?.credit_score?.below} 681`,
          t: en?.credit_score?.needs_help,
        },
        { r: '681 - 730', t: en?.credit_score?.average },
        { r: '731 - 770', t: en?.credit_score?.fair },
        { r: '771 - 790', t: en?.credit_score?.good },
        { r: `${en?.credit_score?.above} 790`, t: en?.credit_score?.excellent },
      ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          maxWidth: 420,
          width: '100%',
        },
      }}
    >
      <DialogContent>
        <Box display="flex" justifyContent="flex-end">
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ fontSize: '12' }} />
          </IconButton>
        </Box>

        <Typography fontSize={14} fontWeight={600} mb={2}>
          {isHi
            ? hi?.credit_score?.dialog_heading
            : en?.credit_score?.dialog_heading}
        </Typography>

        <Typography color="#6B7280" mb={3}>
          {isHi
            ? hi?.credit_score?.dialog_content
            : en?.credit_score?.dialog_content}
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {ranges.map((item, i) => (
            <Box key={i} display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: `rgba(0,0,0,${0.2 + i * 0.15})`,
                }}
              />
              <Typography sx={{ minWidth: 110, fontSize: 13 }}>
                {item.r}
              </Typography>
              <Typography color="#374151" sx={{ fontSize: 13 }}>
                {item.t}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box display="flex" justifyContent="center" gap={6} mt={4}>
          <Typography
            onClick={() => setLang('hi')}
            sx={{
              cursor: 'pointer',
              fontWeight: lang === 'hi' ? 600 : 400,
              borderBottom:
                lang === 'hi' ? '3px solid #000' : '3px solid transparent',
              pb: 0.5,
            }}
          >
            {hi?.credit_score?.lang}
          </Typography>

          <Typography
            onClick={() => setLang('en')}
            sx={{
              cursor: 'pointer',
              fontWeight: lang === 'en' ? 600 : 400,
              borderBottom:
                lang === 'en' ? '3px solid #000' : '3px solid transparent',
              pb: 0.5,
            }}
          >
            {en?.credit_score?.lang}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
