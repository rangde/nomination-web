'use client';

import { Box, Button, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';

import DualLanguageText from '@/components/DualLanguageText';
import Text from '@/components/FormComponents/Text';
import SelectField from '@/components/FormComponents/SelectField';
import CheckBoxSingleSelect from '@/components/FormComponents/CheckBoxSingleSelect';
import NominationStepper from '@/components/nomination/NominationStepper';
import AppHeader from '@/components/header/AppHeader';
import { addToast } from '@/components/error/toastStore';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';
import { useNominationForm } from '../NominationFormProvider';

const CURRENT_YEAR = new Date().getFullYear();

const yearOptions = Array.from({ length: 30 }, (_, i) => {
  const year = String(CURRENT_YEAR - i);
  return { label_1: year, value: year };
});

const attendanceOptions = [
  { label_1: '10 या अधिक', label_2: '10 or more', value: '10_or_more' },
  { label_1: '7 से 9', label_2: '7 to 9', value: '7_to_9' },
  { label_1: '7 से कम', label_2: 'fewer than 7', value: 'fewer_than_7' },
];

const repaymentOptions = [
  {
    label_1: 'हमेशा समय पर',
    label_2: 'Always on time',
    value: 'always_on_time',
  },
  {
    label_1: 'अधिकतर समय पर',
    label_2: 'Mostly on time',
    value: 'mostly_on_time',
  },
  { label_1: 'देरी हुई है', label_2: 'Has delayed', value: 'has_delayed' },
];

export default function NominationShgRecordPage() {
  const router = useRouter();
  const { form, setShg } = useNominationForm();

  const {
    vo_name,
    shg_name,
    year_of_joining_shg,
    attendance_last_12_meetings,
    repayment_record,
    total_savings,
  } = form.shg;

  const isEmpty = (v: unknown) => String(v ?? '').trim().length === 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (!(name in form.shg)) return;
    const key = name as keyof typeof form.shg;

    setShg({ [key]: value });
  };

  const validateRequired = (): boolean => {
    if (isEmpty(vo_name)) {
      addToast({
        type: 'error',
        hi: 'ग्राम संगठन का नाम आवश्यक है',
        en: 'Name of the VO is required',
      });
      return false;
    }
    if (isEmpty(shg_name)) {
      addToast({
        type: 'error',
        hi: 'समूह का नाम आवश्यक है',
        en: 'Name of the SHG is required',
      });
      return false;
    }
    if (isEmpty(year_of_joining_shg)) {
      addToast({
        type: 'error',
        hi: 'कृपया समूह में शामिल होने का वर्ष चुनें',
        en: 'Please select the year of joining SHG',
      });
      return false;
    }
    if (isEmpty(attendance_last_12_meetings)) {
      addToast({
        type: 'error',
        hi: 'कृपया पिछली 12 बैठकों में उपस्थिति चुनें',
        en: 'Please select attendance in last 12 meetings',
      });
      return false;
    }
    if (isEmpty(repayment_record)) {
      addToast({
        type: 'error',
        hi: 'कृपया चुकौती रिकॉर्ड चुनें',
        en: 'Please select repayment record',
      });
      return false;
    }
    if (isEmpty(total_savings)) {
      addToast({
        type: 'error',
        hi: 'कुल बचत राशि आवश्यक है',
        en: 'Total savings in SHG is required',
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateRequired()) return;

    addToast({
      type: 'success',
      hi: 'दूसरा चरण सफलतापूर्वक पूरा हुआ',
      en: 'Step 2 completed successfully',
    });

    router.push('/nomination_form/step-3');
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F3F4F6',
        overflow: 'hidden',
      }}
    >
      <AppHeader
        showBack
        onBack={() => router.push('/nomination_form/step-1')}
        h1={hi?.form?.nomi_form}
        h2={en?.form?.nomi_form}
      />

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 2,
          pb: 5,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <NominationStepper activeStep={1} totalSteps={4} />

          <DualLanguageText
            h1={hi?.form?.shg_record}
            h2={en?.form?.shg_record}
            h1style={{ fontSize: 18, fontWeight: 700 }}
            h2style={{ mb: 2, fontSize: 14 }}
          />

          <Box display="flex" flexDirection="column" gap={2}>
            <Text
              name="vo_name"
              value={vo_name}
              onChange={handleChange}
              label_1={hi?.form?.vo_name}
              label_2={en?.form?.vo_name}
              required
            />

            <Text
              name="shg_name"
              value={shg_name}
              onChange={handleChange}
              label_1={hi?.form?.shg_name}
              label_2={en?.form?.shg_name}
              required
            />

            <SelectField
              label_1={hi?.form?.year_of_joining_shg}
              label_2={en?.form?.year_of_joining_shg}
              placeholder={en?.form?.select_year}
              value={year_of_joining_shg}
              onChange={(val) => setShg({ year_of_joining_shg: val })}
              options={yearOptions}
            />

            <CheckBoxSingleSelect
              label_1={hi?.form?.attendance_12_meetings}
              label_2={en?.form?.attendance_12_meetings}
              value={attendance_last_12_meetings}
              onChange={(val) => setShg({ attendance_last_12_meetings: val })}
              options={attendanceOptions}
            />

            <CheckBoxSingleSelect
              label_1={hi?.form?.repayment_record}
              label_2={en?.form?.repayment_record}
              value={repayment_record}
              onChange={(val) => setShg({ repayment_record: val })}
              options={repaymentOptions}
            />

            <Text
              name="total_savings"
              value={total_savings}
              onChange={handleChange}
              label_1={hi?.form?.total_savings}
              label_2={en?.form?.total_savings}
              placeholder={`${hi?.form?.numeric_rupees} / ${en?.form?.numeric_rupees}`}
              currency
              required
            />
          </Box>

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 2,
              bgcolor: '#000',
              textTransform: 'none',
              '&:hover': { bgcolor: '#111' },
            }}
            onClick={handleNext}
          >
            <Box textAlign="center">
              <DualLanguageText
                h1={hi?.form?.next_step}
                h2={en?.form?.next_step}
                h1style={{ fontWeight: 600, textAlign: 'center', fontSize: 15 }}
                h2style={{ fontWeight: 400, fontSize: 12, textAlign: 'center' }}
              />
            </Box>
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}
