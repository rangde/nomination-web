'use client';

import { Stepper, Step, StepLabel } from '@mui/material';

type Props = {
  activeStep: number;
};

export default function NominationStepper({ activeStep }: Props) {
  return (
    <Stepper
      activeStep={activeStep}
      alternativeLabel
      sx={{
        mb: 3,
        '& .MuiStepIcon-root': {
          color: '#a4a7ab',
        },

        '& .MuiStepIcon-root.Mui-active': {
          color: '#000',
        },

        '& .MuiStepIcon-root.Mui-completed': {
          color: '#000',
        },

        '& .MuiStepConnector-line': {
          borderColor: '#a4a7ab',
        },

        '& .Mui-active .MuiStepConnector-line': {
          borderColor: '#000',
        },

        '& .Mui-completed .MuiStepConnector-line': {
          borderColor: '#000',
        },
      }}
    >
      {[0, 1, 2].map((_, index) => (
        <Step key={index}>
          <StepLabel />
        </Step>
      ))}
    </Stepper>
  );
}
