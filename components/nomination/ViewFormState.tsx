'use client';

import { Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';
import AppHeader from '@/components/header/Appheader';
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
  const clfOn = formatApprovalDateTime(formValues?.clf_approval_on);

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
  const steps = [
    {
      h1: en?.workflow?.shg_review,
      h2: shgName ? `${en?.workflow?.reviewed_by}: SHG ${shgName}` : pendingEn,
      h3: shgName
        ? `${hi?.workflow?.reviewed_by}: SHG ${shgName} ${hi?.workflow?.by}`
        : pendingHi,
      active: shgActive,
    },
    {
      h1: en?.workflow?.vo_approval,
      h2: voLine,
      h3: voLineHi,
      active: voActive,
    },
    {
      h1: en?.workflow?.clf_approval,
      h2: clfLine,
      h3: clfLineHi,
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
      <Box sx={{ p: 2 }}>
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
            const link = `${base}/nomination_form/view_form?view=false&name=${formValues?.name ?? ''}`;
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
