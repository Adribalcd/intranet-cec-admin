import { useEffect, useState } from 'react'
import { adminApi } from '../../models/adminApi'
import type { Ciclo } from '../../models/types'
import 'bootstrap-icons/font/bootstrap-icons.css'

// ── Listado de carreras San Marcos por área ──────────────────────────────────
const CARRERAS_SM: Record<string, string[]> = {
  A: [
    'Medicina Humana', 'Odontología', 'Farmacia y Bioquímica', 'Obstetricia',
    'Tecnología Médica', 'Enfermería', 'Nutrición', 'Medicina Veterinaria', 'Biología',
  ],
  B: [
    'Física', 'Matemática', 'Estadística', 'Computación Científica',
    'Ingeniería de Sistemas e Informática', 'Ingeniería Electrónica', 'Ingeniería Industrial',
    'Ingeniería Geológica', 'Ingeniería Geográfica', 'Ingeniería de Minas',
    'Ingeniería Mecánica de Fluidos', 'Ingeniería Química', 'Ingeniería Metalúrgica',
    'Ingeniería Ambiental', 'Ingeniería Agroindustrial', 'Ingeniería Pesquera',
    'Zootecnia', 'Química',
  ],
  C: [
    'Literatura', 'Lingüística', 'Comunicación Social',
    'Arte — Artes Plásticas', 'Arte — Música', 'Arte — Danza', 'Arte — Teatro',
    'Bibliotecología y Ciencias de la Información', 'Filosofía', 'Historia',
    'Arqueología', 'Antropología', 'Geografía', 'Trabajo Social', 'Sociología',
    'Ciencia Política', 'Psicología', 'Derecho',
  ],
  D: [
    'Administración', 'Contabilidad', 'Economía', 'Negocios Internacionales', 'Turismo',
  ],
  E: [
    'Educación — Inicial', 'Educación — Primaria', 'Educación — Física',
    'Educación — Matemática y Física', 'Educación — Química y Biología',
    'Educación — Ciencias Sociales y Humanas',
    'Educación — Lengua, Literatura y Comunicación',
    'Educación — Idiomas (Inglés-Francés)',
  ],
}
const TODAS_SM = Object.values(CARRERAS_SM).flat()

// ── Listado de carreras UNI ───────────────────────────────────────────────────
const CARRERAS_UNI = [
  'Ingeniería Civil', 'Ingeniería Sanitaria',
  'Ingeniería Eléctrica', 'Ingeniería Electrónica', 'Ingeniería de Telecomunicaciones',
  'Ingeniería Mecánica', 'Ingeniería Mecatrónica', 'Ingeniería de Materiales',
  'Ingeniería Química', 'Ingeniería Textil y Confecciones',
  'Ingeniería de Petróleo y Gas Natural',
  'Ingeniería Industrial', 'Ingeniería de Sistemas', 'Ingeniería de Software',
  'Ingeniería Geológica', 'Ingeniería de Minas', 'Ingeniería Metalúrgica',
  'Ingeniería Geográfica', 'Ingeniería Topográfica y Agrimensura',
  'Ingeniería Ambiental', 'Ingeniería de Higiene y Seguridad Industrial',
  'Ingeniería Agrícola', 'Física', 'Matemática', 'Estadística',
  'Ingeniería Económica', 'Ciencia de la Computación',
  'Arquitectura', 'Urbanismo',
]

function getCarrerasPorUniv(univ: string, area?: string): string[] {
  if (univ === 'San Marcos') {
    if (area && CARRERAS_SM[area]) return CARRERAS_SM[area]
    return TODAS_SM
  }
  if (univ === 'UNI') return CARRERAS_UNI
  return []
}

// --- ESTILOS ---
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
  .mat-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
  .mat-wrap {
    --teal-dark: #0d4f5c; --teal-mid: #0a9396; --teal-light: #94d2bd;
    --teal-pale: #e8f4f5; --text-muted: #64748b; --border: #e2e8f0;
    --excel-green: #166534;
  }
  .mat-header { margin-bottom: 28px; }
  .mat-title { font-size: 24px; font-weight: 700; color: var(--teal-dark); display: flex; align-items: center; gap: 12px; }
  .mat-title-icon {
    width: 42px; height: 42px; border-radius: 12px;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    display: flex; align-items: center; justify-content: center; color: white;
  }
  .mat-card {
    background: white; border: 1px solid var(--border); border-radius: 16px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 24px;
  }
  .mat-card-header {
    padding: 16px 20px; background: #f8fafc; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .mat-card-header.excel { background: #f0fdf4; }
  .mat-card-header.violet { background: #f5f3ff; }
  .mat-card-title { font-size: 15px; font-weight: 700; color: var(--teal-dark); margin: 0; }
  .mat-card-body { padding: 20px; }
  .mat-form-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 12px; }
  .mat-form-row.cols-3 { grid-template-columns: 1fr 1fr auto; }
  .mat-field label { display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; }
  .mat-field input, .mat-field select {
    width: 100%; padding: 10px; border: 1.5px solid var(--border);
    border-radius: 9px; font-size: 13px; transition: 0.2s; font-family: inherit;
  }
  .mat-field input:focus, .mat-field select:focus { border-color: var(--teal-mid); outline: none; }
  .btn-primary-cec {
    background: var(--teal-mid); color: white; border: none; padding: 10px 20px;
    border-radius: 9px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px;
    font-family: inherit;
  }
  .btn-violet { background: #7c3aed; color: white; border: none; padding: 10px 20px; border-radius: 9px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; font-family: inherit; }
  .btn-excel { background: var(--excel-green); color: white; border: none; padding: 10px 20px; border-radius: 9px; cursor: pointer; font-weight: 600; font-family: inherit; }
  .btn-excel-outline { background: white; color: var(--excel-green); border: 2px solid var(--excel-green); padding: 8px 16px; border-radius: 9px; cursor: pointer; font-weight: 600; font-size: 13px; display: inline-flex; align-items: center; gap: 6px; font-family: inherit; }
  .btn-excel-outline:hover { background: #f0fdf4; }
  .alert { padding: 12px; border-radius: 10px; margin-bottom: 20px; font-size: 13px; display: flex; align-items: center; gap: 10px; }
  .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
  .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
  .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .voc-separator { border: none; border-top: 1px dashed var(--border); margin: 14px 0; }
`

// ── Bloque reutilizable: campos Universidad / Área / Carrera ─────────────────
interface VocProps {
  univ: string; area: string; carrera: string
  onChange: (patch: { univMeta?: string; area?: string; carreraPref?: string }) => void
}
function CamposVocacional({ univ, area, carrera, onChange }: VocProps) {
  const carreras = getCarrerasPorUniv(univ, area)
  const esSM = univ === 'San Marcos'
  const [otroTexto, setOtroTexto] = useState('')

  return (
    <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#0a9396', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
        <i className="bi bi-mortarboard-fill" style={{ marginRight: 6 }} />Universidad / Área / Carrera (opcional)
      </div>
      <div className="mat-form-row" style={{ marginBottom: esSM ? 12 : 0 }}>
        <div className="mat-field">
          <label>Universidad objetivo</label>
          <select value={univ} onChange={e => { onChange({ univMeta: e.target.value, area: '', carreraPref: '' }); setOtroTexto('') }}>
            <option value="Por definir">Por definir</option>
            <option value="San Marcos">San Marcos (UNMSM)</option>
            <option value="UNI">UNI</option>
            <option value="Otra">Otra</option>
          </select>
        </div>
        {esSM && (
          <div className="mat-field">
            <label>Área de postulación (SM)</label>
            <select value={area} onChange={e => onChange({ area: e.target.value, carreraPref: '' })}>
              <option value="">— Seleccione área —</option>
              {['A','B','C','D','E'].map(a => (
                <option key={a} value={a}>Área {a}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {(univ === 'San Marcos' || univ === 'UNI') && (
        <div className="mat-field">
          <label>Carrera preferida</label>
          <select value={carrera === otroTexto && carrera !== '' ? '__otro__' : carrera} onChange={e => {
            if (e.target.value === '__otro__') { onChange({ carreraPref: '' }); setOtroTexto('') }
            else { onChange({ carreraPref: e.target.value }); setOtroTexto('') }
          }}>
            <option value="">— Por definir —</option>
            {carreras.map(c => <option key={c} value={c}>{c}</option>)}
            <option value="__otro__">Otra (ingresar manualmente)</option>
          </select>
          {(carrera === '__otro__' || (carrera !== '' && !carreras.includes(carrera) && carrera !== '__otro__')) && (
            <input
              style={{ marginTop: 8, width: '100%', padding: 10, border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 13 }}
              placeholder="Escribe la carrera..."
              value={otroTexto}
              onChange={e => { setOtroTexto(e.target.value); onChange({ carreraPref: e.target.value }) }}
            />
          )}
        </div>
      )}
    </div>
  )
}

export function AdminMatriculaView() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  const [manual, setManual] = useState({
    codigoAlumno: '', cicloId: '', esEscolar: false,
    univMeta: 'Por definir', area: '', carreraPref: '',
  })
  const [excelFile, setExcelFile] = useState<File | null>(null)
  const [excelCicloId, setExcelCicloId] = useState('')
  const [nuevo, setNuevo] = useState({
    codigo: '', nombres: '', apellidos: '', email: '',
    dni: '', fechaNacimiento: '', celular: '', cicloId: '', esEscolar: false,
    univMeta: 'Por definir', area: '', carreraPref: '',
  })
  const [editForm, setEditForm] = useState({
    matriculaId: '', univMeta: 'Por definir', area: '', carreraPref: '',
  })

  const setNA = (patch: Partial<typeof nuevo>) => setNuevo(prev => ({ ...prev, ...patch }))

  useEffect(() => {
    adminApi.getCiclos()
      .then(res => setCiclos(res.data))
      .catch(() => setMsg({ type: 'error', text: 'Error al cargar ciclos.' }))
      .finally(() => setLoading(false))
  }, [])

  const cleanCarrera = (c: string) => (c && c !== '__otro__' ? c : undefined)

  const handleManual = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await (adminApi as any).matriculaManual({
        codigoAlumno: manual.codigoAlumno, cicloId: Number(manual.cicloId),
        esEscolar: manual.esEscolar,
        area: manual.area || undefined,
        carreraPref: cleanCarrera(manual.carreraPref),
        univMeta: manual.univMeta !== 'Por definir' ? manual.univMeta : undefined,
      })
      setMsg({ type: 'success', text: `Matrícula exitosa.${manual.esEscolar ? ' Se generaron 10 cuotas de escolaridad (S/70 c/u).' : ''}` })
      setManual({ codigoAlumno: '', cicloId: '', esEscolar: false, univMeta: 'Por definir', area: '', carreraPref: '' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error en matrícula manual.' })
    } finally { setIsSubmitting(false) }
  }

  const descargarPlantilla = async () => {
    try {
      const res = await adminApi.plantillaMasivaExcel()
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url; a.download = 'plantilla_matricula_masiva.xlsx'; a.click()
      URL.revokeObjectURL(url)
    } catch {
      setMsg({ type: 'error', text: 'Error al descargar la plantilla.' })
    }
  }

  const handleExcelUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!excelFile || !excelCicloId) return
    setIsSubmitting(true)
    try {
      const res = await adminApi.matriculaMasivaExcel(excelFile, Number(excelCicloId))
      setMsg({ type: 'success', text: `Excel procesado: ${res.data.matriculados} alumnos inscritos.` })
      setExcelFile(null)
    } catch {
      setMsg({ type: 'error', text: 'Error al procesar archivo Excel.' })
    } finally { setIsSubmitting(false) }
  }

  const handleNuevoAlumno = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const anio = nuevo.fechaNacimiento.split('-')[0]
    const passwordGenerada = `${anio}-${nuevo.celular}-${nuevo.dni}`
    try {
      await adminApi.registrarAlumno({
        codigo: nuevo.codigo, nombres: nuevo.nombres, apellidos: nuevo.apellidos,
        email: nuevo.email, celular: nuevo.celular,
        dni: nuevo.dni, fechaNacimiento: nuevo.fechaNacimiento,
      })
      await (adminApi as any).matriculaManual({
        codigoAlumno: nuevo.codigo, cicloId: Number(nuevo.cicloId), esEscolar: nuevo.esEscolar,
        area: nuevo.area || undefined,
        carreraPref: cleanCarrera(nuevo.carreraPref),
        univMeta: nuevo.univMeta !== 'Por definir' ? nuevo.univMeta : undefined,
      })
      const msgEsc = nuevo.esEscolar ? ' · Escolaridad: 10 cuotas de S/70 generadas.' : ''
      setMsg({ type: 'success', text: `Alumno registrado. Accesos enviados a ${nuevo.email}. Clave: ${passwordGenerada}${msgEsc}` })
      setNuevo({ codigo: '', nombres: '', apellidos: '', email: '', dni: '', fechaNacimiento: '', celular: '', cicloId: '', esEscolar: false, univMeta: 'Por definir', area: '', carreraPref: '' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error al registrar nuevo alumno.' })
    } finally { setIsSubmitting(false) }
  }

  const handleEditMatricula = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editForm.matriculaId) return
    setIsSubmitting(true)
    try {
      await (adminApi as any).updateMatriculaInfo(Number(editForm.matriculaId), {
        area: editForm.area || null,
        carreraPref: cleanCarrera(editForm.carreraPref) || null,
        univMeta: editForm.univMeta || null,
      })
      setMsg({ type: 'success', text: `Matrícula #${editForm.matriculaId} actualizada correctamente.` })
      setEditForm({ matriculaId: '', univMeta: 'Por definir', area: '', carreraPref: '' })
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Error al actualizar matrícula.' })
    } finally { setIsSubmitting(false) }
  }

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Iniciando módulo de matrícula...</div>

  return (
    <div className="mat-wrap">
      <style>{styles}</style>

      <div className="mat-header">
        <h2 className="mat-title">
          <div className="mat-title-icon"><i className="bi bi-person-badge-fill" /></div>
          Panel de Matrícula Académica
        </h2>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`}>
          <i className={`bi bi-${msg.type === 'success' ? 'check-circle-fill' : 'exclamation-octagon-fill'}`} />
          {msg.text}
        </div>
      )}

      {/* SECCIÓN 1: MATRÍCULA INDIVIDUAL */}
      <div className="mat-card">
        <div className="mat-card-header">
          <i className="bi bi-cursor-fill" style={{ color: '#0a9396' }} />
          <p className="mat-card-title">Matrícula Individual (Alumno Existente)</p>
        </div>
        <div className="mat-card-body">
          <form onSubmit={handleManual}>
            <div className="mat-form-row cols-3" style={{ marginBottom: 12 }}>
              <div className="mat-field">
                <label>Código Alumno</label>
                <input value={manual.codigoAlumno} onChange={e => setManual({ ...manual, codigoAlumno: e.target.value })} placeholder="Ej: A100" required />
              </div>
              <div className="mat-field">
                <label>Ciclo Académico</label>
                <select value={manual.cicloId} onChange={e => setManual({ ...manual, cicloId: e.target.value })} required>
                  <option value="">Seleccione...</option>
                  {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre || c.nombres}</option>)}
                </select>
              </div>
              <div className="mat-field" style={{ alignSelf: 'end' }}>
                <button type="submit" className="btn-primary-cec" disabled={isSubmitting}>
                  {isSubmitting ? <div className="spinner" /> : 'Matricular'}
                </button>
              </div>
            </div>
            <CamposVocacional
              univ={manual.univMeta} area={manual.area} carrera={manual.carreraPref}
              onChange={p => setManual(prev => ({ ...prev, ...p }))}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 13 }}>
              <input type="checkbox" id="chk-escolar-manual" checked={manual.esEscolar} onChange={e => setManual({ ...manual, esEscolar: e.target.checked })} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="chk-escolar-manual" style={{ cursor: 'pointer', color: '#0d4f5c', fontWeight: 600 }}>
                Modalidad Escolaridad <span style={{ fontWeight: 400, color: '#64748b' }}>(genera 10 cuotas × S/70)</span>
              </label>
            </div>
          </form>
        </div>
      </div>

      {/* SECCIÓN 2: CARGA MASIVA EXCEL */}
      <div className="mat-card">
        <div className="mat-card-header excel" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="bi bi-file-earmark-excel-fill text-success" />
            <p className="mat-card-title">Carga Masiva vía Excel</p>
          </div>
          <button type="button" className="btn-excel-outline" onClick={descargarPlantilla}>
            <i className="bi bi-download" /> Plantilla
          </button>
        </div>
        <div className="mat-card-body">
          <form onSubmit={handleExcelUpload} className="mat-form-row cols-3">
            <div className="mat-field">
              <label>Ciclo Destino</label>
              <select value={excelCicloId} onChange={e => setExcelCicloId(e.target.value)} required>
                <option value="">Seleccione Ciclo...</option>
                {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre || c.nombres}</option>)}
              </select>
            </div>
            <div className="mat-field">
              <label>Archivo (.xlsx)</label>
              <input type="file" accept=".xlsx" onChange={e => setExcelFile(e.target.files?.[0] || null)} required />
            </div>
            <div className="mat-field" style={{ alignSelf: 'end' }}>
              <button type="submit" className="btn-excel" disabled={isSubmitting}>Subir Archivo</button>
            </div>
          </form>
        </div>
      </div>

      {/* SECCIÓN 3: NUEVO ALUMNO */}
      <div className="mat-card">
        <div className="mat-card-header">
          <i className="bi bi-person-plus-fill" style={{ color: '#0a9396' }} />
          <p className="mat-card-title">Registrar y Matricular Nuevo Estudiante</p>
        </div>
        <div className="mat-card-body">
          <form onSubmit={handleNuevoAlumno}>
            <div className="mat-form-row">
              <div className="mat-field">
                <label>Código Usuario</label>
                <input value={nuevo.codigo} onChange={e => setNA({ codigo: e.target.value })} placeholder="Ej: A2026-01" required />
              </div>
              <div className="mat-field">
                <label>Correo Electrónico</label>
                <input type="email" value={nuevo.email} onChange={e => setNA({ email: e.target.value })} placeholder="alumno@correo.com" required />
              </div>
            </div>
            <div className="mat-form-row">
              <div className="mat-field">
                <label>Nombres</label>
                <input value={nuevo.nombres} onChange={e => setNA({ nombres: e.target.value })} required />
              </div>
              <div className="mat-field">
                <label>Apellidos</label>
                <input value={nuevo.apellidos} onChange={e => setNA({ apellidos: e.target.value })} required />
              </div>
            </div>
            <div className="mat-form-row">
              <div className="mat-field">
                <label>DNI (Para contraseña)</label>
                <input value={nuevo.dni} onChange={e => setNA({ dni: e.target.value })} maxLength={8} required />
              </div>
              <div className="mat-field">
                <label>Fecha Nacimiento</label>
                <input type="date" value={nuevo.fechaNacimiento} onChange={e => setNA({ fechaNacimiento: e.target.value })} required />
              </div>
            </div>
            <div className="mat-form-row">
              <div className="mat-field">
                <label>Celular (Para contraseña)</label>
                <input value={nuevo.celular} onChange={e => setNA({ celular: e.target.value })} required />
              </div>
              <div className="mat-field">
                <label>Ciclo Inicial</label>
                <select value={nuevo.cicloId} onChange={e => setNA({ cicloId: e.target.value })} required>
                  <option value="">Seleccione...</option>
                  {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombre || c.nombres}</option>)}
                </select>
              </div>
            </div>
            <CamposVocacional
              univ={nuevo.univMeta} area={nuevo.area} carrera={nuevo.carreraPref}
              onChange={p => setNuevo(prev => ({ ...prev, ...p }))}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13 }}>
              <input type="checkbox" id="chk-escolar-nuevo" checked={nuevo.esEscolar} onChange={e => setNA({ esEscolar: e.target.checked })} style={{ width: 16, height: 16, cursor: 'pointer' }} />
              <label htmlFor="chk-escolar-nuevo" style={{ cursor: 'pointer', color: '#0d4f5c', fontWeight: 600 }}>
                Modalidad Escolaridad <span style={{ fontWeight: 400, color: '#64748b' }}>(genera 10 cuotas × S/70 al matricular)</span>
              </label>
            </div>
            <button type="submit" className="btn-primary-cec" style={{ width: '100%', justifyContent: 'center' }} disabled={isSubmitting}>
              {isSubmitting ? <div className="spinner" /> : 'Registrar Estudiante y Enviar Accesos'}
            </button>
          </form>
        </div>
      </div>

      {/* SECCIÓN 4: EDITAR ÁREA / CARRERA */}
      <div className="mat-card">
        <div className="mat-card-header violet">
          <i className="bi bi-pencil-square" style={{ color: '#7c3aed' }} />
          <p className="mat-card-title" style={{ color: '#4c1d95' }}>Editar Área / Carrera de Matrícula Existente</p>
        </div>
        <div className="mat-card-body">
          <p style={{ fontSize: 12, color: '#64748b', marginTop: 0, marginBottom: 16 }}>
            Ingresa el ID de la matrícula para actualizar el área de postulación y/o la carrera preferida del alumno.
            El ID se muestra en la tabla de alumnos matriculados.
          </p>
          <form onSubmit={handleEditMatricula}>
            <div style={{ marginBottom: 12, maxWidth: 200 }}>
              <div className="mat-field">
                <label>ID Matrícula</label>
                <input
                  type="number" min="1"
                  value={editForm.matriculaId}
                  onChange={e => setEditForm(f => ({ ...f, matriculaId: e.target.value }))}
                  placeholder="Ej: 42" required
                />
              </div>
            </div>
            <CamposVocacional
              univ={editForm.univMeta} area={editForm.area} carrera={editForm.carreraPref}
              onChange={p => setEditForm(prev => ({ ...prev, ...p }))}
            />
            <button type="submit" className="btn-violet" disabled={isSubmitting || !editForm.matriculaId}>
              {isSubmitting ? <div className="spinner" /> : <><i className="bi bi-save" /> Guardar cambios</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
