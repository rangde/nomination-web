'use client';

import { Box, Typography, TextField, Button, Paper } from '@mui/material';

import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import { useState, useEffect } from 'react';
import { getNumberChecked, verifyOtpApi as verify_otp } from '@/services/api';
import Cookies from 'js-cookie';
import { MuiOtpInput } from 'mui-one-time-password-input';
import Title1 from '@/components/Titel1';
import { addToast } from '@/components/error/toastStore';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';
import { redirect } from 'next/navigation';
import InstallPwaDialog from '@/components/pwa/InstallPwaDialog';

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showInstallDialog, setShowInstallDialog] = useState(false);
  const [canPromptInstall, setCanPromptInstall] = useState(false);

  const [mobile, setMobile] = useState('');
  const [fillOtp, setFillOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [resend, SetResend] = useState(false);
  const [seconds, setSeconds] = useState(60);
  const [canResend, setCanResend] = useState(false);

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

  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!isAndroid) return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    const onBip = (e: Event) => {
      setCanPromptInstall(true);
      setShowInstallDialog(true);
    };

    window.addEventListener('beforeinstallprompt', onBip);
    const t = window.setTimeout(() => {
      setShowInstallDialog(true);
    }, 800);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBip);
      window.clearTimeout(t);
    };
  }, []);

  const resendOtp = () => {
    if (!canResend) return;
    setCanResend(false);
    setFillOtp(true);
    setSeconds(60);
    validteAndSendOtp();
  };

  const handleRequestOTP = async () => {
    setLoading(true);
    if (fillOtp) {
      if (otp.length >= 6 && (await verifyOtp(mobile, otp))) {
        addToast({
          type: 'success',
          hi: hi?.login?.login_success,
          en: en?.login?.login_success,
        });
        Cookies.set('mobile', mobile, {
          expires: 7,
          sameSite: 'strict',
        });
        redirect('/dashboard');
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
    setLoading(false);
  };

  const numberChecked = async (number: string) => {
    const result = await getNumberChecked(number);
    if (result?.message) {
      return result?.message?.status ? true : false;
    } else {
      return false;
    }
  };

  const verifyOtp = async (number: string, otp: string) => {
    const result = await verify_otp(number, otp);
    if (result?.message) {
      return result?.message?.status ? true : false;
    } else {
      return false;
    }
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
        minHeight: '100vh',
        backgroundColor: '#F3F4F6',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        p: 2,
      }}
    >
      <Box
        sx={{
          minHeight: '100vh',
          maxWidth: 420,
          backgroundColor: 'transparent',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 420,
            borderRadius: 4,
            p: 3,
            backgroundColor: 'transparent',
            boxShadow: {
              xs: 'none',
              md: 6,
            },
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              backgroundColor: '#E5E7EB',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <AccountBalanceIcon sx={{ fontSize: 32 }} />
          </Box>

          <Title1
            h1={hi.login.title}
            h2={en.login.title}
            h1style={{ fontSize: 20, fontWeight: 700 }}
            h2style={{ fontWeight: 500, mb: 2, fontSize: 14 }}
          />

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
                    <Typography sx={{ ml: 1, fontSize: 13, color: '#9CA3AF' }}>
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

          <Button
            fullWidth
            variant="contained"
            disabled={loading}
            onClick={handleRequestOTP}
            sx={{
              backgroundColor: '#000',
              borderRadius: 3,
              mt: 1,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: '0px 6px 10px rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: '#111',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#fff' }} />
            ) : (
              <Box textAlign="center">
                <Title1
                  h1={fillOtp ? hi.login.login : hi.login.otp}
                  h2={fillOtp ? en.login.login : en.login.otp}
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
            )}
          </Button>
        </Paper>
      </Box>
      <InstallPwaDialog
        open={showInstallDialog}
        onClose={() => setShowInstallDialog(false)}
      />
    </Box>
  );
}

export default LoginPage;
