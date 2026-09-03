'use client';

import { Box, Typography, Paper } from '@mui/material';
import CheckCircleSharpIcon from '@mui/icons-material/CheckCircleSharp';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';

type NominationData = Record<string, unknown>;

type cardValue = {
  data: NominationData;
};

const s = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : fallback;

const pickApproval = (fv: NominationData) => {
  const voOn = s(fv.vo_approved_on);

  const clfOn = s(fv.clf_approved_on);

  if (clfOn) return { on: clfOn, level: 'CLF' as const };
  if (voOn) return { on: voOn, level: 'VO' as const };

  return { on: '', level: 'NONE' as const };
};
const formatApprovalDateTime = (dateTimeStr: string): string => {
  const iso = dateTimeStr.replace(' ', 'T');
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return dateTimeStr;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dt);
};
function NominationCard2({ data }: cardValue) {
  const firstName = s(data.first_name);
  const lastName = s(data.last_name);
  const fullName = `${firstName} ${lastName}`.trim() || 'guest';
  const approval = pickApproval(data);
  const approvedOn = approval.on ? formatApprovalDateTime(approval.on) : '';

  // the SHG credit limit step is optional, so an unset limit is expected
  const creditLimit = Number(data.set_credit_limit);
  const creditLimitLabel =
    Number.isFinite(creditLimit) && creditLimit > 0
      ? `₹${creditLimit}`
      : `${s(hi?.dashboard?.not_set)} (${s(en?.dashboard?.not_set)})`;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: 'white',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CheckCircleSharpIcon sx={{ fontSize: 30, color: '#A1A2A1' }} />

        <Box>
          <Typography fontWeight={600}>{fullName}</Typography>
          <Typography fontSize={12} color="#6B7280">
            {approvedOn} • {creditLimitLabel}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          bgcolor: '#A3A3A3',
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          APPROVED
        </Typography>
      </Box>
    </Paper>
  );
}

export default NominationCard2;
