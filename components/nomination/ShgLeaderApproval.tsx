'use client';

import { useCallback, useEffect, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { MuiOtpInput } from 'mui-one-time-password-input';

import DualLanguageText from '@/components/DualLanguageText';
import { addToast } from '@/components/error/toastStore';
import { ApiError, sendLeaderOtp, verifyLeaderOtp } from '@/services/api';
import type { LeaderApproval } from '@/app/nomination_form/NominationFormProvider';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';

export type LeaderRole = 'president' | 'secretary' | 'treasurer';

export type LeaderLevel = 'SHG' | 'VO' | 'CLF';

const LEADERS: { role: LeaderRole; label_1: string; label_2: string }[] = [
  { role: 'president', label_1: hi.form.president, label_2: en.form.president },
  { role: 'secretary', label_1: hi.form.secretary, label_2: en.form.secretary },
  { role: 'treasurer', label_1: hi.form.treasurer, label_2: en.form.treasurer },
];

const RESEND_SECONDS = 60;

// only the last 4 digits stay visible once an OTP is on its way
const maskNumber = (number: string) =>
  number.length < 4
    ? number
    : `${'X'.repeat(number.length - 4)}${number.slice(-4)}`;

const formatVerifiedOn = (value: string) => {
  if (!value) return '';

  const parsed = new Date(value.replace(' ', 'T'));
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(parsed);
};

type Props = {
  numbers: Record<LeaderRole, string>;
  approved: LeaderApproval[];
  onNumberChange: (role: LeaderRole, value: string) => void;
  onApproved: (approval: LeaderApproval) => void;
  // the same three cards approve at the SHG, VO and CLF stages
  level?: LeaderLevel;
  heading_1?: string;
  heading_2?: string;
  nominationName?: string;
};

function ShgLeaderApproval({
  numbers,
  approved,
  onNumberChange,
  onApproved,
  level = 'SHG',
  heading_1 = hi?.form?.shg_leader_approval,
  heading_2 = en?.form?.shg_leader_approval,
  nominationName,
}: Props) {
  const [otpSentTo, setOtpSentTo] = useState<LeaderRole[]>([]);
  const [otps, setOtps] = useState<Record<string, string>>({});
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState<LeaderRole | null>(null);

  // one ticker drives every card's resend countdown
  useEffect(() => {
    const active = Object.values(countdowns).some((seconds) => seconds > 0);
    if (!active) return;

    const timer = setInterval(() => {
      setCountdowns((prev) => {
        const next: Record<string, number> = {};
        Object.entries(prev).forEach(([role, seconds]) => {
          next[role] = seconds > 0 ? seconds - 1 : 0;
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdowns]);

  const approvalFor = useCallback(
    (role: LeaderRole) => approved.find((item) => item.role === role),
    [approved]
  );

  const sendOtp = async (role: LeaderRole) => {
    const number = numbers[role];

    if (number.length !== 10) {
      addToast({
        type: 'error',
        hi: hi?.login?.invalid_number,
        en: en?.login?.invalid_number,
      });
      return;
    }

    const duplicateOf = LEADERS.find(
      (leader) => leader.role !== role && numbers[leader.role] === number
    );

    if (duplicateOf) {
      addToast({
        type: 'error',
        hi: `यह नंबर पहले से ${duplicateOf.label_1} के लिए दर्ज है, हर पदाधिकारी का नंबर अलग होना चाहिए`,
        en: `This number is already used for ${duplicateOf.label_2}. Each leader needs a different mobile number`,
      });
      return;
    }

    try {
      setBusy(role);
      await sendLeaderOtp(number, role, level);

      setOtpSentTo((prev) => (prev.includes(role) ? prev : [...prev, role]));
      setCountdowns((prev) => ({ ...prev, [role]: RESEND_SECONDS }));
      addToast({
        type: 'success',
        hi: hi?.login?.otp_sent,
        en: en?.login?.otp_sent,
      });
    } catch (err) {
      addToast({
        type: 'error',
        hi: hi?.login?.invalid_number,
        en: err instanceof ApiError ? err.message : en?.login?.invalid_number,
      });
    } finally {
      setBusy(null);
    }
  };

  const verifyOtp = async (role: LeaderRole) => {
    const otp = otps[role] || '';

    try {
      setBusy(role);

      if (otp.length < 6) {
        throw new ApiError(en?.login?.invalid);
      }
      const res = await verifyLeaderOtp(
        numbers[role],
        otp,
        role,
        level,
        nominationName
      );

      onApproved({
        role,
        mobile_number: numbers[role],
        // the server stamps the time so a wrong device clock cannot
        verified_on: String(
          (res?.message as { verified_on?: string })?.verified_on || ''
        ),
      });

      addToast({
        type: 'success',
        hi: 'ओटीपी सफलतापूर्वक सत्यापित हुआ',
        en: 'OTP verified successfully',
      });
    } catch (err) {
      addToast({
        type: 'error',
        hi: hi?.login?.invalid,
        en: err instanceof ApiError ? err.message : en?.login?.invalid,
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <DualLanguageText
        h1={heading_1}
        h2={heading_2}
        h1style={{ fontSize: 16, fontWeight: 700 }}
        h2style={{ fontSize: 13, fontWeight: 600 }}
      />

      <DualLanguageText
        h1={hi?.form?.approval_rule}
        h2={en?.form?.approval_rule}
        boxStyle={{ mt: 0.5, mb: 2 }}
        h1style={{ fontSize: 12, fontWeight: 400, color: '#6B7280' }}
        h2style={{ fontSize: 12, fontWeight: 400, color: '#6B7280' }}
      />

      <Box display="flex" flexDirection="column" gap={2}>
        {LEADERS.map(({ role, label_1, label_2 }) => {
          const approval = approvalFor(role);
          const isApproved = !!approval;
          const otpSent = otpSentTo.includes(role);
          const secondsLeft = countdowns[role] ?? 0;
          const canResend = secondsLeft === 0 && busy !== role;

          return (
            <Box
              key={role}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${isApproved ? '#16A34A' : '#E5E7EB'}`,
                bgcolor: isApproved ? '#F0FDF4' : '#fff',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <DualLanguageText
                  h1={label_1}
                  h2={label_2}
                  boxStyle={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  h1style={{ fontSize: 14, fontWeight: 700 }}
                  h2style={{ pl: 1, fontSize: 13, color: '#6B7280' }}
                />

                {isApproved && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircleRoundedIcon
                      sx={{ fontSize: 16, color: '#16A34A' }}
                    />
                    <Typography sx={{ fontSize: 12, color: '#16A34A' }}>
                      {hi?.form?.otp_approved} ({en?.form?.otp_approved})
                    </Typography>
                  </Box>
                )}
              </Box>

              {isApproved ? (
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                    +91 {maskNumber(approval.mobile_number)}
                  </Typography>
                  {approval.verified_on && (
                    <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                      {hi?.form?.verified_on} ({en?.form?.verified_on}){' '}
                      {formatVerifiedOn(approval.verified_on)}
                    </Typography>
                  )}
                </Box>
              ) : otpSent ? (
                <Box>
                  <Typography sx={{ fontSize: 12, color: '#6B7280', mb: 1 }}>
                    {hi?.form?.otp_sent_to} / {en?.form?.otp_sent_to} +91{' '}
                    {maskNumber(numbers[role])}
                  </Typography>

                  <MuiOtpInput
                    value={otps[role] || ''}
                    onChange={(val) =>
                      setOtps((prev) => ({
                        ...prev,
                        [role]: val.replace(/\D/g, ''),
                      }))
                    }
                    length={6}
                    TextFieldsProps={() => ({
                      type: 'tel',
                      autoComplete: 'one-time-code',
                      inputProps: { inputMode: 'numeric', pattern: '[0-9]*' },
                    })}
                    sx={{
                      gap: 0.5,
                      mb: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#F9FAFB',
                      },
                      '& .MuiOutlinedInput-input': { fontSize: 15, py: 1.25 },
                    }}
                  />

                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mb: 1.5,
                      cursor: canResend ? 'pointer' : 'not-allowed',
                    }}
                    onClick={() => canResend && sendOtp(role)}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: canResend ? 700 : 400,
                        color: canResend ? '#000' : '#9CA3AF',
                      }}
                    >
                      {hi?.login?.resend} ({en?.login?.resend})
                    </Typography>
                    {secondsLeft > 0 && (
                      <Typography
                        sx={{ ml: 1, fontSize: 13, color: '#9CA3AF' }}
                      >
                        {secondsLeft}s
                      </Typography>
                    )}
                  </Box>
                </Box>
              ) : (
                <TextField
                  fullWidth
                  value={numbers[role]}
                  placeholder="0123456789"
                  variant="outlined"
                  type="tel"
                  sx={{
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#E5E7EB',
                    },
                    '& .MuiOutlinedInput-input': { fontSize: 15, py: 1.5 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontSize: 15 }}>+91</Typography>
                      </InputAdornment>
                    ),
                  }}
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    maxLength: 10,
                  }}
                  onChange={(e) =>
                    onNumberChange(role, e.target.value.replace(/\D/g, ''))
                  }
                />
              )}

              {!isApproved && (
                <Button
                  fullWidth
                  variant="contained"
                  disabled={busy === role}
                  onClick={() => (otpSent ? verifyOtp(role) : sendOtp(role))}
                  sx={{
                    py: 1.25,
                    borderRadius: 2,
                    bgcolor: '#000',
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#111' },
                  }}
                >
                  <Box textAlign="center">
                    <DualLanguageText
                      h1={otpSent ? hi?.form?.approved : hi?.form?.send_otp}
                      h2={otpSent ? en?.form?.approved : en?.form?.send_otp}
                      h1style={{
                        fontWeight: 600,
                        textAlign: 'center',
                        fontSize: 14,
                      }}
                      h2style={{
                        fontWeight: 400,
                        fontSize: 12,
                        textAlign: 'center',
                      }}
                    />
                  </Box>
                </Button>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default ShgLeaderApproval;
