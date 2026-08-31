'use client';

import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import hi from '@/messages/hi.json';
import en from '@/messages/en.json';

type FormValues = Record<string, unknown>;
type LeaderRole = 'president' | 'secretary' | 'treasurer';
type LeaderLevel = 'SHG' | 'VO' | 'CLF';

const LEADER_ROLES: LeaderRole[] = ['president', 'secretary', 'treasurer'];
const LEADER_LEVELS: LeaderLevel[] = ['SHG', 'VO', 'CLF'];
const APPROVERS_TABLE = 'table_nmzc';

const s = (v: unknown, fallback = ''): string =>
  typeof v === 'string' ? v : fallback;

const formatDateTime = (dateTimeStr: unknown): string => {
  const raw = s(dateTimeStr);
  if (!raw) return '';

  const dt = new Date(raw.replace(' ', 'T'));
  if (Number.isNaN(dt.getTime())) return raw;

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(dt);
};

const splitLabel = (
  label: unknown
): { level: LeaderLevel; role: LeaderRole } | null => {
  const value = s(label).trim().toLowerCase();
  const role = LEADER_ROLES.find((item) => value.endsWith(item));
  if (!role) return null;

  const prefix = value.slice(0, -role.length).replace(/-$/, '');
  const level = LEADER_LEVELS.find((item) => item.toLowerCase() === prefix);

  return { level: level ?? 'SHG', role };
};

const levelIsComplete = (data: FormValues, level: LeaderLevel): boolean => {
  const field = `${level.toLowerCase()}_approval_by`;
  return !!s(data[field]);
};

const leaderLabel = (role: LeaderRole) => ({
  hi: s(hi?.form?.[role], role),
  en: s(en?.form?.[role], role),
});

const approvalsForLevel = (data: FormValues, level: LeaderLevel) => {
  const rows = data[APPROVERS_TABLE];
  if (!Array.isArray(rows)) return [];

  const approvals = new Map<LeaderRole, string>();
  rows.forEach((row) => {
    if (!row || typeof row !== 'object') return;

    const values = row as FormValues;
    const parsed = splitLabel(values.name1);
    if (parsed?.level === level && !approvals.has(parsed.role)) {
      approvals.set(parsed.role, formatDateTime(values.verified_on));
    }
  });

  return LEADER_ROLES.filter((role) => approvals.has(role)).map((role) => ({
    role,
    on: approvals.get(role) || '',
  }));
};

const levelHeading = (level: LeaderLevel) => {
  if (level === 'VO')
    return { hi: hi?.workflow?.vo_approval, en: en?.workflow?.vo_approval };
  if (level === 'CLF')
    return { hi: hi?.workflow?.clf_approval, en: en?.workflow?.clf_approval };
  return { hi: hi?.workflow?.shg_review, en: en?.workflow?.shg_review };
};

function ApprovalBlocks({ data }: { data: FormValues | null }) {
  if (!data) return null;

  const levels = LEADER_LEVELS.filter(
    (level) =>
      levelIsComplete(data, level) || approvalsForLevel(data, level).length > 0
  );

  if (!levels.length) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {levels.map((level) => {
        const heading = levelHeading(level);
        const approvedBy = s(data[`${level.toLowerCase()}_approval_by`]);
        const approvedOn = formatDateTime(
          data[`${level.toLowerCase()}_approved_on`]
        );
        const leaderApprovals = approvalsForLevel(data, level);

        return (
          <Box
            key={level}
            sx={{
              border: '1px solid #E5E7EB',
              bgcolor: '#F9FAFB',
              borderRadius: 2,
              p: 1.25,
            }}
          >
            <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 16, color: '#111827' }} />
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                  {s(heading.hi)} ({s(heading.en)})
                </Typography>
                {approvedBy && (
                  <Typography sx={{ fontSize: 12, color: '#6B7280' }}>
                    {s(en?.workflow?.approved_by)} {approvedBy}
                    {approvedOn ? ` ${s(en?.workflow?.on)} ${approvedOn}` : ''}
                  </Typography>
                )}
              </Box>
            </Box>

            {leaderApprovals.length > 0 && (
              <Box sx={{ mt: 0.75, pl: 3 }}>
                {leaderApprovals.map((approval) => {
                  const label = leaderLabel(approval.role);
                  return (
                    <Typography
                      key={approval.role}
                      sx={{ fontSize: 12, color: '#6B7280' }}
                    >
                      {s(en?.workflow?.reviewed_by)}: {label.en}
                      {approval.on
                        ? ` ${s(en?.workflow?.on)} ${approval.on}`
                        : ''}
                    </Typography>
                  );
                })}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

export default ApprovalBlocks;
