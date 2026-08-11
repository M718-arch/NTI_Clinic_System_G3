import React, { useState, useRef, useEffect } from 'react';

/**
 * UserMenu
 *
 * Avatar button that opens a small dropdown with the user's name/email
 * and a working Logout action. Neither AdminLayout nor
 * ReceptionistLayout had this before — the avatar was just a static
 * image with no click handler.
 *
 * Logout calls POST /api/logout (Sanctum token revocation), then
 * always calls `onLoggedOut()` regardless of whether the request
 * succeeded — if the token's already invalid/expired server-side,
 * the user still needs to be logged out client-side, so a failed
 * revocation shouldn't trap them on the page.
 *
 * Props:
 *   token      — bearer token (required to call /api/logout)
 *   user       — { name, email, avatarUrl } (all optional)
 *   onLoggedOut — required callback; clear your stored token / redirect
 *                 to login here. This component does not know how your
 *                 app stores auth state, so it doesn't touch it directly.
 */
export default function UserMenu({ token, user, onLoggedOut }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {
      // Network error, expired token, etc. — fall through to
      // onLoggedOut() regardless, see doc comment above.
    } finally {
      setLoggingOut(false);
      onLoggedOut?.();
    }
  }

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Account menu"
        aria-expanded={open}
        style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', display: 'block' }}
      >
        {user?.avatarUrl ? (
          <img className="mg-avatar" src={user.avatarUrl} alt={user?.name || 'Account'} />
        ) : (
          <div
            className="mg-avatar"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--mg-secondary-container)', color: 'var(--mg-primary)', fontWeight: 700,
            }}
          >
            {(user?.name || 'U')[0].toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div
          className="mg-card"
          style={{
            position: 'absolute', right: 0, top: 52, width: 220, background: '#fff',
            zIndex: 90, padding: 0, overflow: 'hidden',
          }}
        >
          {(user?.name || user?.email) && (
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              {user?.name && <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>}
              {user?.email && <div className="mg-muted mg-text-sm">{user.email}</div>}
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', background: 'none',
              cursor: 'pointer', fontSize: 14, color: 'var(--mg-error)', fontWeight: 600,
            }}
          >
            {loggingOut ? 'Logging out…' : 'Log Out'}
          </button>
        </div>
      )}
    </div>
  );
}
