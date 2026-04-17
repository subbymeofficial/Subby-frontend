import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usersService } from '../services/users.service';

/**
 * Upgrade flow: a Builder (client) converts their existing account into a
 * dual-role account by adding the Subcontractor (contractor) role.
 *
 * Flow:
 *   1. User submits trade / subtrade / location / hourly rate.
 *   2. We POST /users/me/add-contractor-role which creates a Stripe Checkout
 *      session with metadata intent "add-contractor-role".
 *   3. On success, Stripe webhook appends "contractor" to user.roles and sets
 *      availability.isAvailable = true.
 *   4. We redirect the user to the Stripe checkout URL; on return they land
 *      on the contractor dashboard.
 */
export function BecomeSubcontractor() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trade, setTrade] = useState('');
  const [subtrade, setSubtrade] = useState('');
  const [location, setLocation] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const roles = user?.roles || (user?.role ? [user.role] : []);
  if (roles.includes('contractor')) {
    navigate('/dashboard/contractor', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setErr(null);
    if (!trade.trim() || !location.trim() || !hourlyRate.trim()) {
      setErr('Please fill in trade, location and hourly rate.');
      return;
    }
    setSubmitting(true);
    try {
      const { url } = await usersService.addContractorRole({
        successUrl: window.location.origin + '/dashboard/contractor?upgraded=1',
        cancelUrl: window.location.origin + '/become-subcontractor?canceled=1',
      });
      if (!url) throw new Error('No checkout URL returned');
      // Persist onboarding profile details locally so the contractor dashboard can pick them up after return.
      try {
        localStorage.setItem('pendingContractorProfile', JSON.stringify({
          trade: trade.trim(),
          subtrade: subtrade.trim() || undefined,
          location: location.trim(),
          hourlyRate: Number(hourlyRate),
        }));
      } catch {}
      window.location.assign(url);
    } catch (e: any) {
      setErr(e?.message || 'Could not start checkout. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '40px auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 4 }}>Become a Subcontractor</h1>
      <p style={{ color: '#475569', marginBottom: 24 }}>
        Add the Subcontractor mode to your account to get discovered by Builders. You can
        switch between Builder and Subcontractor any time from the top nav.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          <span style={labelStyle}>Trade *</span>
          <input
            value={trade}
            onChange={(e) => setTrade(e.target.value)}
            placeholder="e.g. Carpenter"
            style={inputStyle}
            required
          />
        </label>

        <label>
          <span style={labelStyle}>Subtrade (optional)</span>
          <input
            value={subtrade}
            onChange={(e) => setSubtrade(e.target.value)}
            placeholder="e.g. Formwork"
            style={inputStyle}
          />
        </label>

        <label>
          <span style={labelStyle}>Location / service area *</span>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Gold Coast QLD"
            style={inputStyle}
            required
          />
        </label>

        <label>
          <span style={labelStyle}>Hourly rate (AUD) *</span>
          <input
            type="number"
            min="1"
            step="1"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="e.g. 85"
            style={inputStyle}
            required
          />
        </label>

        {err ? <div style={{ color: '#b91c1c', fontSize: 14 }}>{err}</div> : null}

        <button type="submit" disabled={submitting} style={primaryBtnStyle}>
          {submitting ? 'Starting checkout…' : 'Continue to payment'}
        </button>

        <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
          You'll be redirected to Stripe to complete your subscription. After payment your
          Subcontractor mode is unlocked immediately — you can toggle availability from your
          dashboard calendar.
        </p>
      </form>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
  color: '#0f172a',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 14,
  border: '1px solid #cbd5e1',
  borderRadius: 8,
  outline: 'none',
};

const primaryBtnStyle: React.CSSProperties = {
  marginTop: 8,
  padding: '12px 16px',
  background: '#0ea5e9',
  color: '#fff',
  fontSize: 15,
  fontWeight: 600,
  border: 'none',
  borderRadius: 10,
  cursor: 'pointer',
};

export default BecomeSubcontractor;
