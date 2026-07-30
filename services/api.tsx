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

const CSRF_URL = '/api/method/nomination.api.login.get_csrf';

let csrfTokenPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  try {
    const response = await fetch(CSRF_URL, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) return '';

    const body = (await response.json()) as FrappeCustomResponse<
      Partial<FrappeCsrfMessage>
    >;
    return body?.message?.csrf_token ?? '';
  } catch {
    return '';
  }
}

// Frappe only enforces CSRF once a token exists in the session, and the token is
// tied to the session id — so it has to be refetched whenever the session
// rotates (login/logout).
async function getCsrfTokenCached(): Promise<string> {
  if (!csrfTokenPromise) {
    csrfTokenPromise = fetchCsrfToken();
  }

  const token = await csrfTokenPromise;
  if (!token) csrfTokenPromise = null;

  return token;
}

export function resetCsrfToken() {
  csrfTokenPromise = null;
}

/**
 * Pulls a human-readable reason out of an error response. Frappe returns JSON
 * (`_server_messages` / `exc_type`), but a proxy in front of it returns HTML
 * (413 too large, 502/504), so the raw text is the fallback.
 */
function extractErrorDetail(raw: string): string {
  // Proxy error pages are HTML — flattened, "413 Request Entity Too Large nginx"
  // stays useful in a toast the user can read back to us.
  const fallback =
    raw
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200) || 'No response body';

  try {
    const parsed = JSON.parse(raw) as {
      _server_messages?: string;
      exception?: string;
      exc_type?: string;
      message?: unknown;
    };

    if (parsed._server_messages) {
      const messages = JSON.parse(parsed._server_messages) as string[];
      const first = messages
        .map((entry) => {
          try {
            return (JSON.parse(entry) as { message?: string }).message;
          } catch {
            return entry;
          }
        })
        .find(Boolean);
      if (first) return first;
    }

    return parsed.exception || parsed.exc_type || fallback;
  } catch {
    return fallback;
  }
}

function isCsrfFailure(status: number, raw: string): boolean {
  return status === 400 && raw.includes('CSRFTokenError');
}

/**
 * Returns the normal `{ message: ... }` envelope, or null when the body is a
 * Frappe traceback / a proxy error page instead. Some endpoints report domain
 * errors as a non-2xx status *plus* a valid envelope (417 for a wrong OTP), so
 * the envelope is what decides how a response is handled, not the status.
 */
function parseEnvelope<ResponseType>(
  raw: string
): FrappeCustomResponse<ResponseType> | null {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const isEnvelope =
      !!parsed &&
      typeof parsed === 'object' &&
      'message' in parsed &&
      !('exc_type' in parsed) &&
      !('_server_messages' in parsed) &&
      !('exception' in parsed);

    return isEnvelope ? (parsed as FrappeCustomResponse<ResponseType>) : null;
  } catch {
    return null;
  }
}

function resolve<ResponseType>(
  raw: string,
  response: Response
): FrappeCustomResponse<ResponseType> {
  const envelope = parseEnvelope<ResponseType>(raw);
  if (envelope) return envelope;

  console.error(`Request failed (${response.status}) ${response.url}: ${raw}`);

  if (!response.ok) {
    throw new ApiError(`${response.status}: ${extractErrorDetail(raw)}`);
  }

  throw new ApiError(`Malformed response (${response.status})`);
}

async function postFrappe<ResponseType>(
  request: FrappePostRequestHeader
): Promise<FrappeCustomResponse<ResponseType>> {
  const send = (csrfToken: string) =>
    fetch(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken ? { 'X-Frappe-CSRF-Token': csrfToken } : {}),
        ...request.headers,
      },
      body: JSON.stringify(request.body),
    });

  const token = await getCsrfTokenCached();
  let response = await send(token);
  // Read the body exactly once — a Response body is a stream, so a second read
  // throws "body stream already read" and hides the real failure.
  let raw = await response.text();

  // A CSRF rejection happens before the whitelisted method runs, so nothing was
  // committed and this retry cannot duplicate a submission.
  if (isCsrfFailure(response.status, raw)) {
    resetCsrfToken();
    const freshToken = await getCsrfTokenCached();
    if (freshToken && freshToken !== token) {
      response = await send(freshToken);
      raw = await response.text();
    }
  }

  return resolve<ResponseType>(raw, response);
}

async function getFrappe<ResponseType>(
  request: FrappeGetRequestHeader
): Promise<FrappeCustomResponse<ResponseType>> {
  const response = await fetch(request.url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  const raw = await response.text();

  return resolve<ResponseType>(raw, response);
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

  // login_as() starts a new session, so any cached token is now stale.
  resetCsrfToken();

  return result;
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
  return getFrappe<FrappeCsrfMessage>({ url: CSRF_URL });
};

export const logoutUser = async () => {
  try {
    return await postFrappe<CustomApiMessage>({
      url: '/api/method/nomination.api.login.logout',
      body: {},
    });
  } finally {
    resetCsrfToken();
  }
};
