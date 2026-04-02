import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../controllers/AuthContext'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

const sidebarStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  :root {
    --sidebar-width: 240px;
    --sidebar-bg: #0d4f5c;
    --sidebar-accent: #0a9396;
    --sidebar-hover: rgba(10, 147, 150, 0.18);
    --sidebar-active-bg: #0a9396;
    --sidebar-text: rgba(255,255,255,0.75);
    --sidebar-text-active: #ffffff;
    --sidebar-border: rgba(255,255,255,0.08);
    --badge-bg: #94d2bd;
    --badge-text: #001219;
  }

  * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }

  body { margin: 0; background: #f0f4f5; }

  .cec-layout {
    display: flex;
    min-height: 100vh;
  }

  /* ─── SIDEBAR ─── */
  .cec-sidebar {
    width: var(--sidebar-width);
    min-height: 100vh;
    background: linear-gradient(180deg, #0d4f5c 0%, #093744 100%);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    box-shadow: 4px 0 24px rgba(0,0,0,0.18);
    transition: transform 0.3s ease;
  }

  /* Brand */
  .cec-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 22px 20px 18px;
    border-bottom: 1px solid var(--sidebar-border);
    text-decoration: none !important;
  }
  .cec-brand-icon {
    width: 36px; height: 36px;
    background: var(--sidebar-active-bg);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: white;
    flex-shrink: 0;
  }
  .cec-brand-text { line-height: 1.1; }
  .cec-brand-text span:first-child {
    display: block;
    font-size: 13px; font-weight: 700;
    color: white; letter-spacing: 0.04em;
  }
  .cec-brand-text span:last-child {
    font-size: 10px; font-weight: 500;
    color: var(--sidebar-accent); letter-spacing: 0.08em; text-transform: uppercase;
  }

  /* User card */
  .cec-user-card {
    display: flex; align-items: center; gap-10px;
    padding: 14px 16px;
    margin: 12px 12px 4px;
    background: rgba(255,255,255,0.06);
    border-radius: 12px;
    border: 1px solid var(--sidebar-border);
    gap: 10px;
  }
  .cec-user-avatar {
    width: 36px; height: 36px;
    background: var(--sidebar-active-bg);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 15px; flex-shrink: 0;
  }
  .cec-user-info { flex: 1; overflow: hidden; }
  .cec-user-info .name {
    font-size: 12px; font-weight: 600; color: white;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .cec-role-badge {
    display: inline-block;
    font-size: 9px; font-weight: 700;
    padding: 2px 7px; border-radius: 20px;
    background: var(--badge-bg); color: var(--badge-text);
    letter-spacing: 0.06em; text-transform: uppercase; margin-top: 2px;
  }

  /* Nav section label */
  .cec-nav-label {
    padding: 14px 20px 6px;
    font-size: 9px; font-weight: 700;
    color: rgba(255,255,255,0.35);
    letter-spacing: 0.12em; text-transform: uppercase;
  }

  /* Nav links */
  .cec-nav { list-style: none; margin: 0; padding: 0 10px; flex: 1; }
  .cec-nav li { margin-bottom: 2px; }

  .cec-nav-link {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px;
    border-radius: 10px;
    color: var(--sidebar-text) !important;
    text-decoration: none !important;
    font-size: 13px; font-weight: 500;
    transition: background 0.18s, color 0.18s, transform 0.12s;
    position: relative;
  }
  .cec-nav-link i { font-size: 15px; flex-shrink: 0; width: 18px; text-align: center; }
  .cec-nav-link:hover {
    background: var(--sidebar-hover);
    color: var(--sidebar-text-active) !important;
    transform: translateX(2px);
  }
  .cec-nav-link.active {
    background: var(--sidebar-active-bg) !important;
    color: white !important;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(10,147,150,0.35);
  }
  .cec-nav-link.active::before {
    content: '';
    position: absolute; left: -10px; top: 50%; transform: translateY(-50%);
    width: 3px; height: 60%; background: #94d2bd; border-radius: 0 2px 2px 0;
  }

  /* Divider */
  .cec-divider {
    height: 1px; background: var(--sidebar-border);
    margin: 8px 16px;
  }

  /* Bottom / logout */
  .cec-sidebar-footer {
    padding: 12px;
    border-top: 1px solid var(--sidebar-border);
  }
  .cec-logout-btn {
    display: flex; align-items: center; gap: 10px;
    width: 100%; padding: 9px 12px;
    border-radius: 10px; border: none;
    background: rgba(231, 111, 81, 0.12);
    color: #e9c46a;
    font-size: 13px; font-weight: 600;
    cursor: pointer;
    transition: background 0.18s, transform 0.12s;
  }
  .cec-logout-btn:hover {
    background: rgba(231, 111, 81, 0.25);
    transform: translateX(2px);
  }
  .cec-logout-btn i { font-size: 15px; }

  /* ─── MAIN CONTENT ─── */
  .cec-main {
    margin-left: var(--sidebar-width);
    flex: 1;
    padding: 28px 32px;
    min-height: 100vh;
  }

  /* ─── MOBILE TOGGLE ─── */
  .cec-mobile-toggle {
    display: none;
    position: fixed; top: 14px; left: 14px; z-index: 1100;
    width: 40px; height: 40px;
    background: var(--sidebar-bg);
    border: none; border-radius: 10px;
    color: white; font-size: 18px;
    align-items: center; justify-content: center;
    cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }

  @media (max-width: 768px) {
    .cec-sidebar { transform: translateX(-100%); }
    .cec-sidebar.open { transform: translateX(0); }
    .cec-main { margin-left: 0; padding: 20px 16px; padding-top: 70px; }
    .cec-mobile-toggle { display: flex; }
    .cec-overlay.open { display: block; }
    body { overflow-x: hidden; }
  }

  @media (max-width: 480px) {
    .cec-main { padding: 14px 10px; padding-top: 64px; }
    .cec-nav-link { font-size: 12px; padding: 8px 10px; }
  }

  /* ─── OVERLAY ─── */
  .cec-overlay {
    display: none;
    position: fixed; inset: 0; z-index: 999;
    background: rgba(0,0,0,0.42);
    cursor: pointer;
  }
`

export function Layout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, rolAdmin, nombreAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const closeSidebar = () => {
    document.querySelector('.cec-sidebar')?.classList.remove('open')
    document.querySelector('.cec-overlay')?.classList.remove('open')
  }

  const toggleSidebar = () => {
    document.querySelector('.cec-sidebar')?.classList.toggle('open')
    document.querySelector('.cec-overlay')?.classList.toggle('open')
  }

  return (
    <>
      <style>{sidebarStyles}</style>

      {/* Mobile toggle */}
      <button className="cec-mobile-toggle" onClick={toggleSidebar}>
        <i className="bi bi-list" />
      </button>

      <div className="cec-overlay" onClick={closeSidebar} />
      <div className="cec-layout">

        {/* ── SIDEBAR ── */}
        <aside className="cec-sidebar">

          {/* Brand */}
          <NavLink className="cec-brand" to="/admin">
            <div className="cec-brand-icon">
              <i className="bi bi-mortarboard-fill" />
            </div>
            <div className="cec-brand-text">
              <span>Intranet CEC</span>
              <span>Administrador</span>
            </div>
          </NavLink>

          {/* User card */}
          {isAuthenticated && (
            <div className="cec-user-card">
              <div className="cec-user-avatar">
                <i className="bi bi-person-fill" />
              </div>
              <div className="cec-user-info">
                <div className="name">{nombreAdmin || 'Administrador'}</div>
                <span className="cec-role-badge" style={{
                  background: rolAdmin === 'general' ? '#0a9396' : rolAdmin === 'academico' ? '#5c40b0' : '#856404',
                  color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 6, textTransform: 'uppercase'
                }}>
                  {rolAdmin === 'general' ? 'GENERAL' : rolAdmin === 'academico' ? 'ACADÉMICO' : 'PAGOS'}
                </span>
              </div>
            </div>
          )}

          {/* ── ADMIN nav ── */}
          {isAuthenticated && (
            <>
              <div className="cec-nav-label">Administración</div>
              <ul className="cec-nav" onClick={closeSidebar}>
                <li>
                  <NavLink className="cec-nav-link" to="/admin" end>
                    <i className="bi bi-speedometer2" /> Panel
                  </NavLink>
                </li>
                {/* Módulos académicos — visibles para general y academico */}
                {rolAdmin !== 'pagos' && (<>
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/ciclos">
                      <i className="bi bi-arrow-repeat" /> Ciclos
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/cursos">
                      <i className="bi bi-journal-text" /> Cursos
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/alumnos">
                      <i className="bi bi-people-fill" /> Alumnos
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/matricula">
                      <i className="bi bi-card-checklist" /> Matrícula
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/horario">
                      <i className="bi bi-calendar-week-fill" /> Horarios
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/asistencia">
                      <i className="bi bi-clipboard-data-fill" /> Asistencia
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/examenes">
                      <i className="bi bi-file-earmark-text-fill" /> Exámenes
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/plantillas-examen">
                      <i className="bi bi-layout-text-sidebar-reverse" /> Plantillas de examen
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/materiales">
                      <i className="bi bi-folder-fill" /> Materiales
                    </NavLink>
                  </li>
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/carnets">
                      <i className="bi bi-credit-card-2-front-fill" /> Carnets
                    </NavLink>
                  </li>
                </>)}
                {/* Módulo pagos — visibles para general y pagos */}
                {rolAdmin !== 'academico' && (
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/pagos" end={false}>
                      <i className="bi bi-cash-stack" />
                      <span>Pagos</span>
                    </NavLink>
                  </li>
                )}
                {/* Gestión de usuarios — solo general */}
                {rolAdmin === 'general' && (
                  <li>
                    <NavLink className="cec-nav-link" to="/admin/usuarios">
                      <i className="bi bi-shield-lock-fill" /> Usuarios
                    </NavLink>
                  </li>
                )}
              </ul>
            </>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Logout */}
          {isAuthenticated && (
            <div className="cec-sidebar-footer">
              <div className="cec-divider" style={{ margin: '0 0 10px' }} />
              <button className="cec-logout-btn" onClick={handleLogout}>
                <i className="bi bi-box-arrow-left" />
                Cerrar sesión
              </button>
            </div>
          )}
        </aside>

        {/* ── MAIN ── */}
        <main className="cec-main">
          {children}
        </main>
      </div>
    </>
  )
}