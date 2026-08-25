'use client';

import { useRef } from 'react';
import { Box, Button, ButtonBase } from '@mui/material';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import AutorenewRoundedIcon from '@mui/icons-material/Autorenew';

import DualLanguageText from '@/components/DualLanguageText';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';

type PhotoCaptureProps = {
  label_1: string;
  label_2: string;
  required?: boolean;
  value?: string;
  onChange: (base64: string) => void;
};

function PhotoCapture({
  label_1,
  label_2,
  required,
  value,
  onChange,
}: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const openCamera = () => {
    inputRef.current?.click();
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ''));
    reader.readAsDataURL(file);

    // allow re-selecting the same file again
    e.target.value = '';
  };

  return (
    <Box>
      <DualLanguageText
        h1={label_1}
        boxStyle={{ ml: 0.5 }}
        h2={label_2}
        h1style={{ fontSize: 13, fontWeight: 500 }}
        h2style={{ mb: 0.5, fontWeight: 550, fontSize: 13 }}
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        required={required}
        onChange={handleFile}
      />

      {value ? (
        <Box
          sx={{
            width: '100%',
            minHeight: 160,
            borderRadius: '12px',
            border: '1px dashed #9CA3AF',
            bgcolor: '#FFF',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <Box
            component="img"
            src={value}
            alt="captured photo"
            sx={{
              display: 'block',
              width: '100%',
              height: 160,
              objectFit: 'cover',
            }}
          />

          <Button
            onClick={openCamera}
            size="small"
            startIcon={<AutorenewRoundedIcon sx={{ fontSize: 16 }} />}
            sx={{
              position: 'absolute',
              left: '50%',
              bottom: 12,
              transform: 'translateX(-50%)',
              px: 1.25,
              borderRadius: '999px',
              bgcolor: '#F3F4F6',
              color: '#111',
              textTransform: 'none',
              '&:hover': { bgcolor: '#E5E7EB' },
            }}
          >
            <DualLanguageText
              h1={hi?.form?.reupload}
              h2={en?.form?.reupload}
              h1style={{ fontSize: 11, fontWeight: 600 }}
              h2style={{ fontSize: 10, fontWeight: 400 }}
            />
          </Button>
        </Box>
      ) : (
        <ButtonBase
          onClick={openCamera}
          aria-label="open camera"
          sx={{
            width: '100%',
            minHeight: 160,
            p: 2,
            borderRadius: '12px',
            border: '1px dashed #9CA3AF',
            bgcolor: '#FFF',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textTransform: 'none',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              mb: 1.5,
              borderRadius: '50%',
              bgcolor: '#111',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CameraAltOutlinedIcon sx={{ fontSize: 24 }} />
          </Box>

          <DualLanguageText
            h1={hi?.form?.tap_live_photo}
            h2={en?.form?.tap_live_photo}
            boxStyle={{ alignItems: 'center' }}
            h1style={{ fontSize: 14, fontWeight: 600 }}
            h2style={{ fontSize: 12, fontWeight: 400, color: '#6B7280' }}
          />
        </ButtonBase>
      )}
    </Box>
  );
}

export default PhotoCapture;
