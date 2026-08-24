'use client';

import { useEffect, useState } from 'react';
import { Autocomplete, Box, CircularProgress, TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import DualLanguageText from '@/components/DualLanguageText';
import {
  OrganizationSearchResult,
  OrganizationType,
  searchOrganizations,
} from '@/services/api';

type Props = {
  label_1: string;
  label_2: string;
  name: string;
  organizationType: OrganizationType;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
};

function OrganizationSearch({
  label_1,
  label_2,
  name,
  organizationType,
  value,
  onChange,
  required,
}: Props) {
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<OrganizationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const searchText = inputValue.trim();
    const controller = new AbortController();

    if (searchText.length < 2) {
      setOptions([]);
      setLoading(false);
      return () => controller.abort();
    }

    setLoading(true);
    const timeout = window.setTimeout(() => {
      searchOrganizations(organizationType, searchText)
        .then((response) => {
          if (controller.signal.aborted) return;
          setOptions(response.message.status ? response.message.msg : []);
        })
        .catch(() => {
          if (!controller.signal.aborted) setOptions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [inputValue, organizationType]);

  return (
    <Box>
      <DualLanguageText
        h1={label_1}
        boxStyle={{ ml: 0.5 }}
        h2={label_2}
        h1style={{ fontSize: 13, fontWeight: 500 }}
        h2style={{ mb: 0.5, fontWeight: 550, fontSize: 13 }}
      />

      <Autocomplete
        freeSolo
        options={options}
        inputValue={inputValue}
        open={open && options.length > 0}
        loading={loading}
        forcePopupIcon={false}
        filterOptions={(items) => items}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.organisation_name
        }
        isOptionEqualToValue={(option, selected) =>
          option.name === selected.name
        }
        onInputChange={(_, newInputValue, reason) => {
          setInputValue(newInputValue);
          onChange(name, newInputValue);
          setOpen(reason === 'input' && newInputValue.trim().length >= 2);
        }}
        onChange={(_, selected) => {
          const selectedName =
            typeof selected === 'string'
              ? selected
              : selected?.organisation_name || '';
          setInputValue(selectedName);
          onChange(name, selectedName);
          setOpen(false);
        }}
        onBlur={() => setOpen(false)}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth
            required={required}
            placeholder="Search organization name"
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchIcon sx={{ mr: 1, color: '#6B7280' }} />,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '& fieldset': { borderColor: '#9CA3AF' },
                '&:hover fieldset': { borderColor: '#9CA3AF' },
                '&.Mui-focused fieldset': { borderColor: '#9CA3AF' },
                '& input::placeholder': {
                  color: '#9CA3AF',
                  opacity: 1,
                  fontSize: '12px',
                  fontWeight: 400,
                },
              },
            }}
          />
        )}
      />
    </Box>
  );
}

export default OrganizationSearch;
