'use client';

import { Box } from '@mui/material';
import NominationCard from './NominationCard';
import NominationCard2 from './NominationCard2';

type NominationData = Record<string, unknown>;

type cardValue = {
  data: NominationData;
  canReview: boolean;
};

function ApprovedCard({ data, canReview }: cardValue) {
  return (
    <Box>
      {canReview ? (
        <Box>
          <NominationCard
            key={data?.name as string}
            data={data}
            canReview={false}
            cardSx={{ borderLeft: '4px' }}
            approvedSx={{ backgroundColor: '#D1D5DB' }}
            form_approve={true}
          />
        </Box>
      ) : (
        <Box>
          <NominationCard2 key={data?.name as string} data={data} />
        </Box>
      )}
    </Box>
  );
}

export default ApprovedCard;
