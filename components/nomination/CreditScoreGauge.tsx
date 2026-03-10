'use client';

import React, { useState, useMemo } from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import GaugeComponent from 'react-gauge-component';
import InfoIcon from '@mui/icons-material/Info';
import CreditScoreDialog from './CreditScoreDialog';
import Title1 from '../Titel1';

type labels = {
  l1: string;
  l2: string;
};
type Props = {
  score: number;
  min?: number;
  max?: number;
  label: labels;
};

const getScoreColor = (score: number): string => {
  if (score < 681) return '#737373';
  if (score <= 770) return '#A3A3A3';
  if (score <= 790) return '#737373';
  return '#525252';
};

export default function CreditScoreGauge({
  score,
  min = 300,
  max = 900,
  label,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const activeColor = useMemo(() => getScoreColor(score), [score]);
  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', borderRadius: 4, boxShadow: 2 }}>
      <CardContent>
        <Box
          sx={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <GaugeComponent
            type="semicircle"
            value={score}
            minValue={min}
            maxValue={max}
            arc={{
              width: 0.25,
              padding: 0.02,
              subArcs: [
                {
                  limit: score,
                  color: activeColor,
                },
                {
                  color: '#E5E7EB',
                },
              ],
            }}
            pointer={{
              type: 'blob',
              animationDuration: 2000,
            }}
            labels={{
              valueLabel: {
                formatTextValue: () => `${score}`,
                style: {
                  fontSize: '40px',
                  fill: '#111827',
                  fontWeight: 700,
                  textShadow: 'none',
                },
              },
            }}
          />

          <Box
            onClick={() => setDialogOpen(true)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
              mt: 1,
              px: 1.5,
              py: 0.5,
              border: '1px solid',
              borderColor: '#E5E7EB',
              borderRadius: 2,
              backgroundColor: '#F9FAFB',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: '#F3F4F6',
                borderColor: '#D1D5DB',
              },
            }}
          >
            <Title1
              h1={label.l1}
              h2={label.l2}
              boxStyle={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              h1style={{
                fontSize: 13,
              }}
              h2style={{
                pl: 1,
                fontSize: 13,
              }}
            />
            <InfoIcon sx={{ fontSize: 16, color: '#6B7280' }} />
          </Box>

          <CreditScoreDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
