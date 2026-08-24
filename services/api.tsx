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
  mobile_number: string;
  id_number?: string;
  id_type?: 'PAN' | 'AADHAAR' | 'VOTERID';
  district?: string;
  state_code?: string;
  pincode?: string;
};

export type CustomApiMessage = {
  status: number;
  msg: string | string[];
};

export type OrganizationType = 'SHG' | 'VO';

export type OrganizationSearchResult = {
  name: string;
  organisation_name: string;
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

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const GENERIC_ERROR = 'Something went wrong. Please try again.';

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

// frappe puts the user facing text in _server_messages and the raw traceback in
// exception, so only the former is safe to show
const frappeErrorMessage = (body: unknown): string => {
  const raw = (body as { _server_messages?: unknown })?._server_messages;
  const messages = typeof raw === 'string' ? parseJson(raw) : null;
  const first = Array.isArray(messages) ? messages[0] : null;
  const parsed = typeof first === 'string' ? parseJson(first) : first;
  const message = (parsed as { message?: unknown })?.message;

  return typeof message === 'string' && message.trim()
    ? message
    : GENERIC_ERROR;
};

// the body can only be read once, so failures are parsed from the same text
async function readFrappe<ResponseType>(
  response: Response
): Promise<FrappeCustomResponse<ResponseType>> {
  const text = await response.text().catch(() => '');
  const body = parseJson(text);
  const hasPayload =
    !!body && typeof body === 'object' && 'message' in (body as object);

  if (!response.ok) {
    console.error(`Request failed (${response.status}): ${text}`);

    // a whitelisted method that returns {status: 0, msg} still answers with a
    // non-2xx status, so hand it back and let the caller read the payload
    if (!hasPayload) {
      throw new ApiError(frappeErrorMessage(body));
    }
  } else if (!hasPayload) {
    console.error(`Unexpected response for ${response.url}: ${text}`);
    throw new ApiError(GENERIC_ERROR);
  }

  return body as FrappeCustomResponse<ResponseType>;
}

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

  return readFrappe<ResponseType>(response);
}

async function getFrappe<ResponseType>(
  request: FrappeGetRequestHeader
): Promise<FrappeCustomResponse<ResponseType>> {
  const response = await fetch(request.url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return readFrappe<ResponseType>(response);
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

export const verifyOtpApi = async (
  number: string,
  otp: string,
  credit_check: boolean = false
) => {
  const result = await postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.login.verify_user_otp',
    body: {
      mobile_number: number,
      otp,
      credit_check: credit_check,
    },
  });

  if (!result?.message?.status) {
    const msg = result?.message?.msg;
    throw new ApiError(typeof msg === 'string' ? msg : 'Invalid OTP');
  }

  return result;
};

export const sendLeaderOtp = async (
  number: string,
  role: string,
  level: string = 'SHG'
) => {
  const result = await postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.leader_approval.send_leader_otp',
    body: { mobile_number: number, role, level },
  });

  if (!result?.message?.status) {
    const msg = result?.message?.msg;
    throw new ApiError(typeof msg === 'string' ? msg : 'Unable to send OTP');
  }

  return result;
};

export const verifyLeaderOtp = async (
  number: string,
  otp: string,
  role: string,
  level: string = 'SHG'
) => {
  const result = await postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.leader_approval.verify_leader_otp',
    body: { mobile_number: number, otp, role, level },
  });

  if (!result?.message?.status) {
    const msg = result?.message?.msg;
    throw new ApiError(typeof msg === 'string' ? msg : 'Invalid OTP');
  }

  return result;
};

export const getLeaderApprovals = (level: string = 'SHG') => {
  return postFrappe<CustomApiMessage>({
    url: '/api/method/nomination.api.leader_approval.get_leader_approvals',
    body: { level },
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

export const searchOrganizations = (
  organizationType: OrganizationType,
  searchText: string
) => {
  return postFrappe<CustomApiMessage & { msg: OrganizationSearchResult[] }>({
    url: '/api/method/nomination.api.organization.search_organizations',
    body: {
      organization_type: organizationType,
      search_text: searchText,
    },
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
