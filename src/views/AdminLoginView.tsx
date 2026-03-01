import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../controllers/AuthContext'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .admin-login-wrap {
    min-height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, #0d1b2a 0%, #1b2838 55%, #0d1f30 100%);
    font-family: 'Plus Jakarta Sans', sans-serif;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }

  /* Background decoration */
  .admin-login-wrap::before {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 55% 45% at 15% 25%, rgba(233,196,106,0.08) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 85% 75%, rgba(10,147,150,0.1) 0%, transparent 70%);
  }

  .adl-deco { position: absolute; border-radius: 50%; pointer-events: none; }
  .adl-deco-1 { width: 320px; height: 320px; top: -100px; right: -80px; border: 1px solid rgba(233,196,106,0.08); }
  .adl-deco-2 { width: 180px; height: 180px; bottom: -50px; left: -50px; border: 1px solid rgba(10,147,150,0.1); }
  .adl-deco-3 { width: 480px; height: 480px; top: -180px; right: -180px; border: 1px solid rgba(233,196,106,0.04); }

  /* Card */
  .admin-login-card {
    width: 100%; max-width: 400px;
    background: rgba(255,255,255,0.97);
    border-radius: 22px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.2);
    overflow: hidden;
    position: relative; z-index: 1;
    animation: adlCardIn 0.35s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes adlCardIn {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)   scale(1); }
  }

  /* Brand bar — navy + gold accent */
  .adl-brand {
    background: linear-gradient(135deg, #1b2838 0%, #0d1b2a 100%);
    padding: 28px 28px 24px; text-align: center;
    border-bottom: 3px solid #e9c46a;
  }
  .adl-brand-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(233,196,106,0.15);
    border: 1.5px solid rgba(233,196,106,0.35);
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 22px; color: #e9c46a; margin-bottom: 12px;
  }
  .adl-brand-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(233,196,106,0.12); border: 1px solid rgba(233,196,106,0.25);
    color: #e9c46a; font-size: 10px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    padding: 3px 10px; border-radius: 20px; margin-bottom: 10px;
  }
  .adl-brand-name {
    font-size: 18px; font-weight: 800; color: white;
    letter-spacing: -0.01em; margin: 0; line-height: 1.1;
  }
  .adl-brand-sub {
    font-size: 11px; font-weight: 500;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase; letter-spacing: 0.12em; margin-top: 4px;
  }

  /* Form body */
  .adl-body { padding: 28px; }

  .adl-section-title {
    font-size: 15px; font-weight: 700; color: #1b2838;
    margin: 0 0 4px; text-align: center;
  }
  .adl-section-sub {
    font-size: 12px; color: #6c757d;
    text-align: center; margin: 0 0 24px;
  }

  /* Alert */
  .adl-alert {
    display: flex; align-items: center; gap: 9px;
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 10px;
    padding: 11px 14px; color: #b91c1c; font-size: 13px;
    margin-bottom: 18px; animation: adlShake 0.3s ease;
  }
  @keyframes adlShake {
    0%,100% { transform: translateX(0); }
    25%      { transform: translateX(-6px); }
    75%      { transform: translateX(6px); }
  }

  /* Fields */
  .adl-field { margin-bottom: 16px; }
  .adl-field label {
    display: block; font-size: 11px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.05em;
    color: #6c757d; margin-bottom: 6px;
  }
  .adl-input-wrap { position: relative; }
  .adl-input-wrap > i {
    position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
    color: #e9c46a; font-size: 15px; pointer-events: none;
  }
  .adl-input {
    width: 100%; padding: 10px 12px 10px 38px;
    border: 1.5px solid #dee2e6; border-radius: 10px;
    font-size: 14px; font-family: inherit; background: #fafafa;
    outline: none; transition: border-color 0.18s, box-shadow 0.18s;
    box-sizing: border-box;
  }
  .adl-input:focus {
    border-color: #1b2838; background: white;
    box-shadow: 0 0 0 3px rgba(27,40,56,0.1);
  }
  .adl-pw-toggle {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer;
    color: #adb5bd; font-size: 15px; padding: 0; transition: color 0.15s;
  }
  .adl-pw-toggle:hover { color: #1b2838; }

  /* Submit btn */
  .adl-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 12px;
    border-radius: 11px; border: none;
    background: linear-gradient(135deg, #2a3f5f, #0d1b2a);
    color: white; font-size: 14px; font-weight: 700;
    font-family: inherit; cursor: pointer;
    box-shadow: 0 4px 14px rgba(13,27,42,0.4);
    transition: opacity 0.18s, transform 0.12s;
    margin-top: 4px; position: relative; overflow: hidden;
  }
  .adl-btn::after {
    content: '';
    position: absolute; top: 0; left: 0; right: 0;
    height: 1px; background: linear-gradient(90deg, transparent, rgba(233,196,106,0.5), transparent);
  }
  .adl-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(13,27,42,0.5); }
  .adl-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .adl-btn i { color: #e9c46a; }

  .adl-spinner {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.25); border-top-color: #e9c46a;
    animation: adlspin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes adlspin { to { transform: rotate(360deg); } }

  /* Footer */
  .adl-footer { margin-top: 20px; text-align: center; }
  .adl-back-link {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 10px;
    border: 1.5px solid #dee2e6; background: #f8fafc;
    color: #495057; font-size: 13px; font-weight: 600;
    text-decoration: none; transition: border-color 0.18s, background 0.18s, color 0.18s;
  }
  .adl-back-link:hover {
    border-color: #0a9396; background: #e8f4f5; color: #0d4f5c;
  }
  .adl-back-link i { color: #0a9396; font-size: 14px; }

  .adl-security-note {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    font-size: 11px; color: #adb5bd; margin-top: 16px;
  }
  .adl-security-note i { font-size: 12px; color: #e9c46a; }
`

export function AdminLoginView() {
  const [usuario, setUsuario]       = useState('')
  const [contrasena, setContrasena] = useState('')
  const [showPw, setShowPw]         = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(false)

  const { login } = useAuth() // 🔥 ahora es login normal
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(usuario, contrasena)
      navigate('/admin') // siempre admin
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined

      setError(msg || 'Credenciales inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-wrap">
      <style>{styles}</style>

      {/* Card */}
      <div className="admin-login-card">

        {/* Brand */}
        <div className="adl-brand">
          <div className="adl-brand-icon">
            <i className="bi bi-shield-lock-fill" />
          </div>
          <p className="adl-brand-name">Panel Administrativo</p>
          <p className="adl-brand-sub">Acceso exclusivo para administradores</p>
        </div>

        {/* Body */}
        <div className="adl-body">

          {error && (
            <div className="adl-alert">
              <i className="bi bi-exclamation-triangle-fill" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="adl-field">
              <label>Usuario</label>
              <div className="adl-input-wrap">
                <i className="bi bi-person-badge-fill" />
                <input
                  className="adl-input"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="adl-field">
              <label>Contraseña</label>
              <div className="adl-input-wrap">
                <i className="bi bi-key-fill" />
                <input
                  className="adl-input"
                  type={showPw ? 'text' : 'password'}
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  className="adl-pw-toggle"
                  onClick={() => setShowPw(!showPw)}
                >
                  <i className={`bi bi-eye${showPw ? '-slash' : ''}-fill`} />
                </button>
              </div>
            </div>

            <button type="submit" className="adl-btn" disabled={loading}>
              {loading
                ? 'Verificando...'
                : 'Ingresar al Panel'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
