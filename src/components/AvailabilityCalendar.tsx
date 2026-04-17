import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateAvailability } from '../services/users.service';

/**
 * Contractor availability widget.
 *
 *  - "Available now" master toggle -> gates directory visibility entirely.
 *  - A mini month calendar where the contractor can tap individual days
 *    to mark them as "busy" (excluded from availability).
 *
 * Changes persist to PATCH /users/me/availability with debouncing so a burst
 * of toggles doesn't flood the API.
 */
export function AvailabilityCalendar() {
  const { user, refreshUser } = useAuth();
  const [isAvailable, setIsAvailable] = useState<boolean>(
    !!user?.availability?.isAvailable,
  );
  const [busyDates, setBusyDates] = useState<Set<string>>(() => {
    const init = user?.availability?.busyDates || [];
    return new Set(init.map((d: string | Date) => toDateKey(new Date(d))));
  });
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    const handle = setTimeout(async () => {
      setSaving(true);
      try {
        await updateAvailability({
          isAvailable,
          busyDates: Array.from(busyDates).map((k) => new Date(k)),
        });
        setSavedAt(new Date());
        if (refreshUser) await refreshUser();
      } catch (e) {
        console.error('Failed to save availability', e);
      } finally {
        setSaving(false);
      }
    }, 500);
    return () => clearTimeout(handle);
  }, [isAvailable, busyDates]);

  const monthGrid = useMemo(() => buildMonthGrid(viewMonth), [viewMonth]);

  function toggleDay(d: Date) {
    const key = toDateKey(d);
    setBusyDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div style={card}>
      <div style={headerRow}>
        <div>
          <h3 style={{ margin: 0, fontSize: 18 }}>Availability</h3>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            You only appear in the Subcontractor directory while "Available now" is on.
          </p>
        </div>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {isAvailable ? 'Available now' : 'Unavailable'}
          </span>
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            style={{ width: 36, height: 20 }}
          />
        </label>
      </div>

      <div style={monthNav}>
        <button onClick={() => setViewMonth(addMonths(viewMonth, -1))} style={navBtn} type="button">
          ‹
        </button>
        <div style={{ fontWeight: 600 }}>
          {viewMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} style={navBtn} type="button">
          ›
        </button>
      </div>

      <div style={grid7}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} style={dayHeader}>{d}</div>
        ))}
        {monthGrid.map((cell, i) => {
          if (!cell) return <div key={i} />;
          const key = toDateKey(cell);
          const busy = busyDates.has(key);
          const isToday = toDateKey(new Date()) === key;
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(cell)}
              style={dayStyle(busy, isToday)}
              aria-pressed={busy}
              aria-label={cell.toDateString() + (busy ? ' busy' : ' available')}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 12, color: '#64748b', marginTop: 8 }}>
        {saving
          ? 'Saving…'
          : savedAt
          ? 'Saved ' + savedAt.toLocaleTimeString()
          : 'Tap a day to mark busy.'}
      </div>
    </div>
  );
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function buildMonthGrid(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  const firstWeekday = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const card: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 12,
  padding: 16,
  background: '#fff',
  maxWidth: 420,
};

const headerRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 12,
  marginBottom: 12,
};

const monthNav: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  margin: '8px 0',
};

const navBtn: React.CSSProperties = {
  border: '1px solid #cbd5e1',
  background: '#fff',
  padding: '4px 10px',
  borderRadius: 6,
  cursor: 'pointer',
};

const grid7: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 4,
};

const dayHeader: React.CSSProperties = {
  textAlign: 'center',
  fontSize: 11,
  color: '#64748b',
  padding: '4px 0',
};

function dayStyle(busy: boolean, today: boolean): React.CSSProperties {
  return {
    border: today ? '2px solid #0ea5e9' : '1px solid #e2e8f0',
    background: busy ? '#fee2e2' : '#f8fafc',
    color: busy ? '#991b1b' : '#0f172a',
    padding: '8px 0',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  };
}

export default AvailabilityCalendar;
