'use client';

import {
  Box,
  TextField,
  TextFieldProps,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

import Title1 from '@/components/Titel1';

type TextValue = {
  label_1: string;
  label_2: string;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  validate?: boolean;
  validated?: boolean;
  required?: boolean;
  onValidateClick?: () => void;
} & TextFieldProps;

function Text({
  label_1,
  label_2,
  placeholder,
  multiline = false,
  rows,
  type,
  validate = false,
  validated = false,
  required,
  onValidateClick,

  ...rest
}: TextValue) {
  const iconColor = validated ? '#16A34A' : '#9CA3AF';
  const Icon = validated ? CheckCircleIcon : ErrorIcon;
  const tooltipText = validated ? 'Validated' : 'Not validated';

  return (
    <Box>
      <Title1
        h1={label_1}
        boxStyle={{ ml: 0.5 }}
        h2={label_2}
        h1style={{ fontSize: 13, fontWeight: 500 }}
        h2style={{ mb: 0.5, fontWeight: 550, fontSize: 13 }}
      />

      <TextField
        fullWidth
        placeholder={placeholder}
        variant="outlined"
        required={required}
        multiline={multiline}
        type={type}
        rows={rows}
        {...rest}
        InputProps={{
          ...(rest.InputProps || {}),
          endAdornment: (
            <>
              {rest.InputProps?.endAdornment}
              {validate && (
                <InputAdornment position="end">
                  <Tooltip title={tooltipText}>
                    <IconButton
                      size="small"
                      onClick={onValidateClick}
                      disabled={!onValidateClick}
                      edge="end"
                      aria-label="validate"
                      sx={{
                        p: 0.5,
                        color: iconColor,
                      }}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )}
            </>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '& fieldset': { borderColor: '#9CA3AF' },
            '&:hover fieldset': { borderColor: '#9CA3AF' },
            '&.Mui-focused fieldset': { borderColor: '#9CA3AF' },
            '& input::placeholder, & textarea::placeholder': {
              color: '#9CA3AF',
              opacity: 1,
              fontSize: '12px',
              fontWeight: 400,
            },
          },
        }}
      />
    </Box>
  );
}

export default Text;
