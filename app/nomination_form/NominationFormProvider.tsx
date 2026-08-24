'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  getNominationDraft,
  NominationDraftDoc,
  saveNominationDraft,
  submitNominationForm,
} from '@/services/api';
import { storage } from '../utils/localStorage';

export type NominationStep1Form = {
  full_name: string;
  first_name: string;
  last_name: string;
  pincode: string;
  district: string;
  townvillage: string;
  permanent_address: string;
  aadhaar_number: string;
  pan_number: string;
  voter_id: string;
  date_of_birth: string;
  photo_of_didi: string;
};

export type NominationShgForm = {
  vo_name: string;
  shg_name: string;
  year_of_joining_shg: string;
  attendance_last_12_meetings: string;
  repayment_record: string;
  total_savings: string;
};

export type NominationStep2Form = {
  sector: 'farm_based' | 'non_farm';
  business_category: string;
  business_category_other: string;
  years_of_experience: string;
  number_of_businesses: string;
  family_support: string;
  business_helpers: string[];
  supportNeeded: string[];
};

export type LeaderApproval = {
  role: string;
  mobile_number: string;
  verified_on: string;
};

export type NominationStep3Form = {
  credit_score: string;
  mobile_number: string;
  set_credit_limit: string;
  reportBase64: string;
  president_mobile: string;
  secretary_mobile: string;
  treasurer_mobile: string;
  approved_leaders: LeaderApproval[];
};

export type NominationFormState = {
  draft_name: string;
  step1: NominationStep1Form;
  shg: NominationShgForm;
  step2: NominationStep2Form;
  step3: NominationStep3Form;
};

export type NominationSubmitPayload = NominationStep1Form &
  NominationShgForm &
  NominationStep2Form &
  NominationStep3Form & {
    draft_name?: string;
  };

// the form collects a single Full Name, the backend stores first + last.
// the trailing word is the surname or initial: "Naresh Kanna S" -> "Naresh Kanna" + "S"
export const splitFullName = (fullName: string) => {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    return { first_name: parts[0] || '', last_name: '' };
  }

  return {
    first_name: parts.slice(0, -1).join(' '),
    last_name: parts[parts.length - 1],
  };
};

const initialState: NominationFormState = {
  draft_name: '',
  step1: {
    full_name: '',
    first_name: '',
    last_name: '',
    pincode: '',
    district: '',
    townvillage: '',
    permanent_address: '',
    aadhaar_number: '',
    pan_number: '',
    voter_id: '',
    date_of_birth: '',
    photo_of_didi: '',
  },
  shg: {
    vo_name: '',
    shg_name: '',
    year_of_joining_shg: '',
    attendance_last_12_meetings: '',
    repayment_record: '',
    total_savings: '',
  },
  step2: {
    sector: 'farm_based',
    business_category: '',
    business_category_other: '',
    years_of_experience: '',
    number_of_businesses: '',
    family_support: '',
    business_helpers: [],
    supportNeeded: [],
  },
  step3: {
    credit_score: '',
    mobile_number: '',
    set_credit_limit: '',
    reportBase64: '',
    president_mobile: '',
    secretary_mobile: '',
    treasurer_mobile: '',
    approved_leaders: [],
  },
};

type SubmitResult = { ok: false; error: string } | { ok: true; name: string };
type SaveDraftResult =
  | { ok: false; error: string }
  | { ok: true; name: string; approvalsCleared: boolean };

const DRAFT_STORAGE_KEY = 'nomination_form_draft_name';

const ATTENDANCE_REVERSE: Record<string, string> = {
  '10 or more': '10_or_more',
  '7 to 9': '7_to_9',
  'fewer than 7': 'fewer_than_7',
};

const REPAYMENT_REVERSE: Record<string, string> = {
  'Always on time': 'always_on_time',
  'Mostly on time': 'mostly_on_time',
  'Has delayed': 'has_delayed',
};

const EXPERIENCE_REVERSE: Record<string, string> = {
  'Under 1 year': 'below_1',
  '1 to 2 years': '1_to_2',
  '3 to 5 years': '3_to_5',
  'Over 5 years': 'above_5',
};

const BUSINESS_COUNT_REVERSE: Record<string, string> = {
  '1': '1',
  '2': '2',
  '3 or more': '3_or_more',
};

const FAMILY_SUPPORT_REVERSE: Record<string, string> = {
  Yes: 'yes',
  Partially: 'partially',
  No: 'no',
};

const FARM_BUSINESS = new Set([
  'agriculture',
  'dairy',
  'goat_rearing',
  'poultry_farming',
  'fishery',
  'mushroom_cultivation',
  'beekeeping',
  'vermicompost',
  'plant_nursery',
  'agri_input_shop',
  'cattle_feed_shop',
]);

const NON_FARM_BUSINESS = new Set([
  'tailoring',
  'beauty_parlour',
  'grocery_store',
  'vegetable_vendor',
  'tiffin_food_stall',
  'pickle_papad_making',
  'handicraft_handloom',
  'bangles_cosmetics',
  'flour_mill',
  'mobile_recharge_repair',
  'dona_pattal_making',
  'agarbatti_making',
  'petty_trade',
]);

const s = (value: unknown) => (typeof value === 'string' ? value : '');
const n = (value: unknown) => Number(value || 0);
const digits = (value: unknown) => s(value).replace(/\D/g, '').slice(-10);

const buildPayload = (
  form: NominationFormState,
  overrides?: Partial<NominationSubmitPayload>
): NominationSubmitPayload => {
  const payload: NominationSubmitPayload = {
    ...form.step1,
    ...form.shg,
    ...form.step2,
    ...form.step3,
    draft_name: form.draft_name,
    ...splitFullName(form.step1.full_name),
    ...overrides,
  };

  if (payload.mobile_number) {
    payload.mobile_number = payload.mobile_number.replace(/\D/g, '');
  }

  return payload;
};

const stateFromDraft = (doc: NominationDraftDoc): NominationFormState => {
  const firstName = s(doc.first_name);
  const lastName = s(doc.last_name);
  const businessCategory = s(doc.business_category);
  const isKnownBusiness =
    FARM_BUSINESS.has(businessCategory) ||
    NON_FARM_BUSINESS.has(businessCategory);
  const approved = Array.isArray(doc.approved_leaders)
    ? doc.approved_leaders
    : [];

  const leaderNumber = (role: string) =>
    approved.find((item) => item.role === role)?.mobile_number || '';

  return {
    draft_name: doc.name,
    step1: {
      full_name: `${firstName} ${lastName}`.trim(),
      first_name: firstName,
      last_name: lastName,
      pincode: s(doc.pincode),
      district: s(doc.district),
      townvillage: s(doc.townvillage),
      permanent_address: s(doc.permanent_address),
      aadhaar_number: s(doc.aadhaar_number),
      pan_number: s(doc.pan_number),
      voter_id: s(doc.voter_id),
      date_of_birth: s(doc.date_of_birth),
      photo_of_didi: s(doc.photo_of_didi),
    },
    shg: {
      vo_name: s(doc.name_of_the_vo),
      shg_name: s(doc.name_of_the_shg),
      year_of_joining_shg: s(doc.year_of_joining_shg),
      attendance_last_12_meetings:
        ATTENDANCE_REVERSE[s(doc.attendance_in_last_12_meetings)] || '',
      repayment_record: REPAYMENT_REVERSE[s(doc.repayment_record)] || '',
      total_savings: s(doc.total_savings_in_shg),
    },
    step2: {
      sector: n(doc.farm_based) === 1 ? 'farm_based' : 'non_farm',
      business_category: isKnownBusiness ? businessCategory : 'other',
      business_category_other: isKnownBusiness ? '' : businessCategory,
      years_of_experience: EXPERIENCE_REVERSE[s(doc.years_of_experience)] || '',
      number_of_businesses:
        BUSINESS_COUNT_REVERSE[s(doc.number_of_business)] || '',
      family_support:
        FAMILY_SUPPORT_REVERSE[s(doc.family_support_in_enterprise)] || '',
      business_helpers: [
        n(doc.hushband) === 1 ? 'husband' : '',
        n(doc.children) === 1 ? 'children' : '',
        n(doc.in_laws) === 1 ? 'in_laws' : '',
        n(doc.no_one) === 1 ? 'none' : '',
      ].filter(Boolean),
      supportNeeded: [
        n(doc.market_access) === 1 ? 'market_access' : '',
        n(doc.marketing) === 1 ? 'marketing' : '',
        n(doc.demand_assessment) === 1 ? 'demand_assessment' : '',
        n(doc.none) === 1 ? 'none' : '',
      ].filter(Boolean),
    },
    step3: {
      credit_score: s(doc.credit_score),
      mobile_number: digits(doc.mobile_number),
      set_credit_limit: s(doc.set_credit_limit),
      reportBase64: '',
      president_mobile: leaderNumber('president'),
      secretary_mobile: leaderNumber('secretary'),
      treasurer_mobile: leaderNumber('treasurer'),
      approved_leaders: approved,
    },
  };
};

type Ctx = {
  form: NominationFormState;

  setStep1: (patch: Partial<NominationStep1Form>) => void;
  setShg: (patch: Partial<NominationShgForm>) => void;
  setStep2: (patch: Partial<NominationStep2Form>) => void;
  setStep3: (patch: Partial<NominationStep3Form>) => void;

  resetAll: () => void;
  saveDraft: (
    overrides?: Partial<NominationSubmitPayload>
  ) => Promise<SaveDraftResult>;

  submitForm: (
    overrides?: Partial<NominationSubmitPayload>
  ) => Promise<SubmitResult>;
};

const NominationFormContext = createContext<Ctx | null>(null);

export function NominationFormProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [form, setForm] = useState<NominationFormState>(initialState);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const savedDraftName =
        storage.get<string>(DRAFT_STORAGE_KEY) || undefined;
      const res = await getNominationDraft(savedDraftName).catch(() => null);
      const draft = res?.message?.status ? res.message.msg?.[0] : null;

      if (!mounted || !draft) return;

      storage.set(DRAFT_STORAGE_KEY, draft.name);
      setForm(stateFromDraft(draft));
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const setStep1 = useCallback((patch: Partial<NominationStep1Form>) => {
    setForm((prev) => ({ ...prev, step1: { ...prev.step1, ...patch } }));
  }, []);

  const setShg = useCallback((patch: Partial<NominationShgForm>) => {
    setForm((prev) => ({ ...prev, shg: { ...prev.shg, ...patch } }));
  }, []);

  const setStep2 = useCallback((patch: Partial<NominationStep2Form>) => {
    setForm((prev) => ({ ...prev, step2: { ...prev.step2, ...patch } }));
  }, []);

  const setStep3 = useCallback((patch: Partial<NominationStep3Form>) => {
    setForm((prev) => ({ ...prev, step3: { ...prev.step3, ...patch } }));
  }, []);

  const resetAll = useCallback(() => {
    storage.remove(DRAFT_STORAGE_KEY);
    setForm(initialState);
  }, []);

  const saveDraft = useCallback(
    async (
      overrides?: Partial<NominationSubmitPayload>
    ): Promise<SaveDraftResult> => {
      try {
        const payload = buildPayload(form, overrides);
        const res = await saveNominationDraft(payload);
        const msg = res.message.msg;

        setForm((prev) => ({
          ...prev,
          draft_name: msg.name,
          step1: {
            ...prev.step1,
            photo_of_didi: msg.photo_of_didi || prev.step1.photo_of_didi,
          },
          step3: {
            ...prev.step3,
            approved_leaders: msg.approved_leaders,
            ...(msg.approvals_cleared
              ? {
                  president_mobile: '',
                  secretary_mobile: '',
                  treasurer_mobile: '',
                }
              : {}),
          },
        }));
        storage.set(DRAFT_STORAGE_KEY, msg.name);

        return {
          ok: true,
          name: msg.name,
          approvalsCleared: msg.approvals_cleared,
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Draft save failed';
        return { ok: false, error: msg };
      }
    },
    [form]
  );

  const submitForm = useCallback(
    async (
      overrides?: Partial<NominationSubmitPayload>
    ): Promise<SubmitResult> => {
      try {
        const payload = buildPayload(form, overrides);

        const res = await submitNominationForm(payload);
        const msg =
          typeof res?.message?.msg === 'string'
            ? res.message.msg
            : Array.isArray(res?.message?.msg)
              ? res.message.msg[0]
              : 'Submitted successfully';

        storage.remove(DRAFT_STORAGE_KEY);
        setForm(initialState);

        return { ok: true, name: msg };
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Submit failed';
        return { ok: false, error: msg };
      }
    },
    [form]
  );

  const value = useMemo<Ctx>(
    () => ({
      form,
      setStep1,
      setShg,
      setStep2,
      setStep3,
      resetAll,
      saveDraft,
      submitForm,
    }),
    [
      form,
      setStep1,
      setShg,
      setStep2,
      setStep3,
      resetAll,
      saveDraft,
      submitForm,
    ]
  );

  return (
    <NominationFormContext.Provider value={value}>
      {children}
    </NominationFormContext.Provider>
  );
}

export function useNominationForm() {
  const ctx = useContext(NominationFormContext);
  if (!ctx) {
    throw new Error(
      'useNominationForm must be used inside NominationFormProvider'
    );
  }
  return ctx;
}
