import { NominationSubmitPayload } from '@/app/nomination_form/NominationFormProvider';

export type FrappeCustomResponse<ResponseType> = {
  message: ResponseType;
};

export type FrappeRestApiResponse<ResponseType> = {
  data: ResponseType;
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

export type FrappeCsrfMessage = {
  csrf_token: string;
  user: string;
};

export type FrappePostRequestHeader = {
  url: string;
  body: unknown;
  headers?: HeadersInit;
};

export type FrappeGetRequestHeader = {
  url: string;
};

async function postFrappe<ResponseType>(
  request: FrappePostRequestHeader
): Promise<FrappeCustomResponse<ResponseType>> {
  const response = await fetch(request.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...request.headers,
    },
    body: JSON.stringify(request.body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error(`Request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as FrappeCustomResponse<ResponseType>;
}

async function getFrappe<ResponseType>(
  request: FrappeGetRequestHeader
): Promise<FrappeCustomResponse<ResponseType>> {
  const response = await fetch(request.url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error(`Request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as FrappeCustomResponse<ResponseType>;
}

export const getNumberChecked = (
  number: string,
  credit_check: boolean = false
) => {
  return postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.login.user_validation',
    body: { mobile_number: number, credit_check: credit_check },
  });
};

export const verifyOtpApi = (
  number: string,
  otp: string,
  credit_check: boolean = false
) => {
  return postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.login.verify_user_otp',
    body: {
      mobile_number: number,
      otp,
      credit_check: credit_check,
    },
  });
};

export const validateAadhaar = (aadhaarNumber: string) => {
  return postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.form.validate_aadhaar',
    body: {
      aadhaar_number: aadhaarNumber,
    },
  });
};

export const validatePan = (panNumber: string) => {
  return postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.form.validate_pan',
    body: {
      pan_number: panNumber,
    },
  });
};

export const validateDob = (dob: string) => {
  return postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.form.validate_dob',
    body: {
      dob: dob,
    },
  });
};

export const getRoles = () => {
  return getFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.user.get_roles',
  });
};

export const getNominationsForm = () => {
  return getFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.dashboard.get_nomination_list',
  });
};

export const getUserDetails = () => {
  return getFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.user.get_user_info',
  });
};

export const submitNominationForm = (payload: NominationSubmitPayload) => {
  return postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.form.submit_nomination',
    body: { payload: payload },
  });
};

export const getDoc = (name: string) => {
  return postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.form.get_nomination_form',
    body: {
      name: name,
    },
  });
};

export const approveDoc = (name: string, credit_limit: string) => {
  return postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.form.approve_form',
    body: {
      name: name,
      credit_limit: credit_limit,
    },
  });
};

export const getCreditScore = (payload: CreditScorePayload) => {
  return postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.credit_check.credit_score',
    body: payload,
  });
};

export const getCsrfToken = () => {
  return getFrappe<FrappeCsrfMessage>({
    url: '/api/method/nomination.api.login.get_csrf',
  });
};

export const logoutUser = async () => {
  const csrf = await getCsrfToken();

  return await postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.login.logout',
    body: {},
    headers: {
      'X-Frappe-CSRF-Token': csrf.message.csrf_token,
    },
  });
};
