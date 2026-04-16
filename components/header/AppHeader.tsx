'use client';

import {
  Box,
  Typography,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LogoutIcon from '@mui/icons-material/Logout';
import DualLanguageText from '@/components/DualLanguageText';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';
import { addToast } from '@/components/error/toastStore';
import {
  getUserRoles,
  getUserInfo,
  clearAllUserCaches,
} from '@/app/utils/user';
import { storage } from '@/app/utils/localStorage';
import { logoutUser } from '@/services/api';

type AppHeaderProps = {
  showBack?: boolean;
  onBack?: () => void;
  showUser?: boolean;
  userName?: string;
  h1?: string;
  h2?: string;
};

type UserInfo = {
  full_name?: string;
  mobile_no?: string;
  email?: string;
  profile?: string;
} & Record<string, unknown>;

export default function AppHeader({
  showBack = false,
  onBack,
  showUser = false,
  userName,
  h1,
  h2,
}: AppHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const [roles, setRoles] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const result = await logoutUser();

      if (result.message.status) {
        addToast({
          type: 'success',
          hi: hi?.header?.logout_success,
          en: en?.header?.logout_success,
        });
      } else {
        addToast({
          type: 'error',
          hi: hi?.header?.logout_failed,
          en: en?.header?.logout_failed,
        });
      }
    } catch (error) {
      console.error('Failed to logout from backend', error);
      addToast({
        type: 'error',
        hi: hi?.header?.logout_server_failed,
        en: en?.header?.logout_server_failed,
      });
    } finally {
      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName);
      });
      clearAllUserCaches();
      storage.clear();
      sessionStorage.clear();

      handleClose();
      router.push('/login');
    }
  };

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const r = await getUserRoles();

        const allowedRoles = ['SHG', 'VO', 'CLF'];

        const filtered = r.filter((role) => allowedRoles.includes(role));

        setRoles(filtered);
      } catch (err) {
        console.error('Failed to load roles', err);
      }
    };

    const getUserDetails = async () => {
      try {
        const res = await getUserInfo();
        const message = res[0] as unknown;
        if (typeof message === 'object' && message !== null) {
          setUserInfo(message as UserInfo);
        }
      } catch (err) {
        console.log('Failed to load user info', err);
      }
    };

    loadRoles();
    getUserDetails();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: '#fff',
        flexShrink: 0,
      }}
    >
      {showBack && (
        <IconButton onClick={onBack}>
          <ArrowBackIcon />
        </IconButton>
      )}

      {showUser && (
        <>
          <IconButton onClick={handleAvatarClick} sx={{ p: 0 }}>
            <Avatar src={userInfo?.profile ?? '/images/user.png'} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                borderRadius: 3,
                mt: 1,
                minWidth: 150,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <MenuItem
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                mx: 0.5,
                my: 0.5,
                '&:hover': {
                  backgroundColor: '#F3F4F6',
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit" sx={{ fontWeight: 500 }}>
                <DualLanguageText
                  h1={hi?.header?.logout}
                  h2={en?.header?.logout}
                  h1style={{ fontSize: 14, fontWeight: 600 }}
                  h2style={{ fontSize: 12 }}
                />
              </Typography>
            </MenuItem>
          </Menu>

          <Box>
            <Typography fontSize={12} color="text.secondary">
              {roles.length > 0
                ? `${roles.join(', ')} ${hi?.header?.user}`
                : hi?.header?.user}
            </Typography>
            <Typography fontWeight={700}>
              {userInfo?.full_name ?? 'guest'}
            </Typography>
          </Box>
        </>
      )}

      {!showUser && h1 && (
        <Box>
          <DualLanguageText
            h1={h1}
            h2={h2}
            h1style={{ fontSize: 14, fontWeight: 600 }}
            h2style={{ fontSize: 12 }}
          />
        </Box>
      )}
    </Box>
  );
}
