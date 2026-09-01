'use client';

import { Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';
import AppHeader from '@/components/header/AppHeader';
import DualLanguageText from '@/components/DualLanguageText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NominationCard from '@/components/nomination/NominationCard';
import NextTimeline from '@/components/nomination/NextTimeline';
import { getDoc } from '@/services/api';

type FormControlProps = {
  name?: string;
};
type FormValues = Record<string, unknown>;
const s = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : fallback;

const formatApprovalDateTime = (dateTimeStr: unknown): string => {
  const raw = s(dateTimeStr, '');
  if (!raw) return '';

  const iso = raw.replace(' ', 'T');
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return raw;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dt);
};

type LeaderRole = 'president' | 'secretary' | 'treasurer';

const LEADER_ROLES: LeaderRole[] = ['president', 'secretary', 'treasurer'];

const leaderLabel = (role: LeaderRole) => ({
  en: s(en?.form?.[role], role),
  hi: s(hi?.form?.[role], role),
});

// the doctype stores one checkbox per role: president_approved, ...
const checkedLeaders = (values: FormValues | null): LeaderRole[] =>
  LEADER_ROLES.filter((role) => {
    const flag = values?.[`${role}_approved`];
    return flag === 1 || flag === true || flag === '1';
  });

// older payloads may carry the verified roles as an array, a JSON array, or a csv
const parseApprovedLeaders = (raw: unknown): LeaderRole[] => {
  let list: unknown[] = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed: unknown = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : raw.split(',');
    } catch {
      list = raw.split(',');
    }
  }

  const roles = list
    .map((v) => s(v).trim().toLowerCase())
    .filter((v): v is LeaderRole => LEADER_ROLES.includes(v as LeaderRole));

  // keep a stable president → secretary → treasurer order, without duplicates
  return LEADER_ROLES.filter((role) => roles.includes(role));
};

// submit_nomination writes one row per approving leader into this child table
const APPROVERS_TABLE = 'table_nmzc';

type LeaderApproval = { role: LeaderRole; on: string };

type LeaderLevel = 'SHG' | 'VO' | 'CLF';

const LEADER_LEVELS: LeaderLevel[] = ['SHG', 'VO', 'CLF'];

// the label is written as "<level>-<role>"; the first nominations stored the
// bare role, and those were all approved at the SHG stage
const splitLabel = (
  label: unknown
): { level: LeaderLevel; role: LeaderRole } | null => {
  const value = s(label).trim().toLowerCase();
  const role = LEADER_ROLES.find((item) => value.endsWith(item));
  if (!role) return null;

  const prefix = value.slice(0, -role.length).replace(/-$/, '');
  const level = LEADER_LEVELS.find((item) => item.toLowerCase() === prefix);

  return { level: level ?? 'SHG', role };
};

// the child table is the only source that knows when each leader approved, and
// the same three roles approve again at every level
const approvalsFromTable = (
  values: FormValues | null,
  level: LeaderLevel
): LeaderApproval[] => {
  const rows = values?.[APPROVERS_TABLE];
  if (!Array.isArray(rows)) return [];

  const verifiedOn = new Map<LeaderRole, string>();

  rows.forEach((row) => {
    if (!row || typeof row !== 'object') return;

    const parsed = splitLabel((row as FormValues).name1);
    if (parsed?.level === level && !verifiedOn.has(parsed.role)) {
      verifiedOn.set(
        parsed.role,
        formatApprovalDateTime((row as FormValues).verified_on)
      );
    }
  });

  return LEADER_ROLES.filter((role) => verifiedOn.has(role)).map((role) => ({
    role,
    on: verifiedOn.get(role) ?? '',
  }));
};

// one "Reviewed by: <role> on <time>" line per leader who approved at this level
const reviewLines = (approvals: LeaderApproval[], fallbackOn: string) =>
  approvals.length > 0
    ? approvals.map(({ role, on }) => {
        const label = leaderLabel(role);
        const when = on || fallbackOn;

        return {
          h2: when
            ? `${en?.workflow?.reviewed_by}: ${label.en} ${en?.workflow?.on} ${when}`
            : `${en?.workflow?.reviewed_by}: ${label.en}`,
          h3: when
            ? `${hi?.workflow?.reviewed_by}: ${label.hi} ${hi?.workflow?.by}, ${when}`
            : `${hi?.workflow?.reviewed_by}: ${label.hi} ${hi?.workflow?.by}`,
        };
      })
    : undefined;

function ViewFormStatus({ name }: FormControlProps) {
  const router = useRouter();
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  useEffect(() => {
    if (!name) return;

    const getFormData = async () => {
      const res = await getDoc(name);
      const first: unknown = res?.message?.msg?.[0];

      const item: FormValues | null =
        first && typeof first === 'object' && !Array.isArray(first)
          ? (first as FormValues)
          : null;

      setFormValues(item);
    };

    getFormData();
  }, [name]);
  const workflowState = s(formValues?.workflow_state);
  const shgActive =
    workflowState === 'SHG Proposed' ||
    workflowState === 'VO Approved' ||
    workflowState === 'CLF Approved';

  const voActive =
    workflowState === 'VO Approved' || workflowState === 'CLF Approved';

  const clfActive = workflowState === 'CLF Approved';
  const pendingEn = en?.workflow?.pending_review;
  const pendingHi = hi?.workflow?.pending_review;

  const shgName = s(formValues?.owner);
  const voName = s(formValues?.vo_approval_by);
  const clfName = s(formValues?.clf_approval_by);

  const voOn = formatApprovalDateTime(formValues?.vo_approved_on);
  const clfOn = formatApprovalDateTime(formValues?.clf_approved_on);

  const voLine =
    voName && voOn
      ? `${en?.workflow?.reviewed_by}: VO ${voName} ${en?.workflow?.on} ${voOn}`
      : voName
        ? `${en?.workflow?.reviewed_by}: VO ${voName}`
        : pendingEn;

  const voLineHi =
    voName && voOn
      ? `${hi?.workflow?.reviewed_by}: VO ${voName} ${hi?.workflow?.by}, ${voOn}`
      : voName
        ? `${hi?.workflow?.reviewed_by}: VO ${voName} ${hi?.workflow?.by}`
        : pendingHi;

  const clfLine =
    clfName && clfOn
      ? `${en?.workflow?.reviewed_by}: CLF ${clfName} ${en?.workflow?.on} ${clfOn}`
      : clfName
        ? `${en?.workflow?.reviewed_by}: CLF ${clfName}`
        : pendingEn;

  const clfLineHi =
    clfName && clfOn
      ? `${hi?.workflow?.reviewed_by}: CLF ${clfName} ${hi?.workflow?.by}, ${clfOn}`
      : clfName
        ? `${hi?.workflow?.reviewed_by}: CLF ${clfName} ${hi?.workflow?.by}`
        : pendingHi;
  const shgOn = formatApprovalDateTime(formValues?.creation);

  const checkedApprovals = checkedLeaders(formValues);
  const legacyRoles =
    checkedApprovals.length > 0
      ? checkedApprovals
      : parseApprovedLeaders(formValues?.approved_leaders);

  // older nominations only recorded which roles approved, so they fall back to
  // the time the nomination itself was submitted
  const shgApprovals = approvalsFromTable(formValues, 'SHG');
  const shgLines = reviewLines(
    shgApprovals.length > 0
      ? shgApprovals
      : legacyRoles.map((role) => ({ role, on: shgOn })),
    shgOn
  );

  // each level keeps its own approvers, so a leader who approves at both the
  // SHG and the VO stage is listed under each one
  const voLines = reviewLines(approvalsFromTable(formValues, 'VO'), voOn);
  const clfLines = reviewLines(approvalsFromTable(formValues, 'CLF'), clfOn);

  const steps = [
    {
      h1: en?.workflow?.shg_review,
      h2: shgName ? `${en?.workflow?.reviewed_by}: SHG ${shgName}` : pendingEn,
      h3: shgName
        ? `${hi?.workflow?.reviewed_by}: SHG ${shgName} ${hi?.workflow?.by}`
        : pendingHi,
      lines: shgLines,
      active: shgActive,
    },
    {
      h1: en?.workflow?.vo_approval,
      h2: voLine,
      h3: voLineHi,
      lines: voLines,
      active: voActive,
    },
    {
      h1: en?.workflow?.clf_approval,
      h2: clfLine,
      h3: clfLineHi,
      lines: clfLines,
      active: clfActive,
    },
  ];
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F3F4F6',
        overflow: 'hidden',
      }}
    >
      <AppHeader
        showBack
        onBack={() => router.push('/dashboard')}
        h1={hi?.form?.nomi_form}
        h2={en?.form?.nomi_form}
      />
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, pb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: '5rem', color: '#6B7280' }} />
          <DualLanguageText
            h1={hi?.form?.nomi_approved}
            h2={en?.form?.nomi_approved}
            boxStyle={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mt: 1,
            }}
            h1style={{
              fontSize: 22,
            }}
            h2style={{
              fontSize: 20,
            }}
          />
        </Box>
        {formValues && (
          <Box sx={{ mt: 2 }}>
            <NominationCard
              key={formValues?.name as string}
              data={formValues}
              canReview={false}
              notshowapproved={true}
            />
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            const base = window.location.origin;
            const link = `${base}/nomination_form/view_form?view=true&name=${formValues?.name ?? ''}`;
            navigator.clipboard.writeText(link);
          }}
          sx={{
            backgroundColor: '#000',
            borderRadius: 3,
            mt: 3,
            py: 1.5,
            textTransform: 'none',
            fontWeight: 600,
            boxShadow: '0px 6px 10px rgba(0,0,0,0.2)',
            '&:hover': {
              backgroundColor: '#111',
            },
          }}
        >
          <DualLanguageText
            h1={hi?.form?.copy_link}
            h2={`(${en?.form?.copy_link})`}
            boxStyle={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            h1style={{
              fontWeight: 400,
              textAlign: 'center',
              fontSize: 13,
            }}
            h2style={{
              fontWeight: 400,
              pl: 1,
              fontSize: 13,
            }}
          />
        </Button>

        <Box sx={{ p: 0.5, mt: 2 }}>
          <DualLanguageText
            h1={hi?.credit_score?.next}
            h2={en?.credit_score?.next}
            h1style={{ fontSize: 20, fontWeight: 700 }}
            h2style={{ mb: 2, fontSize: 16 }}
          />
        </Box>

        <Box>
          <NextTimeline steps={steps} />
        </Box>
      </Box>
    </Box>
  );
}

export default ViewFormStatus;
