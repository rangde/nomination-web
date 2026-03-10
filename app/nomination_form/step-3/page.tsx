'use client';

import { Box, Typography, Button, TextField, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { useState, useEffect, useMemo } from 'react';
import Title1 from '@/components/Titel1';
import InputAdornment from '@mui/material/InputAdornment';
import hi from '@/messages/hi.json';
import { addToast } from '@/components/error/toastStore';
import en from '@/messages/en.json';
import AppHeader from '@/components/header/Appheader';
import NominationStepper from '@/components/nomination/NominationStepper';
import ImportantNote from '@/components/nomination/ImportantNote';
import CreditScoreGauge from '@/components/nomination/CreditScoreGauge';
import SelectField from '@/components/FormComponents/SelectField';
import { useNominationForm } from '../NominationFormProvider';
import {
  getNumberChecked,
  verifyOtpApi as verify_otp,
  getCreditScoree,
} from '@/services/api';

function NominationStepOne() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [fillOtp, setFillOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [resend, SetResend] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showCredit, setShowCredit] = useState(false);
  const [score, setScore] = useState(800);

  const { form, setStep3, submitForm } = useNominationForm();
  const { set_credit_limit, mobile_number, credit_score } = form.step3;
  const {
    first_name,
    last_name,
    pincode,
    district,
    pan_number,
    date_of_birth,
  } = form.step1;
  const verifyOtp = async (number: string, otp: string) => {
    const result = await verify_otp(number, otp, true);
    if (result?.message) {
      return result?.message?.status ? true : false;
    } else {
      return false;
    }
  };

  const resendOtp = () => {
    if (!canResend) return;
    setCanResend(false);
    setFillOtp(true);
    setSeconds(60);
    validteAndSendOtp();
  };

  const remark = useMemo(() => {
    if (score < 681) {
      return {
        l1: hi?.credit_score?.needs_help,
        l2: en?.credit_score?.needs_help
          ? `(${en?.credit_score?.needs_help})`
          : '',
      };
    } else if (score <= 730) {
      return {
        l1: hi?.credit_score?.average,
        l2: en?.credit_score?.average ? `(${en?.credit_score?.average})` : '',
      };
    } else if (score <= 770) {
      return {
        l1: hi?.credit_score?.fair,
        l2: en?.credit_score?.fair ? `(${en?.credit_score?.fair})` : '',
      };
    } else if (score <= 790) {
      return {
        l1: hi?.credit_score?.good,
        l2: en?.credit_score?.good ? `(${en?.credit_score?.good})` : '',
      };
    } else {
      return {
        l1: hi?.credit_score?.excellent,
        l2: en?.credit_score?.excellent
          ? `(${en?.credit_score?.excellent})`
          : '',
      };
    }
  }, [score, hi, en]);
  useEffect(() => {
    if (!fillOtp) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resend]);
  const handleRequestOTP = async () => {
    if (showCredit) {
      const okRequired = validateRequired();
      if (!okRequired) return;

      const res = await submitForm();

      if (!res.ok) {
        addToast({
          type: 'error',
          hi: 'फॉर्म सबमिट नहीं हुआ',
          en: `Submit failed: ${res.error}`,
        });
        return;
      }

      router.push(
        `/nomination_form/view_status?name=${encodeURIComponent(res?.name)}`
      );
    } else if (fillOtp) {
      if (fillOtp) {
        if (otp.length >= 6 && (await verifyOtp(mobile, otp))) {
          addToast({
            type: 'success',
            hi: 'ओटीपी सफलतापूर्वक सत्यापित हुआ',
            en: 'OTP verified successfully',
          });

          try {
            const res = await getCreditScoree({
              first_name: form.step1.first_name,
              last_name: form.step1.last_name,
              dob: form.step1.date_of_birth,
              pan_number: form.step1.pan_number,
              mobile_number: mobile,
              pincode: form.step1.pincode,
            });

            if (res?.message?.status === 1) {
              const score = Number(res.message.msg);
              setScore(Number.isFinite(score) ? score : 0);
              setStep3({ mobile_number: mobile });
              setStep3({ credit_score: score.toString() });
              addToast({
                type: 'success',
                hi: 'क्रेडिट स्कोर प्राप्त हुआ',
                en: 'Credit score fetched successfully',
              });
            } else {
              addToast({
                type: 'error',
                hi: 'क्रेडिट स्कोर प्राप्त नहीं हुआ',
                en:
                  typeof res?.message?.msg === 'string'
                    ? res.message.msg
                    : 'Failed to fetch credit score',
              });

              setScore(0);
            }
          } catch (err) {
            console.error(err);
            addToast({
              type: 'error',
              hi: 'क्रेडिट स्कोर त्रुटि',
              en: 'Credit score error',
            });
            setScore(0);
          }

          setShowCredit(true);
        } else {
          addToast({
            type: 'error',
            hi: hi?.login?.invalid,
            en: en?.login?.invalid,
          });
        }
      } else {
        validteAndSendOtp();
      }
    } else {
      validteAndSendOtp();
    }
  };

  const numberChecked = async (number: string) => {
    const result = await getNumberChecked(number, true);
    if (result?.message) {
      return result?.message?.status ? true : false;
    } else {
      return false;
    }
  };

  const validateRequired = (): boolean => {
    if (!set_credit_limit) {
      addToast({
        type: 'error',
        hi: 'कृपया क्रेडिट लिमिट चुनें',
        en: 'Please select credit limit',
      });
      return false;
    }
    return true;
  };

  const validteAndSendOtp = async () => {
    if (mobile.length > 10) {
      addToast({
        type: 'error',
        hi: hi?.login?.enter_number,
        en: en?.login?.enter_number,
      });
    } else if (await numberChecked(mobile)) {
      addToast({
        type: 'success',
        hi: hi?.login?.otp_sent,
        en: en?.login?.otp_sent,
      });
      setFillOtp(true);
      setCanResend(false);
      SetResend(!resend);
    } else {
      addToast({
        type: 'error',
        hi: hi?.login?.invalid_number,
        en: en?.login?.invalid_number,
      });
    }
  };
  const mobilbumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, '');
    setMobile(numbersOnly);
  };

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
        onBack={() => router.push('/nomination_form/step-2')}
        h1={hi?.form?.nomi_form}
        h2={en?.form?.nomi_form}
      />
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 2,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
          }}
        >
          <NominationStepper activeStep={2} />

          <Title1
            h1={hi?.form?.check_credit}
            h2={en?.form?.check_credit}
            h1style={{ fontSize: 18, fontWeight: 700 }}
            h2style={{ mb: 2, fontSize: 14 }}
          />
          <Box>
            {showCredit ? (
              <Box>
                <CreditScoreGauge score={score} label={remark} />
                <Box sx={{ mt: 2 }}>
                  <SelectField
                    label_1={hi?.credit_score?.set_credit_limit}
                    label_2={en?.credit_score?.set_credit_limit}
                    placeholder="Set Credit Limit"
                    value={set_credit_limit}
                    onChange={(val) => setStep3({ set_credit_limit: val })}
                    options={[
                      {
                        label_1: '50000',
                        value: '50000',
                      },
                      {
                        label_1: '100000',
                        value: '100000',
                      },
                      {
                        label_1: '150000',
                        value: '150000',
                      },
                      {
                        label_1: '200000',
                        value: '200000',
                      },
                      {
                        label_1: '250000',
                        value: '250000',
                      },
                      {
                        label_1: '300000',
                        value: '300000',
                      },
                    ]}
                  />
                </Box>
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap={2}>
                <Box sx={{ mt: 2 }}>
                  {fillOtp ? (
                    <Box>
                      <MuiOtpInput
                        value={otp}
                        onChange={(val) => setOtp(val.replace(/\D/g, ''))}
                        length={6}
                        autoFocus
                        sx={{
                          gap: 1,
                          mb: 2,
                          py: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: '#F9FAFB',
                          },
                          '& .MuiOutlinedInput-input': {
                            fontSize: 16,
                            py: 1.5,
                          },
                        }}
                      />
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                        onClick={resendOtp}
                      >
                        <Title1
                          h1={`${hi.login.resend}`}
                          h2={`(${en.login.resend})`}
                          boxStyle={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: canResend ? 'pointer' : 'not-allowed',
                          }}
                          h1style={{
                            fontSize: 13,
                            fontWeight: canResend ? 700 : 400,
                            color: canResend ? '#000' : '#9CA3AF',
                          }}
                          h2style={{
                            pl: 1,
                            fontSize: 13,
                            fontWeight: canResend ? 600 : 400,
                            color: canResend ? '#000' : '#9CA3AF',
                          }}
                        />

                        {!canResend && (
                          <Typography
                            sx={{ ml: 1, fontSize: 13, color: '#9CA3AF' }}
                          >
                            {seconds}s
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Title1
                        h1={hi.login.mobile}
                        h2={en.login.mobile}
                        h1style={{ fontSize: 18, fontWeight: 600 }}
                        h2style={{ fontWeight: 300, mb: 2, fontSize: 14 }}
                      />
                      <TextField
                        fullWidth
                        placeholder="0123456789"
                        variant="outlined"
                        sx={{
                          mb: 3,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 3,
                            backgroundColor: '#F9FAFB',
                          },
                          '& .MuiOutlinedInput-input': {
                            fontSize: 15,
                            py: 1.5,
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography sx={{ fontSize: 15 }}>+91</Typography>
                            </InputAdornment>
                          ),
                        }}
                        onChange={(e) => mobilbumber(e.target.value)}
                      />
                    </Box>
                  )}
                </Box>

                <ImportantNote
                  h1={hi.form.important_credit_check}
                  h2={en.form.important_credit_check}
                  desc_1={hi.form.final_review_credit_check}
                  desc_2={en.form.final_review_credit_check}
                />
              </Box>
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              bgcolor: '#000',
              textTransform: 'none',
              '&:hover': { bgcolor: '#111' },
            }}
            onClick={handleRequestOTP}
          >
            <Box textAlign="center">
              <Title1
                h1={
                  showCredit
                    ? hi?.form?.submit_credit
                    : fillOtp
                      ? hi.form.submit
                      : hi.login.otp
                }
                h2={
                  showCredit
                    ? en?.form?.submit_credit
                    : fillOtp
                      ? en.form.submit
                      : en.login.otp
                }
                h1style={{
                  fontWeight: 600,
                  textAlign: 'center',
                  fontSize: 15,
                }}
                h2style={{
                  fontWeight: 400,
                  fontSize: 12,
                  textAlign: 'center',
                }}
              />
            </Box>
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

export default NominationStepOne;
