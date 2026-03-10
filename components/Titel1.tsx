'use client';

import { Box, Typography, SxProps, Theme } from '@mui/material';

type Title1Props = {
  h1: string;
  h2?: string;
  h3?: string;
  boxStyle?: SxProps<Theme>;
  h1style?: SxProps<Theme>;
  h2style?: SxProps<Theme>;
  h3style?: SxProps<Theme>;
};

function Title1({
  h1,
  h2,
  h3,
  boxStyle,
  h1style,
  h2style,
  h3style,
}: Title1Props) {
  return (
    <Box
      component="span"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        ...boxStyle,
      }}
    >
      <Typography component="span" fontWeight={600} sx={h1style}>
        {h1}
      </Typography>

      {h2 && (
        <Typography
          component="span"
          fontWeight={400}
          fontSize="small"
          sx={h2style}
        >
          {h2}
        </Typography>
      )}

      {h3 && (
        <Typography component="span" fontWeight={600} sx={h3style}>
          {h3}
        </Typography>
      )}
    </Box>
  );
}

export default Title1;
