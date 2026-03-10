'use client';

import { Box, Checkbox } from '@mui/material';
import Title1 from '@/components/Titel1';

type Option = {
  label_1: string;
  label_2: string;
  value: string;
};

type Props = {
  label_1: string;
  label_2: string;
  options: Option[];
  value?: string[];
  onChange?: (val: string[]) => void;
};

function CheckBoxMultiSelect({
  label_1,
  label_2,
  options,
  value = [],
  onChange,
}: Props) {
  const toggleValue = (val: string) => {
    let newValue: string[] = [];

    if (val === 'none') {
      newValue = value.includes('none') ? [] : ['none'];
    } else {
      const cleaned = value.filter((v) => v !== 'none');

      if (cleaned.includes(val)) {
        newValue = cleaned.filter((v) => v !== val);
      } else {
        newValue = [...cleaned, val];
      }
    }

    onChange?.(newValue);
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Title1
        h1={label_1}
        h2={label_2}
        boxStyle={{ ml: 0.5 }}
        h1style={{ fontSize: 13, fontWeight: 500 }}
        h2style={{ mb: 1, fontWeight: 600, fontSize: 13 }}
      />

      <Box display="flex" flexDirection="column" gap={1}>
        {options.map((opt) => {
          const checked = value.includes(opt.value);

          return (
            <Box
              key={opt.value}
              onClick={() => toggleValue(opt.value)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                border: '1px solid #E5E7EB',
                backgroundColor: checked ? '#E5E7EB' : '#fff',
                transition: '0.2s',
              }}
            >
              <Checkbox
                checked={checked}
                sx={{
                  p: 0,
                  mr: 1,
                  '&.Mui-checked': {
                    color: '#000',
                  },
                }}
              />

              <Title1
                h1={opt.label_1}
                h2={`(${opt.label_2})`}
                boxStyle={{ display: 'flex', flexDirection: 'row' }}
                h1style={{ fontSize: 13, fontWeight: 600 }}
                h2style={{ pl: 1, fontSize: 13 }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default CheckBoxMultiSelect;
