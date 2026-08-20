'use client';

import { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { MuiOtpInput } from 'mui-one-time-password-input';

import DualLanguageText from '@/components/DualLanguageText';
import { addToast } from '@/components/error/toastStore';
import { ApiError, sendLeaderOtp, verifyLeaderOtp } from '@/services/api';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';

export type LeaderRole = 'president' | 'secretary' | 'treasurer';

const LEADERS: { role: LeaderRole; label_1: string; label_2: string }[] = [
  { role: 'president', label_1: hi.form.president, label_2: en.form.president },
  { role: 'secretary', label_1: hi.form.secretary, label_2: en.form.secretary },
  { role: 'treasurer', label_1: hi.form.treasurer, label_2: en.form.treasurer },
];

type Props = {
  numbers: Record<LeaderRole, string>;
  approved: string[];
  onNumberChange: (role: LeaderRole, value: string) => void;
  onApproved: (role: LeaderRole) => void;
};

function ShgLeaderApproval({
  numbers,
  approved,
  onNumberChange,
  onApproved,
}: Props) {
  const [otpSentTo, setOtpSentTo] = useState<LeaderRole[]>([]);
  const [otps, setOtps] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<LeaderRole | null>(null);

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
      await sendLeaderOtp(number, role);

      setOtpSentTo((prev) => (prev.includes(role) ? prev : [...prev, role]));
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
      await verifyLeaderOtp(numbers[role], otp, role);

      onApproved(role);
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
        h1={hi?.form?.shg_leader_approval}
        h2={en?.form?.shg_leader_approval}
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
          const isApproved = approved.includes(role);
          const otpSent = otpSentTo.includes(role);

          return (
            <Box
              key={role}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid #E5E7EB',
                bgcolor: '#fff',
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

              <TextField
                fullWidth
                value={numbers[role]}
                placeholder="0123456789"
                variant="outlined"
                type="tel"
                disabled={isApproved}
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

              {otpSent && !isApproved && (
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
                    mb: 1.5,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#F9FAFB',
                    },
                    '& .MuiOutlinedInput-input': { fontSize: 15, py: 1.25 },
                  }}
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
                      h1={otpSent ? hi?.form?.verify_otp : hi?.form?.send_otp}
                      h2={otpSent ? en?.form?.verify_otp : en?.form?.send_otp}
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
