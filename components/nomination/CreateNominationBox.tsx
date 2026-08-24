'use client';

import { Box, Button, Paper } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useEffect, useState } from 'react';
import DualLanguageText from '../DualLanguageText';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';
import { useRouter } from 'next/navigation';
import { getNominationDraft } from '@/services/api';
import { storage } from '@/app/utils/localStorage';

type CreateNominationFlow = {
  disable?: boolean;
};

const hasCompletedCreditCheck = (creditScore: unknown) => {
  const score = Number(creditScore);
  return Number.isFinite(score) && (score < 0 || score > 0);
};

const hasCreditCheckProgress = (creditScore: unknown) =>
  creditScore !== undefined &&
  creditScore !== null &&
  String(creditScore) !== '';

function CreateNominationBox({ disable = false }: CreateNominationFlow) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadDraft = async () => {
      try {
        const res = await getNominationDraft();
        const draft = res?.message?.status ? res.message.msg?.[0] : null;

        if (!mounted) return;
        setHasDraft(Boolean(draft?.name));
        if (draft?.name) storage.set('nomination_form_draft_name', draft.name);
      } catch {
        if (mounted) setHasDraft(false);
      }
    };

    if (!disable) loadDraft();

    return () => {
      mounted = false;
    };
  }, [disable]);

  const openNominationForm = async () => {
    if (loading) return;

    try {
      setLoading(true);
      const res = await getNominationDraft();
      const draft = res?.message?.status ? res.message.msg?.[0] : null;

      if (draft?.name) {
        storage.set('nomination_form_draft_name', draft.name);
        router.push(
          hasCompletedCreditCheck(draft.credit_score) ||
            hasCreditCheckProgress(draft.credit_score)
            ? '/nomination_form/step-4'
            : '/nomination_form/step-1'
        );
        return;
      }
    } catch {}

    router.push('/nomination_form/step-1');
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        backgroundColor: 'white',
      }}
    >
      <DualLanguageText
        h1={hi?.dashboard?.nomi_new}
        h2={en?.dashboard?.nomi_new}
        h1style={{ fontSize: '1.1rem', fontWeight: 600 }}
        h2style={{ fontWeight: 400, fontSize: '0.8rem', mb: 1 }}
      />

      {!disable ? (
        <Button
          fullWidth
          onClick={openNominationForm}
          disabled={loading}
          sx={{
            backgroundColor: '#000',
            color: '#fff',
            borderRadius: 2,
            py: 1,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#333',
            },
          }}
        >
          <DualLanguageText
            h1={
              hasDraft
                ? hi?.dashboard?.resume_nomination
                : hi?.dashboard?.create_nomination
            }
            h2={
              hasDraft
                ? en?.dashboard?.resume_nomination
                : en?.dashboard?.create_nomination
            }
            h1style={{
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
            h2style={{
              fontWeight: 400,
              fontSize: '0.75rem',
            }}
          />
        </Button>
      ) : (
        <Box
          sx={{
            mt: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            backgroundColor: '#F3F4F6',
            p: 1,
            borderRadius: 2,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 18, color: '#9CA3AF' }} />

          <DualLanguageText
            h1={hi?.workflow?.shg_only}
            h2={`(${en?.workflow?.shg_only})`}
            h1style={{
              fontSize: 12,
              fontWeight: 500,
              color: '#6B7280',
            }}
            h2style={{
              pl: 1,
              fontSize: 12,
              fontWeight: 400,
              color: '#6B7280',
            }}
          />
        </Box>
      )}
    </Paper>
  );
}

export default CreateNominationBox;
