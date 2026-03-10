'use client';

import { Box, Typography, Paper, Button, SxProps, Theme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';
import Title1 from '../Titel1';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';

type NominationData = Record<string, unknown>;

type CardValue = {
  data: NominationData;
  cardSx?: SxProps<Theme>;
  approvedSx?: SxProps<Theme>;
  canReview: boolean;
  notshowapproved?: boolean;
  form_approve?: boolean;
};

const s = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : fallback;

const n = (v: unknown, fallback = 0): number => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const parsed = Number(v);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
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

const pickApproval = (fv: NominationData) => {
  const voBy = s(fv.vo_approval_by);
  const voOn = s(fv.vo_approved_on);

  const clfBy = s(fv.clf_approval_by);
  const clfOn = s(fv.clf_approved_on);

  if (voBy && voOn) return { by: voBy, on: voOn, level: 'VO' as const };
  if (clfBy && clfOn) return { by: clfBy, on: clfOn, level: 'CLF' as const };

  return { by: '', on: '', level: 'NONE' as const };
};

export default function NominationCard({
  data,
  canReview,
  cardSx,
  approvedSx,
  notshowapproved,
  form_approve,
}: CardValue) {
  const router = useRouter();

  const openViewForm = () => {
    if (form_approve) return;
    const docName = s(data.name);
    router.push(
      `/nomination_form/view_form?view=${String(!canReview)}&name=${encodeURIComponent(
        docName
      )}`
    );
  };

  const firstName = s(data.first_name);
  const lastName = s(data.last_name);
  const fullName = `${firstName} ${lastName}`.trim() || 'guest';

  const docId = s(data.name);

  const creditLimit = n(data.set_credit_limit, 0);

  const entType =
    n(data.farm_based, 0) === 1 ? 'Farm Based' : 'Non - Farm Based';

  const approval = pickApproval(data);
  const approvedBy = approval.by || 'XYZ';
  const approvedOn = approval.on ? formatApprovalDateTime(approval.on) : '';
  const isShgProposed = canReview && s(data.workflow_state) === 'SHG Proposed';
  const showApproved = isShgProposed ? true : !approval.by;

  const shouldShowApprovedStrip =
    !showApproved && !notshowapproved && !!approval.by;

  return (
    <Paper
      onClick={openViewForm}
      elevation={2}
      sx={{
        p: 1.5,
        borderRadius: 2,
        borderLeft: '4px solid',
        borderColor: '#000',
        ...cardSx,
      }}
    >
      <Title1
        h1={fullName}
        h2={`ID: ${docId}`}
        h1style={{ fontSize: '1rem', fontWeight: 600 }}
        h2style={{
          fontWeight: 400,
          mb: 0.5,
          fontSize: '0.75rem',
          color: '#6B7280',
        }}
      />

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 0.5 }}
      >
        <Title1
          h1={s(
            (hi as unknown as Record<string, unknown>)?.dashboard &&
              hi.dashboard?.credit_limit
          )}
          h2={s(
            (en as unknown as Record<string, unknown>)?.dashboard &&
              en.dashboard?.credit_limit
          )}
          h1style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6B7280' }}
          h2style={{ fontWeight: 400, fontSize: '0.65rem', color: '#6B7280' }}
        />
        <Typography fontWeight={600} sx={{ fontSize: '0.9rem' }}>
          ₹{creditLimit}
        </Typography>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 0.5 }}
      >
        <Title1
          h1={s(hi?.dashboard?.ent_type)}
          h2={s(en?.dashboard?.ent_type)}
          h1style={{ fontSize: '0.75rem', fontWeight: 500, color: '#6B7280' }}
          h2style={{ fontWeight: 400, fontSize: '0.65rem', color: '#6B7280' }}
        />
        <Typography sx={{ fontSize: '0.9rem' }} fontWeight={600}>
          {entType}
        </Typography>
      </Box>

      {shouldShowApprovedStrip && (
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            alignItems: 'center',
            mt: 1,
            p: 1,
            borderRadius: '10px',
            ...approvedSx,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: '0.6rem', color: '#374151' }}>
            Approved by {approvedBy}
          </Typography>
          <Typography sx={{ fontSize: '0.6rem', color: '#374151' }}>
            on {approvedOn}
          </Typography>
        </Box>
      )}

      {canReview && (
        <Box sx={{ mt: 1 }}>
          <Button
            fullWidth
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: 2,
              py: 1,
              textTransform: 'none',
              '&:hover': { backgroundColor: '#333' },
            }}
            onClick={(e) => {
              e.stopPropagation();
              openViewForm();
            }}
          >
            <Title1
              h1={s(hi?.dashboard?.review)}
              h2={s(en?.dashboard?.review)}
              h1style={{ fontWeight: 600, fontSize: '0.8rem' }}
              h2style={{ fontWeight: 400, fontSize: '0.7rem' }}
            />
          </Button>
        </Box>
      )}
    </Paper>
  );
}
