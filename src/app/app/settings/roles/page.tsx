'use client';

import { useState, useEffect } from 'react';

type Role = 'owner' | 'admin' | 'analyst' | 'viewer';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
}

interface CustomRole {
  id: string;
  name: string;
  permissions: Record<string, boolean>;
}

const FEATURES = ['Triage', 'Incidents', 'Webhooks', 'API Keys', 'Settings'] as const;

const PERMISSIONS: Record<Role, Record<string, boolean>> = {
  owner:   { Triage: true,  Incidents: true,  Webhooks: true,  'API Keys': true,  Settings: true },
  admin:   { Triage: true,  Incidents: true,  Webhooks: true,  'API Keys': true,  Settings: false },
  analyst: { Triage: true,  Incidents: true,  Webhooks: false, 'API Keys': false, Settings: false },
  viewer:  { Triage: false, Incidents: false, Webhooks: false, 'API Keys': false, Settings: false },
};

const ROLE_COLORS: Record<Role, string> = {
  owner: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
  admin: 'bg-indigo-400/15 text-indigo-400 border-indigo-400/30',
  analyst: 'bg-emerald-400/15 text-emerald-400 border-emerald-400/30',
  viewer: 'bg-zinc-400/15 text-zinc-400 border-zinc-400/30',
};

const ROLE_LABELS: Record<Role, string> = {
  owner: 'Owner',
  admin: 'Admin',
  analyst: 'Analyst',
  viewer: 'Viewer',
};

const STORAGE_KEY_MEMBERS = 'att_team_members';
const STORAGE_KEY_CUSTOM_ROLES = 'att_custom_roles';

const DEFAULT_MEMBERS: TeamMember[] = [
  { id: 'u1', name: 'Sarah Chen', email: 'sarah@company.com', avatar: 'SC', role: 'owner' },
  { id: 'u2', name: 'Marcus Johnson', email: 'marcus@company.com', avatar: 'MJ', role: 'admin' },
  { id: 'u3', name: 'Priya Patel', email: 'priya@company.com', avatar: 'PP', role: 'analyst' },
  { id: 'u4', name: 'Alex Rivera', email: 'alex@company.com', avatar: 'AR', role: 'analyst' },
  { id: 'u5', name: 'Jordan Kim', email: 'jordan@company.com', avatar: 'JK', role: 'viewer' },
];

function RoleBadge({ role }: { role: Role }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[role]}`}>
      {ROLE_LABELS[role]}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-5 h-5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function RolesPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newPermissions, setNewPermissions] = useState<Record<string, boolean>>(
    Object.fromEntries(FEATURES.map((f) => [f, false]))
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const storedMembers = localStorage.getItem(STORAGE_KEY_MEMBERS);
      setMembers(storedMembers ? JSON.parse(storedMembers) : DEFAULT_MEMBERS);
      const storedRoles = localStorage.getItem(STORAGE_KEY_CUSTOM_ROLES);
      setCustomRoles(storedRoles ? JSON.parse(storedRoles) : []);
    } catch {
      setMembers(DEFAULT_MEMBERS);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY_MEMBERS, JSON.stringify(members));
    }
  }, [members, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_ROLES, JSON.stringify(customRoles));
    }
  }, [customRoles, mounted]);

  const changeRole = (memberId: string, newRole: Role) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  const createCustomRole = () => {
    if (!newRoleName.trim()) return;
    const role: CustomRole = {
      id: `cr-${Date.now()}`,
      name: newRoleName.trim(),
      permissions: { ...newPermissions },
    };
    setCustomRoles((prev) => [...prev, role]);
    setNewRoleName('');
    setNewPermissions(Object.fromEntries(FEATURES.map((f) => [f, false])));
    setShowForm(false);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/app/settings" className="text-zinc-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </a>
          <div>
            <h1 className="text-2xl font-bold text-white">Roles & Permissions</h1>
            <p className="text-sm text-zinc-400 mt-1">Manage team access with role-based controls</p>
          </div>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Permissions Matrix
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Feature</th>
                {(['owner', 'admin', 'analyst', 'viewer'] as Role[]).map((role) => (
                  <th key={role} className="px-6 py-3 text-center">
                    <RoleBadge role={role} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((feature, idx) => (
                <tr
                  key={feature}
                  className={`border-b border-zinc-800/50 ${idx % 2 === 0 ? 'bg-zinc-900/20' : ''}`}
                >
                  <td className="px-6 py-3 text-sm text-white font-medium">{feature}</td>
                  {(['owner', 'admin', 'analyst', 'viewer'] as Role[]).map((role) => (
                    <td key={role} className="px-6 py-3 text-center">
                      {PERMISSIONS[role][feature] ? <CheckIcon /> : <XIcon />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Roles */}
      {customRoles.length > 0 && (
        <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Custom Roles</h2>
          <div className="space-y-3">
            {customRoles.map((cr) => (
              <div key={cr.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-800">
                <div>
                  <span className="text-sm text-white font-medium">{cr.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    {FEATURES.filter((f) => cr.permissions[f]).map((f) => (
                      <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-300">{f}</span>
                    ))}
                    {FEATURES.every((f) => !cr.permissions[f]) && (
                      <span className="text-[10px] text-zinc-500">No permissions</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setCustomRoles((prev) => prev.filter((r) => r.id !== cr.id))}
                  className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Custom Role */}
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 p-6">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Custom Role
          </button>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-semibold text-white">New Custom Role</h3>
            <input
              type="text"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Role name (e.g., On-Call Lead)"
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500/50"
            />
            <div className="space-y-2">
              <p className="text-xs text-zinc-400">Select permissions:</p>
              {FEATURES.map((feature) => (
                <label key={feature} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/30 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPermissions[feature]}
                    onChange={(e) =>
                      setNewPermissions((prev) => ({ ...prev, [feature]: e.target.checked }))
                    }
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-green-500 focus:ring-green-500/30"
                  />
                  <span className="text-sm text-white">{feature}</span>
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={createCustomRole}
                disabled={!newRoleName.trim()}
                className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Role
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewRoleName('');
                  setNewPermissions(Object.fromEntries(FEATURES.map((f) => [f, false])));
                }}
                className="px-4 py-2 rounded-lg border border-zinc-800 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="border border-zinc-800 rounded-lg bg-zinc-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            Team Members ({members.length})
          </h2>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                  member.role === 'owner' ? 'bg-amber-400/20 text-amber-400' :
                  member.role === 'admin' ? 'bg-indigo-400/20 text-indigo-400' :
                  member.role === 'analyst' ? 'bg-emerald-400/20 text-emerald-400' :
                  'bg-zinc-400/20 text-zinc-400'
                }`}>
                  {member.avatar}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">{member.name}</div>
                  <div className="text-xs text-zinc-500">{member.email}</div>
                </div>
              </div>
              <select
                value={member.role}
                onChange={(e) => changeRole(member.id, e.target.value as Role)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-green-500/50 cursor-pointer"
              >
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="analyst">Analyst</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
