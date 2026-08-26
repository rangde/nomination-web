'use client';

import { Box, Paper, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import AppHeader from '@/components/header/AppHeader';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';
import DualLanguageText from '@/components/DualLanguageText';
import SelectField from '@/components/FormComponents/SelectField';
import { getDoc, approveDoc, getLeaderApprovals } from '@/services/api';
import ShgLeaderApproval, {
  LeaderLevel,
  LeaderRole,
} from '@/components/nomination/ShgLeaderApproval';
import type { LeaderApproval } from '@/app/nomination_form/NominationFormProvider';
import { addToast } from '../error/toastStore';
import CircularProgress from '@mui/material/CircularProgress';

type FormValues = Record<string, unknown>;

const MIN_LEADER_APPROVALS = 2;

// the SHG submits, the VO reviews it next and the CLF after that, so the state a
// nomination sits in says whose leaders have to approve to move it on
const REVIEW_LEVEL: Record<string, LeaderLevel> = {
  'SHG Proposed': 'VO',
  'VO Approved': 'CLF',
};

const APPROVAL_HEADING: Record<LeaderLevel, { hi: string; en: string }> = {
  SHG: {
    hi: hi.form.shg_leader_approval,
    en: en.form.shg_leader_approval,
  },
  VO: { hi: hi.form.vo_leader_approval, en: en.form.vo_leader_approval },
  CLF: { hi: hi.form.clf_leader_approval, en: en.form.clf_leader_approval },
};

const NO_NUMBERS: Record<LeaderRole, string> = {
  president: '',
  secretary: '',
  treasurer: '',
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

const getScoreColor = (score: number): string => {
  if (score < 681) return '#737373';
  if (score <= 770) return '#A3A3A3';
  if (score <= 790) return '#737373';
  return '#525252';
};

type ScoreBandKey = 'needs_help' | 'average' | 'fair' | 'good' | 'excellent';

const getScoreBandKey = (score: number): ScoreBandKey => {
  if (score < 681) return 'needs_help';
  if (score <= 730) return 'average';
  if (score <= 770) return 'fair';
  if (score <= 790) return 'good';
  return 'excellent';
};

type SectionProps = {
  titleHi?: unknown;
  titleEn?: unknown;
  children: ReactNode;
};

function Section({ titleHi, titleEn, children }: SectionProps) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <DualLanguageText
        h1={s(titleHi)}
        h2={s(titleEn)}
        boxStyle={{ pb: 2 }}
        h1style={{ fontSize: 16, fontWeight: 700 }}
        h2style={{ fontWeight: 300, fontSize: 13 }}
      />
      {children}
    </Paper>
  );
}

type FormControlProps = {
  view: boolean;
  name?: string;
};

export default function ViewFormContent({ view, name }: FormControlProps) {
  const router = useRouter();

  const [creditLimit, setCreditLimit] = useState('');
  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaderNumbers, setLeaderNumbers] =
    useState<Record<LeaderRole, string>>(NO_NUMBERS);
  const [approvals, setApprovals] = useState<LeaderApproval[]>([]);

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

      const serverLimit = s(item?.set_credit_limit);
      if (serverLimit) setCreditLimit(serverLimit);

      const approvalLevel = REVIEW_LEVEL[s(item?.workflow_state)];
      if (approvalLevel) {
        const approvalRes = await getLeaderApprovals(approvalLevel, name).catch(
          () => null
        );
        const cachedApprovals = approvalRes?.message?.status
          ? approvalRes.message.msg
          : [];
        if (Array.isArray(cachedApprovals) && cachedApprovals.length) {
          setApprovals(cachedApprovals);
        }
      }
    };

    getFormData();
  }, [name]);

  const handleApprove = async () => {
    if (!name) return;

    const limitToApprove = creditLimit || s(formValues?.set_credit_limit);
    const currentApprovalLevel = REVIEW_LEVEL[s(formValues?.workflow_state)];
    const creditLimitRequired = currentApprovalLevel !== 'VO';

    if (creditLimitRequired && !limitToApprove) {
      addToast({
        type: 'error',
        hi: 'कृपया क्रेडिट सीमा चुनें',
        en: 'Please select a credit limit before approving',
      });
      return;
    }

    try {
      setLoading(true);

      const res = await approveDoc(name, limitToApprove);

      const payload = res?.message ?? res;

      if (payload?.status === 1) {
        addToast({
          type: 'success',
          hi: hi?.workflow?.doc_moved,
          en: en?.workflow?.doc_moved,
        });
        router.push(
          `/nomination_form/view_status?name=${encodeURIComponent(name)}`
        );
      } else {
        addToast({
          type: 'error',
          hi: hi?.workflow?.approval_failed,
          en: en?.workflow?.approval_failed,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const firstName = s(formValues?.first_name);
  const lastName = s(formValues?.last_name);
  const fullName = `${firstName} ${lastName}`.trim() || 'guest';

  const docId = s(formValues?.name, '—');
  const workflowState = s(formValues?.workflow_state, '—');

  // the same three roles approve again at each stage, under their own level
  const approvalLevel = REVIEW_LEVEL[s(formValues?.workflow_state)];
  const needsApprovals = !view && !!approvalLevel;
  const hasEnoughApprovals = approvals.length >= MIN_LEADER_APPROVALS;

  const shgProposed =
    n(formValues?.shg_proposed, 0) || s(formValues?.shg_proposed, '0');
  const voProposed =
    workflowState === 'SHG Proposed'
      ? 'Pending'
      : String(
          n(formValues?.vo_proposed, 0) || s(formValues?.vo_proposed, '0')
        );
  const clfProposed =
    workflowState === 'SHG Proposed' || workflowState === 'VO Approved'
      ? 'Pending'
      : String(
          n(formValues?.clf_proposed, 0) || s(formValues?.clf_proposed, '0')
        );

  const sectorType =
    n(formValues?.farm_based, 0) === 1
      ? 'Farm'
      : n(formValues?.non_farm, 0) === 1
        ? 'Non-Farm'
        : n(formValues?.none, 0) === 1
          ? 'None'
          : 'Agriculture';

  const supportNeeded = useMemo(() => {
    const out: string[] = [];
    if (n(formValues?.market_access, 0) === 1) out.push('Market Access');
    if (n(formValues?.marketing, 0) === 1) out.push('Marketing');
    return out.join(', ') || '-';
  }, [formValues]);

  const enterpriseType = s(formValues?.business_category, 'Agriculture');

  const creditScore = n(formValues?.credit_score, 0);
  const scoreColor = getScoreColor(creditScore);
  const scoreBandKey = getScoreBandKey(creditScore);

  const legendLang: 'hi' | 'en' = 'hi';
  const scoreLabel =
    legendLang === 'hi'
      ? s(hi?.credit_score?.[scoreBandKey], '')
      : s(en?.credit_score?.[scoreBandKey], '');

  const nomi_details = [
    { h1: hi?.form?.full_name, h2: en?.form?.full_name, h3: fullName || '-' },
    {
      h1: hi?.form?.adhaar,
      h2: en?.form?.adhaar,
      h3: s(formValues?.aadhaar_number, '-'),
    },
    {
      h1: hi?.form?.pan,
      h2: en?.form?.pan,
      h3: s(formValues?.pan_number, '-'),
    },
    {
      h1: hi?.form?.voter_id,
      h2: en?.form?.voter_id,
      h3: s(formValues?.voter_id, '-'),
    },
    {
      h1: hi?.form?.dob,
      h2: en?.form?.dob,
      h3: s(formValues?.date_of_birth, '-'),
    },
    {
      h1: hi?.form?.pincode,
      h2: en?.form?.pincode,
      h3: s(formValues?.pincode, '-'),
    },
    {
      h1: hi?.form?.dictrict,
      h2: en?.form?.dictrict,
      h3: s(formValues?.district, '-'),
    },
    {
      h1: hi?.form?.area,
      h2: en?.form?.area,
      h3: s(formValues?.townvillage, '-'),
    },
    {
      h1: hi?.form?.permanent_address,
      h2: en?.form?.permanent_address,
      h3: s(formValues?.permanent_address, '-'),
    },
  ];

  const enterpricess_details = [
    {
      h1: hi?.form?.sector_type,
      h2: en?.form?.sector_type,
      h3: sectorType || '-',
    },
    {
      h1: hi?.dashboard?.ent_type,
      h2: en?.dashboard?.ent_type,
      h3: enterpriseType || '-',
    },
    {
      h1: hi?.workflow?.support_needed,
      h2: en?.workflow?.support_needed,
      h3: supportNeeded || '-',
    },
  ];

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F3F4F6',
      }}
    >
      <AppHeader
        showBack
        onBack={() => router.back()}
        h1={s(hi?.form?.nomi_form)}
        h2={s(en?.form?.nomi_form)}
      />

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Box>
            <Box>
              <DualLanguageText
                h1={fullName}
                h2={`ID: ${docId}`}
                boxStyle={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}
                h1style={{ fontSize: 16, fontWeight: 600 }}
                h2style={{ fontWeight: 600, fontSize: 16 }}
              />
            </Box>

            <Box display="flex" marginTop="5px" justifyContent="space-between">
              <DualLanguageText
                h1="SHG Proposed"
                h2={`₹${shgProposed}`}
                boxStyle={{ display: 'flex', alignItems: 'center' }}
                h1style={{ fontSize: 13, fontWeight: 600 }}
                h2style={{ fontWeight: 300, fontSize: 12 }}
              />
              <DualLanguageText
                h1="VO Proposed"
                h2={voProposed === 'Pending' ? 'Pending' : `₹${voProposed}`}
                boxStyle={{ display: 'flex', alignItems: 'center' }}
                h1style={{ fontSize: 13, fontWeight: 600 }}
                h2style={{
                  fontWeight: 300,
                  fontSize: 12,
                  color: voProposed === 'Pending' ? '#9CA3AF' : undefined,
                }}
              />
              <DualLanguageText
                h1="CLF Proposed"
                h2={clfProposed === 'Pending' ? 'Pending' : `₹${clfProposed}`}
                boxStyle={{ display: 'flex', alignItems: 'center' }}
                h1style={{ fontSize: 13, fontWeight: 600 }}
                h2style={{
                  fontWeight: 300,
                  fontSize: 12,
                  color: clfProposed === 'Pending' ? '#9CA3AF' : undefined,
                }}
              />
            </Box>
          </Box>
        </Paper>

        <Section
          titleHi={hi?.nomi_form?.nomniee_title}
          titleEn={en?.nomi_form?.nomniee_title}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            {nomi_details.map((item, index) => (
              <DualLanguageText
                key={index}
                h1={item.h1}
                h2={item.h2}
                h3={item.h3 || '-'}
                h1style={{ fontSize: 13, fontWeight: 600, color: '#5c5b5b' }}
                h2style={{ fontWeight: 300, fontSize: 14 }}
                h3style={{ fontSize: 13, fontWeight: 600 }}
              />
            ))}
          </Box>
        </Section>

        <Section
          titleHi={hi?.nomi_form?.enterprises_title}
          titleEn={en?.nomi_form?.enterprises_title}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
            }}
          >
            {enterpricess_details.map((item, index) => (
              <Box
                key={index}
                sx={{
                  gridColumn:
                    index === enterpricess_details.length - 1 &&
                    enterpricess_details.length % 2 === 1
                      ? '1 / -1'
                      : 'auto',
                }}
              >
                <DualLanguageText
                  h1={item.h1}
                  h2={item.h2}
                  h3={item.h3 || '-'}
                  h1style={{ fontSize: 13, fontWeight: 600, color: '#5c5b5b' }}
                  h2style={{ fontWeight: 300, fontSize: 14 }}
                  h3style={{ fontSize: 13, fontWeight: 600 }}
                />
              </Box>
            ))}
          </Box>
        </Section>

        <Section
          titleHi={hi?.nomi_form?.credit_bureau}
          titleEn={en?.nomi_form?.credit_bureau}
        >
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              border: '1px solid #E5E7EB',
              bgcolor: '#F9FAFB',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box>
              <DualLanguageText
                h1={hi?.workflow?.credit_score_label}
                h2={String(creditScore)}
                h1style={{ fontSize: 14, fontWeight: 400 }}
                h2style={{ fontWeight: 600, fontSize: 18 }}
              />
            </Box>

            <Box
              sx={{
                bgcolor: scoreColor,
                color: '#fff',
                px: 1.5,
                py: 0.5,
                borderRadius: 3,
                fontSize: 12,
              }}
            >
              {scoreLabel || '-'}
            </Box>
          </Paper>
        </Section>

        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <SelectField
            label_1={s(hi?.credit_score?.set_credit_limit)}
            label_2={s(en?.credit_score?.set_credit_limit)}
            placeholder={`${s(hi?.dashboard?.not_set)} (${s(
              en?.dashboard?.not_set
            )})`}
            value={creditLimit || s(formValues?.set_credit_limit)}
            onChange={setCreditLimit}
            view={view}
            options={[
              { label_1: '50000', value: '50000' },
              { label_1: '100000', value: '100000' },
              { label_1: '150000', value: '150000' },
              { label_1: '200000', value: '200000' },
              { label_1: '250000', value: '250000' },
              { label_1: '300000', value: '300000' },
            ]}
          />
        </Paper>

        {needsApprovals && (
          <Paper sx={{ p: 2, borderRadius: 3 }}>
            <ShgLeaderApproval
              level={approvalLevel}
              nominationName={name}
              heading_1={APPROVAL_HEADING[approvalLevel].hi}
              heading_2={APPROVAL_HEADING[approvalLevel].en}
              numbers={leaderNumbers}
              approved={approvals}
              onNumberChange={(role, value) =>
                setLeaderNumbers((prev) => ({ ...prev, [role]: value }))
              }
              onApproved={(approval) =>
                setApprovals((prev) => {
                  const approvals = Array.isArray(approval)
                    ? approval
                    : [approval];
                  const byRole = new Map(
                    prev.map((item) => [item.role, item] as const)
                  );

                  approvals.forEach((item) => byRole.set(item.role, item));
                  return Array.from(byRole.values());
                })
              }
            />
          </Paper>
        )}

        {!view && (
          <Button
            fullWidth
            variant="contained"
            disabled={loading || (needsApprovals && !hasEnoughApprovals)}
            onClick={(e) => {
              e.stopPropagation();
              handleApprove();
            }}
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&.Mui-disabled': { backgroundColor: '#9CA3AF', color: '#fff' },
            }}
          >
            {loading ? (
              <CircularProgress size={18} sx={{ color: '#fff' }} />
            ) : (
              <DualLanguageText
                h1={hi.nomi_form.approve}
                h2={en.nomi_form.approve}
                h1style={{
                  fontWeight: 700,
                  textAlign: 'center',
                  fontSize: 15,
                }}
                h2style={{
                  fontWeight: 400,
                  fontSize: 12,
                  textAlign: 'center',
                }}
              />
            )}
          </Button>
        )}
      </Box>
    </Box>
  );
}
