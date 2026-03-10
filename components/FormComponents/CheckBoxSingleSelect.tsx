'use client';

import { Box, Typography } from '@mui/material';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
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
  value?: string;
  onChange?: (val: string) => void;
};

function CheckBoxSingleSelect({
  label_1,
  label_2,
  options,
  value,
  onChange,
}: Props) {
  return (
    <Box>
      <Title1
        h1={label_1}
        h2={label_2}
        boxStyle={{ ml: 0.5 }}
        h1style={{ fontSize: 13, fontWeight: 500 }}
        h2style={{ mb: 1, fontWeight: 550, fontSize: 13 }}
      />
      <Box display="flex" flexDirection="column" gap={2} sx={{ ml: 2 }}>
        {options.map((opt) => {
          const selected = value === opt.value;

          return (
            <Box
              key={opt.value}
              onClick={() => onChange?.(opt.value)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
              }}
            >
              {selected ? (
                <RadioButtonCheckedIcon sx={{ fontSize: 13 }} />
              ) : (
                <RadioButtonUncheckedIcon sx={{ fontSize: 13 }} />
              )}

              <Title1
                h1={`${opt.label_1}`}
                h2={`(${opt.label_2})`}
                boxStyle={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                h1style={{
                  fontSize: 13,
                }}
                h2style={{
                  pl: 1,
                  fontSize: 13,
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default CheckBoxSingleSelect;
