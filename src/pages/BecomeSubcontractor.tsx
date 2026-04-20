import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { usersService } from '../services/users.service';

// Regional pricing (timezone-based region detection; AU vs rest-of-world)
const __IS_AU = typeof window !== 'undefined' && /Australia/i.test(
  (typeof Intl !== 'undefined' ? (Intl.DateTimeFormat().resolvedOptions().timeZone || '') : '')
);
const STANDARD_PRICE_TXT = __IS_AU ? '$15 AUD' : '$10 USD';
const PREMIUM_PRICE_TXT  = __IS_AU ? '$25 AUD' : '$18 USD';


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
  const [acceptTerms, setAcceptTerms] = useState(false);
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
    if (!acceptTerms) {
      setErr('Please agree to the Subscription Terms to continue.');
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
      <p style={{ color: '#475569', marginBottom: 16 }}>
        Add the Subcontractor mode to your account to get discovered by Builders. You can
        switch between Builder and Subcontractor any time from the top nav.
      </p>

      <div style={paywallBoxStyle}>
        <p style={{ fontWeight: 700, margin: 0, color: '#92400e' }}>
          Subcontractor subscription â {STANDARD_PRICE_TXT}/week (Standard) or {PREMIUM_PRICE_TXT}/week (Premium)
        </p>
        <ul style={{ margin: '8px 0 0 20px', padding: 0, color: '#78350f', fontSize: 14, lineHeight: 1.5 }}>
          <li>Billed weekly via Stripe, auto-renews until you cancel.</li>
          <li>Cancel anytime from your dashboard â access continues until the end of the paid week.</li>
          <li>No refunds for partial weeks.</li>
          <li>
            Full details:{' '}
            <Link to="/terms" target="_blank" style={{ color: '#92400e', textDecoration: 'underline' }}>Terms of Service</Link>
            {' Â· '}
            <Link to="/privacy" target="_blank" style={{ color: '#92400e', textDecoration: 'underline' }}>Privacy Policy</Link>
          </li>
        </ul>
      </div>

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

        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#334155' }}>
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setAcceptTerms(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          <span>
            I agree to the{' '}
            <Link to="/terms" target="_blank" style={{ color: '#0ea5e9' }}>Subscription Terms</Link>
            {' and '}
            <Link to="/privacy" target="_blank" style={{ color: '#0ea5e9' }}>Privacy Policy</Link>, and I understand my card will be
            charged {STANDARD_PRICE_TXT} weekly (Standard) or {PREMIUM_PRICE_TXT} weekly (Premium, if selected) until I cancel.
          </span>
        </label>

        {err ? <div style={{ color: '#b91c1c', fontSize: 14 }}>{err}</div> : null}

        <button type="submit" disabled={submitting || !acceptTerms} style={{ ...primaryBtnStyle, opacity: submitting || !acceptTerms ? 0.6 : 1, cursor: submitting || !acceptTerms ? 'not-allowed' : 'pointer' }}>
          {submitting ? 'Starting checkoutâ¦' : `Continue to Stripe (${STANDARD_PRICE_TXT}/wk)`}
        </button>

        <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
          You'll be redirected to Stripe to complete your subscription. After payment your
          Subcontractor mode is unlocked immediately â you can toggle availability from your
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

const paywallBoxStyle: React.CSSProperties = {
  background: '#fffbeb',
  border: '1px solid #fcd34d',
  borderRadius: 10,
  padding: '12px 16px',
  marginBottom: 20,
};

export default BecomeSubcontractor;
