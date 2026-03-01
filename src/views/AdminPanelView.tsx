import { Link } from 'react-router-dom'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

  .admin-panel-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }

  .admin-panel-wrap {
    --navy-dark:  #0d1b2a;
    --navy-mid:   #1b2838;
    --navy-light: #2a3f5f;
    --gold:       #e9c46a;
    --gold-light: #fdeea3;
    --teal-mid:   #0a9396;
    --teal-pale:  #e8f4f5;
    --teal-dark:  #0d4f5c;
    --text-main:  #212529;
    --text-muted: #6c757d;
    --border:     #dee2e6;
  }

  /* Hero */
  .admin-panel-hero {
    background: linear-gradient(135deg, #1b2838 0%, #0d1b2a 60%, #061018 100%);
    border-radius: 20px; padding: 32px; margin-bottom: 28px;
    position: relative; overflow: hidden;
    border-bottom: 3px solid var(--gold);
  }
  .admin-panel-hero::before {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .admin-panel-hero-inner { position: relative; z-index: 1; display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 14px; }
  .admin-panel-hero-left {}
  .admin-panel-hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(233,196,106,0.15); border: 1px solid rgba(233,196,106,0.3);
    color: var(--gold); font-size: 11px; font-weight: 700;
    letter-spacing: 0.1em; text-transform: uppercase;
    padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;
  }
  .admin-panel-hero-title {
    font-size: 24px; font-weight: 800; color: white;
    margin: 0 0 6px; line-height: 1.2;
  }
  .admin-panel-hero-sub { font-size: 13px; color: rgba(255,255,255,0.5); margin: 0; }
  .admin-panel-hero-stats {
    display: flex; gap: 16px; flex-wrap: wrap; align-self: center;
  }
  .admin-panel-hero-stat {
    text-align: center; background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
    padding: 10px 16px;
  }
  .admin-panel-hero-stat-num  { font-size: 20px; font-weight: 800; color: var(--gold); line-height: 1; }
  .admin-panel-hero-stat-label{ font-size: 10px; color: rgba(255,255,255,0.45); font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 3px; }

  /* Section title */
  .admin-panel-section-title {
    font-size: 12px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 14px;
    display: flex; align-items: center; gap: 8px;
  }
  .admin-panel-section-title::after { content: ''; flex: 1; height: 1px; background: var(--border); }

  /* Grid */
  .admin-panel-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }

  /* Module card */
  .admin-mod-card {
    display: flex; flex-direction: column;
    background: white; border: 1.5px solid var(--border);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.06);
    text-decoration: none !important; color: inherit;
    transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
    position: relative;
  }
  .admin-mod-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0;
    height: 3px; background: linear-gradient(90deg, var(--gold), #f4a261);
    opacity: 0; transition: opacity 0.18s;
  }
  .admin-mod-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 28px rgba(13,27,42,0.15);
    border-color: rgba(233,196,106,0.4);
  }
  .admin-mod-card:hover::before { opacity: 1; }
  .admin-mod-card:hover .admin-mod-arrow { transform: translateX(4px); color: var(--gold); }
  .admin-mod-card:hover .admin-mod-icon  { transform: scale(1.08); }

  /* Card top accent bar per module */
  .admin-mod-top {
    height: 4px;
    transition: height 0.15s;
  }
  .admin-mod-card:hover .admin-mod-top { height: 4px; }

  .admin-mod-body { padding: 20px; flex: 1; display: flex; flex-direction: column; }

  .admin-mod-icon {
    width: 46px; height: 46px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; margin-bottom: 14px;
    transition: transform 0.18s;
  }

  .admin-mod-title { font-size: 15px; font-weight: 700; color: var(--navy-dark); margin-bottom: 5px; }
  .admin-mod-desc  { font-size: 12px; color: var(--text-muted); flex: 1; line-height: 1.5; }

  .admin-mod-footer {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 16px; padding-top: 12px;
    border-top: 1px solid #f1f5f9;
    font-size: 11px; font-weight: 700;
    color: var(--navy-light);
  }
  .admin-mod-arrow { font-size: 13px; color: #cbd5e1; transition: transform 0.18s, color 0.18s; }

  /* Color variants */
  .admin-mod-card.v-teal .admin-mod-top  { background: linear-gradient(90deg, #0a9396, #94d2bd); }
  .admin-mod-card.v-teal .admin-mod-icon { background: linear-gradient(135deg, #e8f4f5, #c7e8ea); color: var(--teal-dark); border: 1px solid rgba(10,147,150,0.15); }

  .admin-mod-card.v-gold .admin-mod-top  { background: linear-gradient(90deg, #e9c46a, #f4a261); }
  .admin-mod-card.v-gold .admin-mod-icon { background: linear-gradient(135deg, #fef9c3, #fdeea3); color: #7a5c00; border: 1px solid rgba(233,196,106,0.3); }

  .admin-mod-card.v-blue .admin-mod-top  { background: linear-gradient(90deg, #457b9d, #1d3557); }
  .admin-mod-card.v-blue .admin-mod-icon { background: linear-gradient(135deg, #f0f6ff, #bfdbfe); color: #1d3557; border: 1px solid rgba(69,123,157,0.2); }

  .admin-mod-card.v-green .admin-mod-top  { background: linear-gradient(90deg, #2a9d8f, #22c55e); }
  .admin-mod-card.v-green .admin-mod-icon { background: linear-gradient(135deg, #f0fdf4, #bbf7d0); color: #166534; border: 1px solid rgba(22,101,52,0.15); }

  .admin-mod-card.v-navy .admin-mod-top  { background: linear-gradient(90deg, #1b2838, #2a3f5f); }
  .admin-mod-card.v-navy .admin-mod-icon { background: linear-gradient(135deg, #f0f4ff, #dbeafe); color: #1d3557; border: 1px solid rgba(29,53,87,0.15); }

  .admin-mod-card.v-purple .admin-mod-top  { background: linear-gradient(90deg, #7c3aed, #a855f7); }
  .admin-mod-card.v-purple .admin-mod-icon { background: linear-gradient(135deg, #faf5ff, #e9d5ff); color: #6b21a8; border: 1px solid rgba(107,33,168,0.15); }

  @media (max-width: 500px) {
    .admin-panel-hero { padding: 22px 18px; }
    .admin-panel-hero-title { font-size: 18px; }
    .admin-panel-hero-stats { display: none; }
    .admin-panel-grid { grid-template-columns: 1fr 1fr; }
  }
  @media (max-width: 360px) {
    .admin-panel-grid { grid-template-columns: 1fr; }
  }
`

const MODULES = [
  {
    title: 'Ciclos',
    description: 'Gestiona ciclos académicos, fechas de inicio y fin.',
    icon: 'bi-arrow-repeat',
    path: '/admin/ciclos',
    variant: 'v-teal',
    label: 'Gestionar ciclos',
  },
  {
    title: 'Cursos',
    description: 'Administra cursos y asignaciones de profesores.',
    icon: 'bi-journal-bookmark-fill',
    path: '/admin/cursos',
    variant: 'v-gold',
    label: 'Gestionar cursos',
  },
  {
    title: 'Alumnos',
    description: 'Listado por ciclo, fotos y carga masiva por Excel.',
    icon: 'bi-people-fill',
    path: '/admin/alumnos',
    variant: 'v-blue',
    label: 'Ver alumnos',
  },
  {
    title: 'Matrícula',
    description: 'Matrícula manual, masiva y registro de nuevos alumnos.',
    icon: 'bi-card-checklist',
    path: '/admin/matricula',
    variant: 'v-green',
    label: 'Gestionar matrícula',
  },
  {
    title: 'Asistencia',
    description: 'Registra asistencia por DNI e inhabilita días no lectivos.',
    icon: 'bi-clipboard-check-fill',
    path: '/admin/asistencia',
    variant: 'v-navy',
    label: 'Registrar asistencia',
  },
  {
    title: 'Exámenes',
    description: 'Crea exámenes, registra notas y descarga plantillas.',
    icon: 'bi-file-earmark-text-fill',
    path: '/admin/examenes',
    variant: 'v-purple',
    label: 'Gestionar exámenes',
  },
]

export function AdminPanelView() {
  return (
    <div className="admin-panel-wrap">
      <style>{styles}</style>

      {/* Hero */}
      <div className="admin-panel-hero">
        <div className="admin-panel-hero-inner">
          <div className="admin-panel-hero-left">
            <div className="admin-panel-hero-badge">
              <i className="bi bi-shield-lock-fill" /> Panel de administración
            </div>
            <h1 className="admin-panel-hero-title">Panel Administrativo</h1>
            <p className="admin-panel-hero-sub">Gestiona todos los módulos del sistema desde aquí.</p>
          </div>
          <div className="admin-panel-hero-stats">
            <div className="admin-panel-hero-stat">
              <div className="admin-panel-hero-stat-num">{MODULES.length}</div>
              <div className="admin-panel-hero-stat-label">Módulos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section */}
      <div className="admin-panel-section-title">
        <i className="bi bi-grid-fill" style={{ color: 'var(--teal-mid)' }} /> Módulos del sistema
      </div>

      {/* Grid */}
      <div className="admin-panel-grid">
        {MODULES.map((mod) => (
          <Link key={mod.path} to={mod.path} className={`admin-mod-card ${mod.variant}`}>
            <div className="admin-mod-top" />
            <div className="admin-mod-body">
              <div className="admin-mod-icon">
                <i className={`bi ${mod.icon}`} />
              </div>
              <div className="admin-mod-title">{mod.title}</div>
              <div className="admin-mod-desc">{mod.description}</div>
              <div className="admin-mod-footer">
                <span>{mod.label}</span>
                <i className="bi bi-arrow-right admin-mod-arrow" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}