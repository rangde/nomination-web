import type { NominationFormState } from './NominationFormProvider';

export type RequiredIssue = {
  hi: string;
  en: string;
  step: number;
};

const isEmpty = (v: unknown) => String(v ?? '').trim().length === 0;

export const OTHER_BUSINESS = 'other';

export const hasAnyIdProof = (form: NominationFormState) =>
  !isEmpty(form.step1.aadhaar_number) ||
  !isEmpty(form.step1.pan_number) ||
  !isEmpty(form.step1.voter_id);

const firstIssue = (
  step: number,
  checks: { when: boolean; hi: string; en: string }[]
): RequiredIssue | null => {
  const failed = checks.find((check) => check.when);
  return failed ? { hi: failed.hi, en: failed.en, step } : null;
};

export const getStep1Issue = (form: NominationFormState) =>
  firstIssue(1, [
    {
      when: isEmpty(form.step1.full_name),
      hi: 'पूरा नाम आवश्यक है',
      en: 'Full name is required',
    },
    {
      when: isEmpty(form.step1.pincode),
      hi: 'पिनकोड आवश्यक है',
      en: 'Pincode is required',
    },
    {
      when: isEmpty(form.step1.district),
      hi: 'ज़िला आवश्यक है',
      en: 'District is required',
    },
    {
      when: isEmpty(form.step1.townvillage),
      hi: 'शहर / गाँव आवश्यक है',
      en: 'Town/Village is required',
    },
    {
      when: isEmpty(form.step1.date_of_birth),
      hi: 'जन्म तिथि आवश्यक है',
      en: 'Date of Birth is required',
    },
    {
      when: isEmpty(form.step1.photo_of_didi),
      hi: 'दीदी की फोटो आवश्यक है',
      en: 'Photo of Didi is required',
    },
    {
      when: !hasAnyIdProof(form),
      hi: 'आधार, पैन या वोटर आईडी में से कोई एक आवश्यक है',
      en: 'Enter any one ID: Aadhaar, PAN, or Voter ID',
    },
  ]);

export const getShgIssue = (form: NominationFormState) =>
  firstIssue(2, [
    {
      when: isEmpty(form.shg.vo_name),
      hi: 'ग्राम संगठन का नाम आवश्यक है',
      en: 'Name of the VO is required',
    },
    {
      when: isEmpty(form.shg.shg_name),
      hi: 'समूह का नाम आवश्यक है',
      en: 'Name of the SHG is required',
    },
    {
      when: isEmpty(form.shg.year_of_joining_shg),
      hi: 'कृपया समूह में शामिल होने का वर्ष चुनें',
      en: 'Please select the year of joining SHG',
    },
    {
      when: isEmpty(form.shg.attendance_last_12_meetings),
      hi: 'कृपया पिछली 12 बैठकों में उपस्थिति चुनें',
      en: 'Please select attendance in last 12 meetings',
    },
    {
      when: isEmpty(form.shg.repayment_record),
      hi: 'कृपया चुकौती रिकॉर्ड चुनें',
      en: 'Please select repayment record',
    },
    {
      when: isEmpty(form.shg.total_savings),
      hi: 'कुल बचत राशि आवश्यक है',
      en: 'Total savings in SHG is required',
    },
  ]);

export const getEnterpriseIssue = (form: NominationFormState) =>
  firstIssue(3, [
    {
      when: !form.step2.sector,
      hi: 'कृपया सेक्टर चुनें',
      en: 'Please select sector',
    },
    {
      when: !form.step2.business_category,
      hi: 'कृपया बिज़नेस टाइप चुनें',
      en: 'Please select business type',
    },
    {
      when:
        form.step2.business_category === OTHER_BUSINESS &&
        isEmpty(form.step2.business_category_other),
      hi: 'कृपया अपना व्यवसाय लिखें',
      en: 'Please specify the type of business',
    },
    {
      when: !form.step2.years_of_experience,
      hi: 'कृपया व्यवसाय का अनुभव चुनें',
      en: 'Please select years of experience',
    },
    {
      when: !form.step2.number_of_businesses,
      hi: 'कृपया व्यवसायों की संख्या चुनें',
      en: 'Please select number of businesses',
    },
    {
      when: !form.step2.family_support,
      hi: 'कृपया परिवार के सहयोग का विकल्प चुनें',
      en: 'Please select family support in enterprise',
    },
    {
      when: !form.step2.business_helpers?.length,
      hi: 'कृपया चुनें कि व्यवसाय या पैसों में कौन मदद करता है',
      en: 'Please select who helps in business or finances',
    },
    {
      when: !form.step2.supportNeeded?.length,
      hi: 'कृपया सपोर्ट विकल्प चुनें',
      en: 'Please select support needed',
    },
  ]);

// every mandatory answer across steps 1-3, checked before the credit OTP goes out
export const getFormIssue = (form: NominationFormState): RequiredIssue | null =>
  getStep1Issue(form) || getShgIssue(form) || getEnterpriseIssue(form);
