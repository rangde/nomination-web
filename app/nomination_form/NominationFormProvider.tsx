'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { submitNominationForm } from '@/services/api';

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
  step1: NominationStep1Form;
  shg: NominationShgForm;
  step2: NominationStep2Form;
  step3: NominationStep3Form;
};

export type NominationSubmitPayload = NominationStep1Form &
  NominationShgForm &
  NominationStep2Form &
  NominationStep3Form;

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

type Ctx = {
  form: NominationFormState;

  setStep1: (patch: Partial<NominationStep1Form>) => void;
  setShg: (patch: Partial<NominationShgForm>) => void;
  setStep2: (patch: Partial<NominationStep2Form>) => void;
  setStep3: (patch: Partial<NominationStep3Form>) => void;

  resetAll: () => void;

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
    setForm(initialState);
  }, []);

  const submitForm = useCallback(
    async (
      overrides?: Partial<NominationSubmitPayload>
    ): Promise<SubmitResult> => {
      try {
        const payload: NominationSubmitPayload = {
          ...form.step1,
          ...form.shg,
          ...form.step2,
          ...form.step3,
          ...splitFullName(form.step1.full_name),
          ...overrides,
        };
        if (payload.mobile_number) {
          payload.mobile_number = payload.mobile_number.replace(/\D/g, '');
        }

        const res = await submitNominationForm(payload);
        const msg =
          typeof res?.message?.msg === 'string'
            ? res.message.msg
            : Array.isArray(res?.message?.msg)
              ? res.message.msg[0]
              : 'Submitted successfully';

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
      submitForm,
    }),
    [form, setStep1, setShg, setStep2, setStep3, resetAll, submitForm]
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
