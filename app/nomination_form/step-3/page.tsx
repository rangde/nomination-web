'use client';

import { Box, Button, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import DualLanguageText from '@/components/DualLanguageText';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';
import AppHeader from '@/components/header/AppHeader';
import CheckBoxSingleSelect from '@/components/FormComponents/CheckBoxSingleSelect';
import NominationStepper from '@/components/nomination/NominationStepper';
import SelectField from '@/components/FormComponents/SelectField';
import Text from '@/components/FormComponents/Text';
import CheckBoxMultiSelect from '@/components/FormComponents/CheckBoxMultiSelect';
import ImportantNote from '@/components/nomination/ImportantNote';
import { useNominationForm } from '../NominationFormProvider';
import { getEnterpriseIssue, OTHER_BUSINESS } from '../requiredFields';
import { addToast } from '@/components/error/toastStore';

type Sector = 'farm_based' | 'non_farm';

export default function NominationStepTwoPage() {
  const router = useRouter();
  const { form, setStep2 } = useNominationForm();

  const {
    sector,
    business_category,
    business_category_other,
    years_of_experience,
    number_of_businesses,
    family_support,
    business_helpers,
    supportNeeded,
  } = form.step2;

  const farmSelectOptions = [
    { label_1: 'कृषि', label_2: 'Agriculture', value: 'agriculture' },
    { label_1: 'डेयरी', label_2: 'Dairy', value: 'dairy' },
    { label_1: 'बकरी पालन', label_2: 'Goat Rearing', value: 'goat_rearing' },
    {
      label_1: 'मुर्गी पालन',
      label_2: 'Poultry Farming',
      value: 'poultry_farming',
    },
    { label_1: 'मछली पालन', label_2: 'Fishery', value: 'fishery' },
    {
      label_1: 'मशरूम की खेती',
      label_2: 'Mushroom Cultivation',
      value: 'mushroom_cultivation',
    },
    { label_1: 'मधुमक्खी पालन', label_2: 'Beekeeping', value: 'beekeeping' },
    {
      label_1: 'वर्मी कम्पोस्ट',
      label_2: 'Vermicompost',
      value: 'vermicompost',
    },
    {
      label_1: 'नर्सरी / पौधशाला',
      label_2: 'Plant Nursery',
      value: 'plant_nursery',
    },
    {
      label_1: 'कृषि इनपुट दुकान',
      label_2: 'Agri Input Shop',
      value: 'agri_input_shop',
    },
    {
      label_1: 'पशु आहार दुकान',
      label_2: 'Cattle Feed Shop',
      value: 'cattle_feed_shop',
    },
    { label_1: 'अन्य', label_2: 'Other', value: OTHER_BUSINESS },
  ];

  const nonFarmSelectOptions = [
    { label_1: 'सिलाई', label_2: 'Tailoring', value: 'tailoring' },
    {
      label_1: 'ब्यूटी पार्लर',
      label_2: 'Beauty Parlour',
      value: 'beauty_parlour',
    },
    {
      label_1: 'किराना दुकान',
      label_2: 'Grocery Store',
      value: 'grocery_store',
    },
    {
      label_1: 'सब्ज़ी विक्रेता',
      label_2: 'Vegetable Vendor',
      value: 'vegetable_vendor',
    },
    {
      label_1: 'टिफ़िन / भोजनालय',
      label_2: 'Tiffin / Food Stall',
      value: 'tiffin_food_stall',
    },
    {
      label_1: 'अचार-पापड़ निर्माण',
      label_2: 'Pickle and Papad Making',
      value: 'pickle_papad_making',
    },
    {
      label_1: 'हस्तशिल्प / हथकरघा',
      label_2: 'Handicraft / Handloom',
      value: 'handicraft_handloom',
    },
    {
      label_1: 'चूड़ी व सौन्दर्य सामग्री',
      label_2: 'Bangles and Cosmetics',
      value: 'bangles_cosmetics',
    },
    { label_1: 'आटा चक्की', label_2: 'Flour Mill', value: 'flour_mill' },
    {
      label_1: 'मोबाइल रिचार्ज व मरम्मत',
      label_2: 'Mobile Recharge and Repair',
      value: 'mobile_recharge_repair',
    },
    {
      label_1: 'दोना-पत्तल निर्माण',
      label_2: 'Dona-Pattal Making',
      value: 'dona_pattal_making',
    },
    {
      label_1: 'अगरबत्ती निर्माण',
      label_2: 'Agarbatti Making',
      value: 'agarbatti_making',
    },
    { label_1: 'छोटा व्यापार', label_2: 'Petty Trade', value: 'petty_trade' },
    { label_1: 'अन्य', label_2: 'Other', value: OTHER_BUSINESS },
  ];

  const experienceOptions = [
    { label_1: '1 वर्ष से कम', label_2: 'Under 1 year', value: 'below_1' },
    { label_1: '1 से 2 वर्ष', label_2: '1 to 2 years', value: '1_to_2' },
    { label_1: '3 से 5 वर्ष', label_2: '3 to 5 years', value: '3_to_5' },
    { label_1: '5 वर्ष से अधिक', label_2: 'Over 5 years', value: 'above_5' },
  ];

  const businessCountOptions = [
    { label_1: '1', label_2: '', value: '1' },
    { label_1: '2', label_2: '', value: '2' },
    { label_1: '3 या अधिक', label_2: '3 or more', value: '3_or_more' },
  ];

  const familySupportOptions = [
    { label_1: 'हाँ', label_2: 'Yes', value: 'yes' },
    { label_1: 'आंशिक रूप से', label_2: 'Partially', value: 'partially' },
    { label_1: 'नहीं', label_2: 'No', value: 'no' },
  ];

  const helperOptions = [
    { label_1: 'पति', label_2: 'Husband', value: 'husband' },
    { label_1: 'बच्चे', label_2: 'Children', value: 'children' },
    { label_1: 'ससुराल पक्ष', label_2: 'In laws', value: 'in_laws' },
    { label_1: 'कोई नहीं', label_2: 'None', value: 'none' },
  ];

  const validateRequired = (): boolean => {
    const issue = getEnterpriseIssue(form);
    if (!issue) return true;

    addToast({ type: 'error', hi: issue.hi, en: issue.en });
    return false;
  };

  const handleNext = () => {
    const ok = validateRequired();
    if (!ok) return;

    addToast({
      type: 'success',
      hi: 'तीसरा चरण सफलतापूर्वक पूरा हुआ',
      en: 'Step 3 completed successfully',
    });

    router.push('/nomination_form/step-4');
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
        onBack={() => router.push('/nomination_form/step-2')}
        h1={hi?.form?.nomi_form}
        h2={en?.form?.nomi_form}
      />

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 2,
          py: 2,
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <NominationStepper activeStep={2} totalSteps={4} />

          <DualLanguageText
            h1={hi?.form?.enterprise}
            h2={en?.form?.enterprise}
            h1style={{ fontSize: 18, fontWeight: 700 }}
            h2style={{ mb: 2, fontSize: 14 }}
          />

          <Box display="flex" flexDirection="column" gap={2}>
            <CheckBoxSingleSelect
              label_1={hi?.form?.sector_type}
              label_2={en?.form?.sector_type}
              value={sector}
              onChange={(val) => {
                setStep2({
                  sector: val as Sector,
                  business_category: '',
                  business_category_other: '',
                });
              }}
              options={[
                {
                  label_1: 'कृषि आधारित',
                  label_2: 'Farm-based',
                  value: 'farm_based',
                },
                {
                  label_1: 'गैर-कृषि आधारित',
                  label_2: 'Non-farm',
                  value: 'non_farm',
                },
              ]}
            />

            <SelectField
              label_1={hi?.form?.business_type}
              label_2={en?.form?.business_type}
              placeholder={en?.form?.select_type}
              value={business_category}
              onChange={(val) =>
                setStep2({
                  business_category: val,
                  ...(val === OTHER_BUSINESS
                    ? {}
                    : { business_category_other: '' }),
                })
              }
              options={
                sector === 'farm_based'
                  ? farmSelectOptions
                  : nonFarmSelectOptions
              }
            />

            {business_category === OTHER_BUSINESS && (
              <Text
                name="business_category_other"
                value={business_category_other}
                onChange={(e) =>
                  setStep2({ business_category_other: e.target.value })
                }
                label_1={hi?.form?.specify_business}
                label_2={en?.form?.specify_business}
                placeholder={en?.form?.enter_business}
                required
              />
            )}

            <SelectField
              label_1={hi?.form?.years_of_experience}
              label_2={en?.form?.years_of_experience}
              placeholder={en?.form?.select_years}
              value={years_of_experience}
              onChange={(val) => setStep2({ years_of_experience: val })}
              options={experienceOptions}
            />

            <CheckBoxSingleSelect
              label_1={hi?.form?.number_of_businesses}
              label_2={en?.form?.number_of_businesses}
              value={number_of_businesses}
              onChange={(val) => setStep2({ number_of_businesses: val })}
              options={businessCountOptions}
            />

            <CheckBoxSingleSelect
              label_1={hi?.form?.family_support}
              label_2={en?.form?.family_support}
              value={family_support}
              onChange={(val) => setStep2({ family_support: val })}
              options={familySupportOptions}
            />

            <CheckBoxMultiSelect
              label_1={hi?.form?.business_helpers}
              label_2={en?.form?.business_helpers}
              value={business_helpers}
              onChange={(vals) => setStep2({ business_helpers: vals })}
              options={helperOptions}
            />

            <CheckBoxMultiSelect
              label_1={hi?.form?.support}
              label_2={en?.form?.support}
              value={supportNeeded}
              onChange={(vals) => setStep2({ supportNeeded: vals })}
              options={[
                {
                  label_1: 'बाजार तक पहुंच',
                  label_2: 'Market Access',
                  value: 'market_access',
                },
                { label_1: 'विपणन', label_2: 'Marketing', value: 'marketing' },
                {
                  label_1: 'मांग का आकलन',
                  label_2: 'Demand Assessment',
                  value: 'demand_assessment',
                },
                { label_1: 'कोई नहीं', label_2: 'None', value: 'none' },
              ]}
            />

            <ImportantNote
              h1={hi.form.important_form}
              h2={en.form.important_form}
              desc_1={hi.form.final_review_desc_form}
              desc_2={en.form.final_review_desc_form}
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
            // onClick={() => router.push('/nomination_form/step-3')}
            onClick={handleNext}
          >
            <Box textAlign="center">
              <DualLanguageText
                h1={hi?.form?.next_step}
                h2={en?.form?.save_and_next}
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
