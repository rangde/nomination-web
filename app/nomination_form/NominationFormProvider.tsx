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
  first_name: string;
  last_name: string;
  pincode: string;
  district: string;
  townvillage: string;
  permanent_address: string;
  aadhaar_number: string;
  pan_number: string;
  date_of_birth: string;
};

export type NominationStep2Form = {
  sector: 'farm_based' | 'non_farm';
  business_category: string;
  supportNeeded: string[];
};

export type NominationStep3Form = {
  credit_score: string;
  mobile_number: string;
  set_credit_limit: string;
};

type NominationFormState = {
  step1: NominationStep1Form;
  step2: NominationStep2Form;
  step3: NominationStep3Form;
};

export type NominationSubmitPayload = NominationStep1Form &
  NominationStep2Form &
  NominationStep3Form;

const initialState: NominationFormState = {
  step1: {
    first_name: '',
    last_name: '',
    pincode: '',
    district: '',
    townvillage: '',
    permanent_address: '',
    aadhaar_number: '',
    pan_number: '',
    date_of_birth: '',
  },
  step2: {
    sector: 'farm_based',
    business_category: '',
    supportNeeded: [],
  },
  step3: {
    credit_score: '',
    mobile_number: '',
    set_credit_limit: '',
  },
};

type SubmitResult = { ok: false; error: string } | { ok: true; name: string };

type Ctx = {
  form: NominationFormState;

  setStep1: (patch: Partial<NominationStep1Form>) => void;
  setStep2: (patch: Partial<NominationStep2Form>) => void;
  setStep3: (patch: Partial<NominationStep3Form>) => void;

  resetAll: () => void;

  submitForm: () => Promise<SubmitResult>;
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

  const setStep2 = useCallback((patch: Partial<NominationStep2Form>) => {
    setForm((prev) => ({ ...prev, step2: { ...prev.step2, ...patch } }));
  }, []);

  const setStep3 = useCallback((patch: Partial<NominationStep3Form>) => {
    setForm((prev) => ({ ...prev, step3: { ...prev.step3, ...patch } }));
  }, []);

  const resetAll = useCallback(() => {
    setForm(initialState);
  }, []);

  const submitForm = useCallback(async (): Promise<SubmitResult> => {
    try {
      const payload: NominationSubmitPayload = {
        ...form.step1,
        ...form.step2,
        ...form.step3,
      };

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
  }, [form]);

  const value = useMemo<Ctx>(
    () => ({
      form,
      setStep1,
      setStep2,
      setStep3,
      resetAll,
      submitForm,
    }),
    [form, setStep1, setStep2, setStep3, resetAll, submitForm]
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
