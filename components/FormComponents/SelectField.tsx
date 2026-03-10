'use client';

import {
  Box,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import Title1 from '@/components/Titel1';

type Option = {
  label_1: string;
  label_2?: string;
  value: string;
};

type Props = {
  label_1: string;
  label_2: string;
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange?: (val: string) => void;
  view?: boolean; // Add view prop
};

function SelectField({
  label_1,
  label_2,
  placeholder = 'Select',
  options,
  value = '',
  onChange,
  view = false,
}: Props) {
  const handleChange = (event: SelectChangeEvent) => {
    onChange?.(event.target.value);
  };

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Box sx={{ mt: 1 }}>
      <Title1
        h1={label_1}
        h2={label_2}
        boxStyle={{ ml: 0.5 }}
        h1style={{ fontSize: 13, fontWeight: 500 }}
        h2style={{ mb: 1, fontWeight: 550, fontSize: 13 }}
      />

      {view ? (
        <Box
          sx={{
            p: 1.5,
            px: 2,
            borderRadius: '8px',
            border: '1px solid #9CA3AF',
            backgroundColor: '#F9FAFB',
            minHeight: '40px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 13, color: value ? '#000' : '#9CA3AF' }}>
            {selectedOption
              ? `${selectedOption.label_1}${
                  selectedOption.label_2?.trim()
                    ? ` (${selectedOption.label_2})`
                    : ''
                }`
              : placeholder}
          </Typography>
        </Box>
      ) : (
        <FormControl fullWidth>
          <Select
            value={value}
            onChange={handleChange}
            displayEmpty
            sx={{
              borderRadius: '8px',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9CA3AF',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9CA3AF',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#9CA3AF',
              },
              '& .MuiSelect-select': {
                fontSize: 13,
                color: value ? '#000' : '#9CA3AF',
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  borderRadius: 2,
                },
              },
            }}
          >
            <MenuItem disabled value="">
              {placeholder}
            </MenuItem>

            {options.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{
                  fontSize: 13,
                  '&.Mui-selected': {
                    backgroundColor: '#BFD7E0 !important',
                  },
                }}
              >
                {option.label_1}{' '}
                {option.label_2?.trim() ? `(${option.label_2})` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
}

export default SelectField;
