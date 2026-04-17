import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Compact pill-toggle shown in the top nav for users who have both Builder
 * (client) and Subcontractor (contractor) roles unlocked.
 *
 * Clicking swaps activeRole via the backend, then routes the user to the
 * dashboard for the newly-active role.
 */
export function RoleSwitcher() {
  const { user, switchRole } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  if (!user) return null;
  const roles = user.roles || (user.role ? [user.role] : []);
  if (roles.length < 2) return null;

  const active = user.activeRole || user.role;
  const isBuilder = active === 'client';

  async function handleSwitch(target: 'client' | 'contractor') {
    if (busy || target === active) return;
    setBusy(true);
    try {
      await switchRole(target);
      navigate(target === 'client' ? '/dashboard/builder' : '/dashboard/contractor');
    } catch (e) {
      console.error('Failed to switch role', e);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="group"
      aria-label="Switch between Builder and Subcontractor"
      style={{
        display: 'inline-flex',
        borderRadius: 999,
        background: '#f1f5f9',
        padding: 2,
        marginRight: 12,
        opacity: busy ? 0.6 : 1,
      }}
    >
      <button
        type="button"
        onClick={() => handleSwitch('client')}
        aria-pressed={isBuilder}
        disabled={busy}
        style={pillStyle(isBuilder)}
      >
        Builder
      </button>
      <button
        type="button"
        onClick={() => handleSwitch('contractor')}
        aria-pressed={!isBuilder}
        disabled={busy}
        style={pillStyle(!isBuilder)}
      >
        Subcontractor
      </button>
    </div>
  );
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    border: 'none',
    background: active ? '#0ea5e9' : 'transparent',
    color: active ? '#fff' : '#0f172a',
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    borderRadius: 999,
    cursor: 'pointer',
    transition: 'background 120ms ease',
  };
}
