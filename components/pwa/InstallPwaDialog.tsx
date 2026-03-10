'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import Title1 from '@/components/Titel1';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

const isAndroid = (): boolean =>
  typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

const isIOS = (): boolean =>
  typeof navigator !== 'undefined' &&
  /iPhone|iPad|iPod/i.test(navigator.userAgent);

const isStandalone = (): boolean => {
  if (typeof window === 'undefined') return false;

  const displayModeStandalone = window.matchMedia(
    '(display-mode: standalone)'
  ).matches;

  const iosStandalone =
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
    true;

  return displayModeStandalone || iosStandalone;
};

export default function InstallPwaDialog({ open, onClose }: Props) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const installed = useMemo(() => isStandalone(), []);

  useEffect(() => {
    if (installed && open) {
      onClose();
      return;
    }

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      onClose();
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, [installed, open, onClose]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    setDeferredPrompt(null);

    if (choice.outcome === 'accepted') {
      onClose();
    }
  };

  const showAndroidInstallButton =
    isAndroid() && Boolean(deferredPrompt) && !installed;
  const showAndroidManual = isAndroid() && !installed && !deferredPrompt;
  const showIOSManual = isIOS() && !installed;

  return (
    <Dialog
      open={open && !installed}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: '#F3F4F6',
        },
      }}
    >
      <DialogContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Title1
            h1="ऐप इंस्टॉल करें"
            h2="(Install the app)"
            h1style={{ fontSize: 16, fontWeight: 700, color: '#000' }}
            h2style={{ fontSize: 12, color: '#6B7280' }}
          />

          <IconButton onClick={onClose} sx={{ mt: -0.5 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Title1
            h1="बेहतर अनुभव के लिए इस ऐप को अपने फोन में इंस्टॉल करें।"
            h2="(Install this app on your phone for a better experience.)"
            h1style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}
            h2style={{ fontSize: 12, color: '#6B7280' }}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        {installed ? (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              backgroundColor: '#E5E7EB',
              p: 1.5,
              borderRadius: 2,
            }}
          >
            <InfoOutlinedIcon sx={{ color: '#111827' }} />
            <Title1
              h1="ऐप पहले से इंस्टॉल है"
              h2="(App is already installed)"
              boxStyle={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              h1style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}
              h2style={{
                pl: 1,
                fontSize: 13,
                fontWeight: 500,
                color: '#374151',
              }}
            />
          </Box>
        ) : (
          <>
            {showAndroidInstallButton && (
              <Button
                fullWidth
                onClick={handleInstall}
                startIcon={<DownloadIcon />}
                sx={{
                  mt: 0.5,
                  bgcolor: '#000',
                  color: '#fff',
                  borderRadius: 2,
                  py: 1.1,
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#111' },
                }}
              >
                <Title1
                  h1="इंस्टॉल करें"
                  h2="(Install)"
                  boxStyle={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  h1style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}
                  h2style={{
                    pl: 1,
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#E5E7EB',
                  }}
                />
              </Button>
            )}

            {showAndroidManual && (
              <Box
                sx={{
                  backgroundColor: '#E5E7EB',
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Title1
                    h1="मैनुअल इंस्टॉल स्टेप्स"
                    h2="(Manual install steps)"
                    boxStyle={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    h1style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#111827',
                    }}
                    h2style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#374151',
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    mt: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Title1
                    h1="1) Chrome में ⋮ (तीन डॉट) दबाएँ"
                    h2="(In Chrome, tap ⋮ (three dots))"
                    h1style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                    h2style={{ pl: 1.7, fontSize: 12, color: '#4B5563' }}
                  />

                  <Title1
                    h1="2) “Add to Home screen” चुनें"
                    h2="(Select “Add to Home screen”)"
                    h1style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                    h2style={{ pl: 1.7, fontSize: 12, color: '#4B5563' }}
                  />

                  <Title1
                    h1="3) “Add / Install” दबाएँ"
                    h2="(Tap “Add / Install”)"
                    h1style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                    h2style={{ pl: 1.7, fontSize: 12, color: '#4B5563' }}
                  />
                </Box>
              </Box>
            )}

            {showIOSManual && (
              <Box
                sx={{
                  backgroundColor: '#E5E7EB',
                  p: 2,
                  borderRadius: 2,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Title1
                    h1="iPhone / iPad इंस्टॉल स्टेप्स"
                    h2="(iOS install steps)"
                    boxStyle={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    h1style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#111827',
                    }}
                    h2style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: '#374151',
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    mt: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Title1
                    h1="1) Safari में Share (⬆️) दबाएँ"
                    h2="(In Safari, tap Share (⬆️))"
                    h1style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                    h2style={{ pl: 1.7, fontSize: 12, color: '#4B5563' }}
                  />

                  <Title1
                    h1="2) “Add to Home Screen” चुनें"
                    h2="(Select “Add to Home Screen”)"
                    h1style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                    h2style={{ pl: 1.7, fontSize: 12, color: '#4B5563' }}
                  />

                  <Title1
                    h1="3) “Add” दबाएँ"
                    h2="(Tap “Add”)"
                    h1style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#111827',
                    }}
                    h2style={{ pl: 1.7, fontSize: 12, color: '#4B5563' }}
                  />
                </Box>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
