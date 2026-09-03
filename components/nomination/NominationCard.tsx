'use client';

import { Box, Typography, Paper, Button, SxProps, Theme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useRouter } from 'next/navigation';
import DualLanguageText from '../DualLanguageText';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';

type NominationData = Record<string, unknown>;

export type ApprovalLevel = 'VO' | 'CLF';

type CardValue = {
  data: NominationData;
  cardSx?: SxProps<Theme>;
  approvedSx?: SxProps<Theme>;
  canReview: boolean;
  notshowapproved?: boolean;
  form_approve?: boolean;
  // set on the approved tab, where every card was approved by the viewer
  approvedLevel?: ApprovalLevel;
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

const pickApproval = (fv: NominationData, approvedLevel?: ApprovalLevel) => {
  if (approvedLevel) {
    const level = approvedLevel.toLowerCase();
    return {
      by: s(fv[`${level}_approval_by`]),
      on: s(fv[`${level}_approved_on`]),
      level: approvedLevel,
    };
  }

  const voBy = s(fv.vo_approval_by);
  const voOn = s(fv.vo_approved_on);

  const clfBy = s(fv.clf_approval_by);
  const clfOn = s(fv.clf_approved_on);

  if (clfBy && clfOn) return { by: clfBy, on: clfOn, level: 'CLF' as const };
  if (voBy && voOn) return { by: voBy, on: voOn, level: 'VO' as const };
  if (s(fv.shg_approval_by) || s(fv.name_of_the_shg)) {
    return {
      by: s(fv.shg_approval_by) || s(fv.name_of_the_shg),
      on: s(fv.shg_approved_on),
      level: 'SHG' as const,
    };
  }

  return { by: '', on: '', level: 'NONE' as const };
};

const approvalText = (
  data: NominationData,
  approval: ReturnType<typeof pickApproval>
) => {
  const shgName = s(data.name_of_the_shg);
  if (approval.level === 'VO' && shgName) {
    return `${en?.workflow?.approved_by} VO associated with ${shgName}`;
  }
  if (approval.level === 'CLF' && shgName) {
    return `${en?.workflow?.approved_by} CLF associated with ${shgName}`;
  }
  if (approval.level === 'SHG') {
    return `${en?.workflow?.approved_by} ${shgName || approval.by}`;
  }

  return `${en?.workflow?.approved_by} ${approval.by}`;
};

export default function NominationCard({
  data,
  canReview,
  cardSx,
  approvedSx,
  notshowapproved,
  form_approve,
  approvedLevel,
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

  // the SHG credit limit step is optional, so an unset limit is expected
  const creditLimit = n(data.set_credit_limit, 0);
  const hasCreditLimit = creditLimit > 0;
  const notSetLabel = `${s(hi?.dashboard?.not_set)} (${s(en?.dashboard?.not_set)})`;

  const entType =
    n(data.farm_based, 0) === 1
      ? en?.workflow?.farm_based
      : en?.workflow?.non_farm_based;

  // the approved tab is filtered to this reviewer, so name their own approval
  // instead of a later one at another level
  const approval = form_approve
    ? pickApproval(data, approvedLevel)
    : pickApproval(data);
  const approvedOn = approval.on ? formatApprovalDateTime(approval.on) : '';

  const shouldShowApprovedStrip =
    !notshowapproved && !!approval.by && approval.level !== 'NONE';

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
      <DualLanguageText
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
        <DualLanguageText
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
        <Typography
          fontWeight={600}
          sx={{
            fontSize: '0.9rem',
            color: hasCreditLimit ? 'inherit' : '#6B7280',
          }}
        >
          {hasCreditLimit ? `₹${creditLimit}` : notSetLabel}
        </Typography>
      </Box>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mt: 0.5 }}
      >
        <DualLanguageText
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
            flexWrap: 'wrap',
            mt: 1,
            p: 1,
            borderRadius: '10px',
            ...approvedSx,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 14 }} />
          <Typography sx={{ fontSize: '0.6rem', color: '#374151' }}>
            {approvalText(data, approval)}
          </Typography>
          {approvedOn && (
            <Typography sx={{ fontSize: '0.6rem', color: '#374151' }}>
              {en?.workflow?.on} {approvedOn}
            </Typography>
          )}
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
            <DualLanguageText
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
