import { useEffect, useState } from 'react'
import { adminApi } from '../../models/adminApi'
import type { Ciclo, Curso, HorarioAdmin } from '../../models/types'

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const HORAS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

function padHour(h: string) {
  // Normaliza "07:00:00" → "07:00" y "7:00" → "07:00"
  return h?.substring(0, 5) ?? ''
}

function horaToNext(h: string) {
  const [hh, mm] = h.split(':').map(Number)
  const next = hh + 1
  return `${String(next).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .hor-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }

  .hor-wrap {
    --teal-dark:  #0d4f5c;
    --teal-mid:   #0a9396;
    --teal-light: #94d2bd;
    --teal-pale:  #e8f4f5;
    --accent:     #e9c46a;
    --danger:     #e76f51;
    --text-main:  #212529;
    --text-muted: #6c757d;
    --border:     #dee2e6;
  }

  /* Header */
  .hor-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 12px; flex-wrap: wrap; }
  .hor-title { font-size: 22px; font-weight: 700; color: var(--teal-dark); display: flex; align-items: center; gap: 10px; margin: 0; }
  .hor-title-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 17px; flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(10,147,150,0.3);
  }
  .hor-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 2px; font-weight: 400; }

  /* Alerts */
  .hor-alert-error {
    display: flex; align-items: center; gap: 10px;
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 10px;
    padding: 12px 16px; color: #b91c1c; font-size: 13px; margin-bottom: 16px;
  }
  .hor-alert-success {
    display: flex; align-items: center; gap: 10px;
    background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px;
    padding: 12px 16px; color: #166534; font-size: 13px; margin-bottom: 16px;
  }

  /* Selectors card */
  .hor-selectors-card {
    background: white; border: 1px solid var(--border); border-radius: 16px;
    padding: 20px; margin-bottom: 20px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
    display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
  }
  @media (max-width: 640px) { .hor-selectors-card { grid-template-columns: 1fr; } }

  .hor-field label {
    display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;
  }
  .hor-select-wrap { position: relative; }
  .hor-select-wrap::after {
    content: '\\f282'; font-family: 'Bootstrap Icons';
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none; font-size: 12px;
  }
  .hor-field select {
    width: 100%; padding: 9px 12px; border: 1.5px solid var(--border);
    border-radius: 9px; font-size: 13px; font-family: inherit;
    background: #fafafa; outline: none; appearance: none; -webkit-appearance: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .hor-field select:focus {
    border-color: var(--teal-mid); background: white;
    box-shadow: 0 0 0 3px rgba(10,147,150,0.12);
  }

  /* Info banner */
  .hor-info-banner {
    display: flex; align-items: center; gap: 10px;
    background: var(--teal-pale); border: 1px solid rgba(10,147,150,0.2);
    border-radius: 10px; padding: 10px 16px; margin-bottom: 16px;
    font-size: 13px; color: var(--teal-dark);
  }

  /* Timetable container */
  .hor-table-card {
    background: white; border: 1px solid var(--border); border-radius: 16px;
    overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  }
  .hor-table-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, var(--teal-pale), #fff);
  }
  .hor-table-header-left { font-size: 13px; font-weight: 600; color: #374151; }

  /* Timetable */
  .hor-timetable-wrap { overflow-x: auto; }
  .hor-timetable {
    width: 100%; border-collapse: collapse; min-width: 700px;
  }
  .hor-timetable th {
    padding: 10px 14px; font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.07em; color: white;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    border: 1px solid rgba(255,255,255,0.15); text-align: center;
  }
  .hor-timetable th:first-child { text-align: left; min-width: 90px; border-radius: 0; }
  .hor-timetable td {
    border: 1px solid #e8f0f0; vertical-align: middle; padding: 0;
    min-width: 110px; height: 52px;
  }
  .hor-timetable td:first-child {
    background: #f8fafc; font-size: 12px; font-weight: 700;
    color: var(--teal-dark); text-align: center; padding: 8px;
    white-space: nowrap;
  }
  .hor-timetable tbody tr:hover td:first-child { background: #edf4f5; }

  /* Cell */
  .hor-cell {
    width: 100%; height: 52px; display: flex; align-items: center; justify-content: center;
    position: relative; cursor: pointer; transition: background 0.15s;
  }
  .hor-cell.empty:hover { background: var(--teal-pale); }
  .hor-cell.filled { background: linear-gradient(135deg, #e0f5f5, #c8ecec); cursor: default; }
  .hor-cell.filled:hover { background: linear-gradient(135deg, #caeaea, #b4e4e4); }

  .hor-cell-add {
    width: 26px; height: 26px; border-radius: 50%;
    border: 1.5px dashed var(--teal-light); background: transparent;
    color: var(--teal-mid); font-size: 14px; display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: all 0.15s;
  }
  .hor-cell:hover .hor-cell-add { border-color: var(--teal-mid); background: white; }

  .hor-cell-block {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 2px; padding: 4px 6px; width: 100%; height: 100%;
  }
  .hor-cell-block-name {
    font-size: 10px; font-weight: 700; color: var(--teal-dark);
    text-align: center; line-height: 1.2;
    max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .hor-cell-block-time {
    font-size: 9px; color: var(--teal-mid); font-family: monospace;
  }
  .hor-cell-delete {
    position: absolute; top: 3px; right: 3px;
    width: 18px; height: 18px; border-radius: 50%; border: none;
    background: rgba(231,111,81,0.15); color: var(--danger); font-size: 9px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; opacity: 0; transition: opacity 0.15s;
  }
  .hor-cell.filled:hover .hor-cell-delete { opacity: 1; }

  /* Modal */
  .hor-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: flex; align-items: center; justify-content: center;
    z-index: 3000; padding: 20px;
  }
  .hor-modal-box {
    background: white; border-radius: 18px; width: 100%; max-width: 380px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    animation: horModalIn 0.2s ease;
  }
  @keyframes horModalIn { from { transform: scale(0.94); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .hor-modal-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, var(--teal-pale), white);
    border-radius: 18px 18px 0 0;
  }
  .hor-modal-header h5 { font-size: 15px; font-weight: 700; color: var(--teal-dark); margin: 0; }
  .hor-modal-close {
    width: 30px; height: 30px; border-radius: 8px; border: none;
    background: #f1f5f9; color: var(--text-muted); cursor: pointer; font-size: 14px;
    display: flex; align-items: center; justify-content: center;
  }
  .hor-modal-close:hover { background: #e2e8f0; }
  .hor-modal-body { padding: 20px; }
  .hor-modal-footer {
    display: flex; gap: 10px; justify-content: flex-end;
    padding: 14px 20px; border-top: 1px solid var(--border); background: #fafafa;
    border-radius: 0 0 18px 18px;
  }

  .hor-modal-field { margin-bottom: 14px; }
  .hor-modal-field label {
    display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;
  }
  .hor-modal-field input, .hor-modal-field select {
    width: 100%; padding: 9px 12px; border: 1.5px solid var(--border);
    border-radius: 9px; font-size: 13px; font-family: inherit;
    background: #fafafa; outline: none; appearance: none; -webkit-appearance: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .hor-modal-field input:focus, .hor-modal-field select:focus {
    border-color: var(--teal-mid); background: white;
    box-shadow: 0 0 0 3px rgba(10,147,150,0.12);
  }
  .hor-modal-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  .btn-hor-save {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 9px; border: none;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    color: white; font-size: 13px; font-weight: 700; font-family: inherit;
    cursor: pointer; transition: opacity 0.18s;
  }
  .btn-hor-save:hover:not(:disabled) { opacity: 0.88; }
  .btn-hor-save:disabled { opacity: 0.55; cursor: not-allowed; }
  .btn-hor-cancel {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 9px;
    border: 1.5px solid var(--border); background: white;
    color: var(--text-muted); font-size: 13px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: border-color 0.15s;
  }
  .btn-hor-cancel:hover { border-color: #adb5bd; }

  /* Empty / Loading */
  .hor-empty { text-align: center; padding: 60px 20px; color: var(--text-muted); }
  .hor-empty i { font-size: 44px; color: var(--teal-light); margin-bottom: 14px; display: block; }
  .hor-empty p { font-size: 14px; margin: 0; }
  .hor-loading {
    display: flex; align-items: center; justify-content: center; gap: 10px;
    padding: 60px; color: var(--teal-mid); font-size: 14px; font-weight: 500;
  }
  .hor-spinner {
    width: 22px; height: 22px; border-radius: 50%;
    border: 2.5px solid var(--teal-light); border-top-color: var(--teal-mid);
    animation: horspin 0.7s linear infinite;
  }
  .hor-spinner-sm {
    width: 16px; height: 16px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.4); border-top-color: white;
    animation: horspin 0.7s linear infinite;
  }
  @keyframes horspin { to { transform: rotate(360deg); } }

  /* Legend */
  .hor-legend {
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
    padding: 12px 20px; border-top: 1px solid var(--border);
    background: #fafafa; font-size: 12px; color: var(--text-muted);
  }
  .hor-legend-item { display: flex; align-items: center; gap: 6px; }
  .hor-legend-dot {
    width: 12px; height: 12px; border-radius: 3px;
  }
  .hor-legend-dot.filled { background: linear-gradient(135deg, #e0f5f5, #c8ecec); border: 1px solid var(--teal-light); }
  .hor-legend-dot.empty { background: white; border: 1.5px dashed var(--teal-light); }
`

interface ModalState {
  dia: string
  horaInicio: string
  horaFin: string
  editId?: number
  editCursoId?: number
}

export function AdminHorarioView() {
  const [ciclos, setCiclos]       = useState<Ciclo[]>([])
  const [cursos, setCursos]       = useState<Curso[]>([])
  const [horarios, setHorarios]   = useState<HorarioAdmin[]>([])
  const [cicloId, setCicloId]     = useState<number | ''>('')
  const [cursoId, setCursoId]     = useState<number | ''>('')
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')
  const [modal, setModal]         = useState<ModalState | null>(null)

  // Cargar ciclos y cursos al inicio
  useEffect(() => {
    Promise.all([adminApi.getCiclos(), adminApi.getCursos()])
      .then(([ciclosRes, cursosRes]) => {
        setCiclos(Array.isArray(ciclosRes.data) ? ciclosRes.data : [])
        setCursos(Array.isArray(cursosRes.data) ? cursosRes.data : [])
      })
      .catch(() => setError('No se pudieron cargar los datos.'))
      .finally(() => setLoading(false))
  }, [])

  // Cargar horarios cuando cambia ciclo o curso
  useEffect(() => {
    if (!cicloId) { setHorarios([]); return }
    adminApi.getHorarios(cicloId as number)
      .then((res) => setHorarios(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Error al cargar horarios.'))
  }, [cicloId])

  const cursosFiltrados = cursos.filter((c) =>
    cicloId ? (c.ciclo_id ?? c.cicloId) === cicloId : true
  )

  const horariosFiltrados = cursoId
    ? horarios.filter((h) => h.cursoId === cursoId)
    : horarios

  // Obtener entrada de horario para una celda (dia + horaInicio)
  const getCelda = (dia: string, hora: string) =>
    horariosFiltrados.filter((h) => h.diaSemana === dia && padHour(h.horaInicio) === hora)

  const abrirModal = (dia: string, hora: string, editEntry?: HorarioAdmin) => {
    setError('')
    setSuccess('')
    if (editEntry) {
      setModal({ dia: editEntry.diaSemana, horaInicio: padHour(editEntry.horaInicio), horaFin: padHour(editEntry.horaFin), editId: editEntry.id, editCursoId: editEntry.cursoId })
    } else {
      setModal({ dia, horaInicio: hora, horaFin: horaToNext(hora) })
    }
  }

  const cerrarModal = () => setModal(null)

  const handleGuardar = async () => {
    const resolvedCursoId = modal?.editCursoId ?? cursoId
    if (!modal || !resolvedCursoId) { setError('Selecciona un curso primero.'); return }
    setSaving(true)
    setError('')
    try {
      const body = {
        cursoId: resolvedCursoId as number,
        diaSemana: modal.dia,
        horaInicio: modal.horaInicio + ':00',
        horaFin: modal.horaFin + ':00',
      }
      if (modal.editId) {
        await adminApi.updateHorario(modal.editId, body)
        setSuccess('Horario actualizado correctamente.')
      } else {
        await adminApi.createHorario(body)
        setSuccess('Horario registrado correctamente.')
      }
      cerrarModal()
      const res = await adminApi.getHorarios(cicloId as number)
      setHorarios(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Error al guardar el horario.')
    } finally {
      setSaving(false)
    }
  }

  const handleEliminar = async (h: HorarioAdmin, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`¿Eliminar este bloque (${h.diaSemana} ${padHour(h.horaInicio)})?`)) return
    setError('')
    try {
      await adminApi.deleteHorario(h.id)
      setSuccess('Bloque eliminado.')
      const res = await adminApi.getHorarios(cicloId as number)
      setHorarios(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError('Error al eliminar el horario.')
    }
  }

  if (loading) return (
    <div className="hor-wrap">
      <style>{styles}</style>
      <div className="hor-loading"><div className="hor-spinner" /> Cargando...</div>
    </div>
  )

  const cursoSeleccionado = cursos.find((c) => c.id === cursoId)

  return (
    <div className="hor-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="hor-header">
        <h2 className="hor-title">
          <span className="hor-title-icon"><i className="bi bi-calendar-week-fill" /></span>
          <span>
            Horarios por curso
            <div className="hor-subtitle">Registra y edita el horario semanal de cada curso</div>
          </span>
        </h2>
      </div>

      {/* Alerts */}
      {error   && <div className="hor-alert-error">  <i className="bi bi-exclamation-circle-fill" /> {error}</div>}
      {success && <div className="hor-alert-success"><i className="bi bi-check-circle-fill" /> {success}</div>}

      {/* Selectors */}
      <div className="hor-selectors-card">
        <div className="hor-field">
          <label>Ciclo académico</label>
          <div className="hor-select-wrap">
            <select
              value={cicloId}
              onChange={(e) => { setCicloId(e.target.value ? parseInt(e.target.value) : ''); setCursoId('') }}
            >
              <option value="">-- Seleccionar ciclo --</option>
              {ciclos.map((c) => <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>)}
            </select>
          </div>
        </div>
        <div className="hor-field">
          <label>Curso (opcional — para filtrar)</label>
          <div className="hor-select-wrap">
            <select
              value={cursoId}
              onChange={(e) => setCursoId(e.target.value ? parseInt(e.target.value) : '')}
              disabled={!cicloId}
            >
              <option value="">-- Todos los cursos --</option>
              {cursosFiltrados.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Info */}
      {cicloId && (
        <div className="hor-info-banner">
          <i className="bi bi-info-circle-fill" style={{ color: 'var(--teal-mid)', flexShrink: 0 }} />
          {cursoId
            ? <>Mostrando horario de <strong>{cursoSeleccionado?.nombre}</strong>. Haz clic en <i className="bi bi-plus" /> para agregar un bloque, o en <i className="bi bi-x" /> para eliminar.</>
            : <>Selecciona un curso para agregar bloques. Se muestran todos los horarios del ciclo en el mapa.</>
          }
        </div>
      )}

      {/* Timetable */}
      {!cicloId ? (
        <div className="hor-table-card">
          <div className="hor-empty">
            <i className="bi bi-calendar-week" />
            <p>Selecciona un ciclo para ver el horario semanal.</p>
          </div>
        </div>
      ) : (
        <div className="hor-table-card">
          <div className="hor-table-header">
            <span className="hor-table-header-left">
              <i className="bi bi-grid-3x3-gap-fill me-2" style={{ color: 'var(--teal-mid)' }} />
              Mapa semanal de horarios
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {horariosFiltrados.length} bloque(s) registrado(s)
            </span>
          </div>

          <div className="hor-timetable-wrap">
            <table className="hor-timetable">
              <thead>
                <tr>
                  <th>Hora</th>
                  {DIAS.map((d) => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {HORAS.map((hora) => (
                  <tr key={hora}>
                    <td>{hora}</td>
                    {DIAS.map((dia) => {
                      const celdas = getCelda(dia, hora)
                      return (
                        <td key={dia}>
                          {celdas.length > 0 ? (
                            celdas.map((h) => (
                              <div key={h.id} className="hor-cell filled" onClick={() => abrirModal(dia, hora, h)}>
                                <div className="hor-cell-block">
                                  <div className="hor-cell-block-name">{h.cursoNombre}</div>
                                  <div className="hor-cell-block-time">{padHour(h.horaInicio)}–{padHour(h.horaFin)}</div>
                                </div>
                                <button className="hor-cell-delete" onClick={(e) => handleEliminar(h, e)}>
                                  <i className="bi bi-x" />
                                </button>
                              </div>
                            ))
                          ) : (
                            <div
                              className="hor-cell empty"
                              onClick={() => cursoId ? abrirModal(dia, hora) : setError('Selecciona un curso primero para agregar bloques.')}
                            >
                              {cursoId ? <button className="hor-cell-add"><i className="bi bi-plus" /></button> : null}
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="hor-legend">
            <div className="hor-legend-item">
              <div className="hor-legend-dot filled" />
              <span>Bloque ocupado (clic para editar/eliminar)</span>
            </div>
            <div className="hor-legend-item">
              <div className="hor-legend-dot empty" />
              <span>Disponible (clic para agregar)</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal agregar/editar horario */}
      {modal && (
        <div className="hor-modal-overlay" onClick={cerrarModal}>
          <div className="hor-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="hor-modal-header">
              <h5>
                <i className="bi bi-calendar-plus-fill me-2" />
                {modal.editId ? 'Editar bloque' : 'Agregar bloque'}
              </h5>
              <button className="hor-modal-close" onClick={cerrarModal}><i className="bi bi-x-lg" /></button>
            </div>
            <div className="hor-modal-body">
              {error && (
                <div className="hor-alert-error" style={{ marginBottom: 12 }}>
                  <i className="bi bi-exclamation-circle-fill" /> {error}
                </div>
              )}

              <div className="hor-modal-field">
                <label>Día</label>
                <div className="hor-select-wrap">
                  <select value={modal.dia} onChange={(e) => setModal({ ...modal, dia: e.target.value })}>
                    {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="hor-modal-field-row">
                <div className="hor-modal-field" style={{ marginBottom: 0 }}>
                  <label>Hora inicio</label>
                  <input
                    type="time" value={modal.horaInicio}
                    onChange={(e) => setModal({ ...modal, horaInicio: e.target.value })}
                  />
                </div>
                <div className="hor-modal-field" style={{ marginBottom: 0 }}>
                  <label>Hora fin</label>
                  <input
                    type="time" value={modal.horaFin}
                    onChange={(e) => setModal({ ...modal, horaFin: e.target.value })}
                  />
                </div>
              </div>

              {(() => {
                const displayCurso = modal.editCursoId
                  ? cursos.find((c) => c.id === modal.editCursoId)
                  : cursoSeleccionado
                return displayCurso ? (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 14, marginBottom: 0 }}>
                    <i className="bi bi-book-fill me-1" style={{ color: 'var(--teal-mid)' }} />
                    Curso: <strong style={{ color: 'var(--teal-dark)' }}>{displayCurso.nombre}</strong>
                  </p>
                ) : null
              })()}
            </div>
            <div className="hor-modal-footer">
              <button className="btn-hor-cancel" onClick={cerrarModal}>
                <i className="bi bi-x" /> Cancelar
              </button>
              <button className="btn-hor-save" onClick={handleGuardar} disabled={saving}>
                {saving ? <><div className="hor-spinner-sm" /> Guardando...</> : <><i className="bi bi-check-lg" /> Guardar</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
