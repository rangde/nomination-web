import Cookies from 'js-cookie';
import { getRoles, getUserDetails } from '@/services/api';
import { storage } from './localStorage';

type RolesCache = {
  userId: string;
  roles: string[];
  cachedAt: number;
};

type UserInfoCache = {
  userId: string;
  userInfo: string[];
  cachedAt: number;
};

const USER_ID_COOKIE_KEY = 'user_id';
const LS_KEY_PREFIX = 'roles:';
const USER_INFO_KEY_PREFIX = 'userInfo:';

const normalizeRoles = (msg: string | string[]): string[] => {
  if (Array.isArray(msg)) return msg;

  return msg
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
};

const userId = Cookies.get(USER_ID_COOKIE_KEY);

export const getUserRoles = async (): Promise<string[]> => {
  if (!userId) return [];

  const key = `${LS_KEY_PREFIX}${userId}`;

  const cached = storage.get<RolesCache>(key);
  if (cached && cached.userId === userId && cached.roles.length > 0) {
    return cached.roles;
  }

  const res = await getRoles();
  const roles = normalizeRoles(res.message.msg);

  storage.set<RolesCache>(key, {
    userId,
    roles,
    cachedAt: Date.now(),
  });

  return roles;
};

export const clearUserRolesCache = (): void => {
  const userId = Cookies.get(USER_ID_COOKIE_KEY);
  if (!userId) return;

  storage.remove(`${LS_KEY_PREFIX}${userId}`);
};

export const getUserInfo = async (): Promise<string[]> => {
  if (!userId) return [];

  const key = `${USER_INFO_KEY_PREFIX}${userId}`;

  const cached = storage.get<UserInfoCache>(key);
  if (cached && cached.userId === userId && cached.userInfo.length > 0) {
    return cached.userInfo;
  }

  const res = await getUserDetails();
  const userInfo = normalizeRoles(res.message.msg);

  storage.set<UserInfoCache>(key, {
    userId,
    userInfo,
    cachedAt: Date.now(),
  });

  return userInfo;
};

export const clearUserInfoCache = (): void => {
  const userId = Cookies.get(USER_ID_COOKIE_KEY);
  if (!userId) return;

  storage.remove(`${USER_INFO_KEY_PREFIX}${userId}`);
};

export const clearAllUserCaches = (): void => {
  const userId = Cookies.get(USER_ID_COOKIE_KEY);
  if (!userId) return;

  storage.remove(`${LS_KEY_PREFIX}${userId}`);
  storage.remove(`${USER_INFO_KEY_PREFIX}${userId}`);
};
