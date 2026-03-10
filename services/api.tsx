import { NominationSubmitPayload } from '@/app/nomination_form/NominationFormProvider';

export type FrappeCustomResponse<T> = {
  message: T;
};

export type FrappeRestApiResponse<T> = {
  data: T;
};

export type CreditScorePayload = {
  first_name: string;
  last_name: string;
  dob: string;
  pan_number: string;
  mobile_number: string;
  district?: string;
  state_code?: string;
  pincode?: string;
};

export type CustomApiMessage = {
  status: number;
  msg: string | string[];
};

async function postFrappe<T>(
  url: string,
  body: unknown
): Promise<FrappeCustomResponse<T>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as FrappeCustomResponse<T>;
}

async function getFrappe<T>(url: string): Promise<FrappeCustomResponse<T>> {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as FrappeCustomResponse<T>;
}

export const getNumberChecked = (
  number: string,
  credit_check: boolean = false
) => {
  return postFrappe<CustomApiMessage>(
    '/api/method/nomination.api.login.user_validation',
    { mobile_number: number, credit_check: credit_check }
  );
};

export const verifyOtpApi = (
  number: string,
  otp: string,
  credit_check: boolean = false
) => {
  return postFrappe<CustomApiMessage>(
    '/api/method/nomination.api.login.verify_user_otp',
    {
      mobile_number: number,
      otp,
      credit_check: credit_check,
    }
  );
};

export const validatAadhar = (aadhar_number: string) => {
  return postFrappe<CustomApiMessage>(
    '/api/method/nomination.api.form.validate_aadhaar',
    {
      aadhaar_number: aadhar_number,
    }
  );
};

export const validatPan = (pan_number: string) => {
  return postFrappe<CustomApiMessage>(
    '/api/method/nomination.api.form.validate_pan',
    {
      pan_number: pan_number,
    }
  );
};

export const validatDob = (dob: string) => {
  return postFrappe<CustomApiMessage>(
    '/api/method/nomination.api.form.validate_dob',
    {
      dob: dob,
    }
  );
};

export const getRoles = () => {
  return getFrappe<CustomApiMessage>(
    '/api/method/nomination.api.user.get_roles'
  );
};

export const getNominationsform = () => {
  return getFrappe<CustomApiMessage>(
    '/api/method/nomination.api.dashboard.get_nomination_list'
  );
};

export const getUserDetails = () => {
  return getFrappe<CustomApiMessage>(
    '/api/method/nomination.api.user.get_user_info'
  );
};

export const submitNominationForm = (payload: NominationSubmitPayload) => {
  return postFrappe<CustomApiMessage>(
    '/api/method/nomination.api.form.submit_nomination',
    { payload: payload }
  );
};

export const getDoc = (name: string) => {
  return postFrappe<CustomApiMessage>(
    '/api/method/nomination.api.form.get_nomination_form',
    {
      name: name,
    }
  );
};

export const approveDoc = (name: string, credit_limit: string) => {
  return postFrappe<CustomApiMessage>(
    '/api/method/nomination.api.form.approve_form',
    {
      name: name,
      credit_limit: credit_limit,
    }
  );
};

export const getCreditScoree = (payload: CreditScorePayload) => {
  return postFrappe<CustomApiMessage>(
    '/api/method/nomination.api.credit_check.credit_score',
    payload
  );
};
