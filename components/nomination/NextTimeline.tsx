'use client';

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { Box } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import ApartmentIcon from '@mui/icons-material/Apartment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import DualLanguageText from '@/components/DualLanguageText';

type Step = {
  h1: string;
  h2: string;
  h3?: string;
  active?: boolean;
};

type Props = {
  steps: Step[];
};

function NextTimeline({ steps }: Props) {
  const iconList = [
    <GroupsIcon key="groups-icon" />,
    <ApartmentIcon key="apartment-icon" />,
    <AccountBalanceIcon key="account-icon" />,
  ];

  return (
    <Timeline
      position="right"
      sx={{
        p: 0,
        m: 0,
        '& .MuiTimelineItem-root:before': { flex: 0, p: 0 },
      }}
    >
      {steps.map((item, index) => {
        const isActive = !!item.active;

        return (
          <TimelineItem key={`${item.h1}-${index}`} sx={{ minHeight: 72 }}>
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  bgcolor: isActive ? '#000' : '#E5E7EB',
                  color: isActive ? '#fff' : '#9CA3AF',
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'none',
                  border: 'none',
                }}
              >
                {iconList[index] ?? <GroupsIcon />}
              </TimelineDot>

              {index !== steps.length - 1 && (
                <TimelineConnector
                  sx={{
                    bgcolor: '#D1D5DB',
                    width: 2,
                    height: 56,
                  }}
                />
              )}
            </TimelineSeparator>

            <TimelineContent sx={{ py: 0, mt: 0.5 }}>
              <Box sx={{ opacity: isActive ? 1 : 0.55 }}>
                <DualLanguageText
                  h1={item.h1}
                  h2={item.h2}
                  h3={item.h3 || '-'}
                  h1style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isActive ? '#111827' : '#6B7280',
                    lineHeight: 1.5,
                  }}
                  h2style={{
                    fontWeight: 500,
                    fontSize: 11,
                    color: '#6B7280',
                    lineHeight: 1.5,
                  }}
                  h3style={{
                    fontSize: 11,
                    fontWeight: 500,
                    color: '#6B7280',
                    lineHeight: 1.5,
                  }}
                />
              </Box>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );
}

export default NextTimeline;
