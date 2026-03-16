import { useEffect, useState } from 'react'
import { adminApi } from '../../models/adminApi'
import type { AlumnoListItem, Ciclo } from '../../models/types'
import { descargarCarnet } from '../../utils/generarCarnet'
import api from '../../config/api'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .carnets-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }
  .carnets-wrap {
    --teal-dark:  #0d4f5c;
    --teal-mid:   #0a9396;
    --teal-light: #94d2bd;
    --teal-pale:  #e8f4f5;
    --text-main:  #212529;
    --text-muted: #6c757d;
    --border:     #dee2e6;
  }

  .carnets-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 24px; gap: 12px; flex-wrap: wrap;
  }
  .carnets-title {
    font-size: 22px; font-weight: 700; color: var(--teal-dark);
    display: flex; align-items: center; gap: 10px; margin: 0;
  }
  .carnets-title-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 17px; flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(10,147,150,0.3);
  }
  .carnets-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

  .carnets-controls {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
  }
  .ciclo-select {
    padding: 7px 12px; border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; font-family: inherit; background: white; color: var(--text-main);
    outline: none; cursor: pointer; transition: border-color 0.18s; min-width: 200px;
  }
  .ciclo-select:focus { border-color: var(--teal-mid); }

  .btn-primary-cec {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 16px; border-radius: 9px; border: none;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    color: white; font-size: 13px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: opacity 0.15s; white-space: nowrap;
  }
  .btn-primary-cec:hover { opacity: 0.88; }
  .btn-primary-cec:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-outline-cec {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 13px; border-radius: 9px;
    border: 1.5px solid var(--teal-mid);
    color: var(--teal-mid); background: white;
    font-size: 12px; font-weight: 600; font-family: inherit;
    cursor: pointer; transition: all 0.15s; white-space: nowrap;
  }
  .btn-outline-cec:hover { background: var(--teal-pale); }
  .btn-outline-cec:disabled { opacity: 0.5; cursor: not-allowed; }

  .carnets-alert {
    display: flex; align-items: center; gap: 10px;
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 10px;
    padding: 12px 16px; color: #b91c1c; font-size: 13px; margin-bottom: 20px;
  }

  .carnets-card {
    background: white; border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
  }
  .carnets-card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--teal-pale);
  }
  .carnets-card-title {
    font-size: 13px; font-weight: 700; color: var(--teal-dark);
    display: flex; align-items: center; gap: 8px;
  }
  .carnets-badge {
    background: var(--teal-mid); color: white;
    font-size: 11px; font-weight: 700;
    padding: 2px 8px; border-radius: 20px;
  }

  .carnets-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .carnets-table thead tr { border-bottom: 2px solid var(--border); }
  .carnets-table th {
    padding: 10px 16px; text-align: left;
    font-size: 11px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--text-muted); background: #fafafa;
  }
  .carnets-table td { padding: 10px 16px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
  .carnets-table tbody tr:hover { background: var(--teal-pale); }
  .carnets-table tbody tr:last-child td { border-bottom: none; }

  .alumno-avatar {
    width: 34px; height: 34px; border-radius: 8px; object-fit: cover;
    border: 1.5px solid var(--border);
  }
  .alumno-avatar-placeholder {
    width: 34px; height: 34px; border-radius: 8px;
    background: var(--teal-pale); border: 1.5px solid var(--teal-light);
    display: flex; align-items: center; justify-content: center;
    color: var(--teal-mid); font-size: 14px;
  }
  .alumno-info { display: flex; align-items: center; gap: 10px; }
  .alumno-name { font-weight: 600; color: var(--text-main); font-size: 13px; }
  .alumno-code { font-size: 11px; color: var(--text-muted); font-family: monospace; }

  .generating-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; color: var(--teal-mid); font-weight: 600;
  }
  .spinner-xs {
    width: 12px; height: 12px;
    border: 2px solid var(--teal-light);
    border-top-color: var(--teal-mid);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .empty-state {
    text-align: center; padding: 48px 24px; color: var(--text-muted);
  }
  .empty-state i { font-size: 42px; color: var(--teal-light); margin-bottom: 12px; display: block; }
  .empty-state p { margin: 0; font-size: 14px; }

  .progress-banner {
    display: flex; align-items: center; gap: 12px;
    background: #eff6ff; border: 1px solid #bfdbfe;
    border-radius: 10px; padding: 12px 16px;
    margin-bottom: 20px; font-size: 13px; color: #1e40af;
  }
  .progress-bar-outer {
    flex: 1; height: 6px; background: #bfdbfe; border-radius: 3px; overflow: hidden;
  }
  .progress-bar-inner {
    height: 100%; background: #3b82f6; border-radius: 3px;
    transition: width 0.3s ease;
  }
`

export function AdminCarnetsView() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([])
  const [cicloId, setCicloId] = useState<number | ''>('')
  const [cicloNombre, setCicloNombre] = useState('')
  const [alumnos, setAlumnos] = useState<AlumnoListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Per-row generating state
  const [generating, setGenerating] = useState<Record<string, boolean>>({})

  // Bulk download state
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number; label: string } | null>(null)

  // Load ciclos on mount
  useEffect(() => {
    adminApi.getCiclos().then(r => {
      const list = r.data ?? []
      setCiclos(list)
    }).catch(() => {})
  }, [])

  const handleCicloChange = async (id: number) => {
    setCicloId(id)
    setAlumnos([])
    setError('')
    if (!id) { setCicloNombre(''); return }
    const found = ciclos.find(c => c.id === id)
    setCicloNombre(found?.nombres ?? found?.nombre ?? '')
    setLoading(true)
    try {
      const r = await adminApi.getAlumnosPorCiclo(id)
      setAlumnos(r.data.alumnos ?? [])
      if (!cicloNombre && r.data.ciclo) {
        setCicloNombre(r.data.ciclo.nombres ?? r.data.ciclo.nombre ?? '')
      }
    } catch (e: any) {
      setError(e.response?.data?.error ?? 'Error al cargar alumnos')
    } finally {
      setLoading(false)
    }
  }

  /** Obtiene el detalle del alumno (con DNI) antes de generar */
  const buildCarnetData = async (alumno: AlumnoListItem, cicloName: string) => {
    let dni: string | undefined
    try {
      if (alumno.codigo) {
        const det = await adminApi.getAlumno(alumno.codigo)
        dni = det.data.dni ?? undefined
      }
    } catch { /* skip DNI if unavailable */ }

    return {
      codigo: alumno.codigo ?? String(alumno.id),
      nombres: alumno.nombres,
      apellidos: alumno.apellidos,
      dni,
      cicloNombre: cicloName,
      fotoUrl: alumno.foto_url ?? null,
    }
  }

  const handleDescargar = async (alumno: AlumnoListItem) => {
    const key = alumno.codigo ?? String(alumno.id)
    setGenerating(prev => ({ ...prev, [key]: true }))
    try {
      const carnetData = await buildCarnetData(alumno, cicloNombre)
      await descargarCarnet(carnetData)
    } catch (e: any) {
      alert(`Error al generar carnet de ${alumno.nombres}: ${e.message}`)
    } finally {
      setGenerating(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleDescargarTodos = async () => {
    if (!alumnos.length) return
    setBulkProgress({ done: 0, total: alumnos.length, label: 'carnet' })
    for (let i = 0; i < alumnos.length; i++) {
      const alumno = alumnos[i]
      const key = alumno.codigo ?? String(alumno.id)
      setGenerating(prev => ({ ...prev, [key]: true }))
      try {
        const carnetData = await buildCarnetData(alumno, cicloNombre)
        await descargarCarnet(carnetData)
      } catch { /* skip failed */ }
      setGenerating(prev => ({ ...prev, [key]: false }))
      setBulkProgress({ done: i + 1, total: alumnos.length, label: 'carnet' })
      await new Promise(r => setTimeout(r, 400))
    }
    setBulkProgress(null)
  }

  const handleDescargarQRs = async () => {
    if (!alumnos.length) return
    setBulkProgress({ done: 0, total: alumnos.length, label: 'QR' })
    for (let i = 0; i < alumnos.length; i++) {
      const alumno = alumnos[i]
      const codigo = alumno.codigo ?? String(alumno.id)
      try {
        const resp = await api.get(`/api/admin/alumno/${encodeURIComponent(codigo)}/qr`, {
          responseType: 'blob',
        })
        const url = URL.createObjectURL(resp.data as Blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `qr_${codigo}.png`
        a.click()
        URL.revokeObjectURL(url)
      } catch { /* skip */ }
      setBulkProgress({ done: i + 1, total: alumnos.length, label: 'QR' })
      await new Promise(r => setTimeout(r, 300))
    }
    setBulkProgress(null)
  }

  const isBulkRunning = bulkProgress !== null
  const cicloNameDisplay = cicloNombre || ciclos.find(c => c.id === cicloId)?.nombres || ciclos.find(c => c.id === cicloId)?.nombre || ''

  return (
    <div className="carnets-wrap">
      <style>{styles}</style>

      {/* ── Header ── */}
      <div className="carnets-header">
        <div>
          <h1 className="carnets-title">
            <div className="carnets-title-icon">
              <i className="bi bi-credit-card-2-front-fill" />
            </div>
            <div>
              Carnets de Alumnos
              <div className="carnets-subtitle">Genera y descarga fotochecks en formato PDF</div>
            </div>
          </h1>
        </div>

        <div className="carnets-controls">
          <select
            className="ciclo-select"
            value={cicloId}
            onChange={e => handleCicloChange(Number(e.target.value))}
          >
            <option value="">— Selecciona un ciclo —</option>
            {ciclos.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombres ?? c.nombre}
              </option>
            ))}
          </select>

          {alumnos.length > 0 && (
            <>
              <button
                className="btn-primary-cec"
                onClick={handleDescargarTodos}
                disabled={isBulkRunning}
              >
                {isBulkRunning && bulkProgress?.label === 'carnet'
                  ? <><span className="spinner-xs" /> Generando carnets...</>
                  : <><i className="bi bi-file-earmark-person" /> Descargar carnets</>
                }
              </button>
              <button
                className="btn-outline-cec"
                onClick={handleDescargarQRs}
                disabled={isBulkRunning}
              >
                {isBulkRunning && bulkProgress?.label === 'QR'
                  ? <><span className="spinner-xs" /> Descargando QRs...</>
                  : <><i className="bi bi-qr-code" /> Descargar QRs</>
                }
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Bulk progress ── */}
      {bulkProgress && (
        <div className="progress-banner">
          <span className="spinner-xs" />
          <span>{bulkProgress.label === 'QR' ? 'Descargando QR' : 'Generando carnet'} {bulkProgress.done} de {bulkProgress.total}…</span>
          <div className="progress-bar-outer">
            <div
              className="progress-bar-inner"
              style={{ width: `${(bulkProgress.done / bulkProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="carnets-alert">
          <i className="bi bi-exclamation-triangle-fill" />
          {error}
        </div>
      )}

      {/* ── Table ── */}
      {cicloId && (
        <div className="carnets-card">
          <div className="carnets-card-header">
            <div className="carnets-card-title">
              <i className="bi bi-people-fill" />
              {cicloNameDisplay ? `Alumnos — ${cicloNameDisplay}` : 'Alumnos'}
              {alumnos.length > 0 && <span className="carnets-badge">{alumnos.length}</span>}
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <span className="spinner-xs" style={{ width: 28, height: 28, borderWidth: 3 }} />
              <p style={{ marginTop: 12 }}>Cargando alumnos…</p>
            </div>
          ) : alumnos.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-person-x" />
              <p>No hay alumnos matriculados en este ciclo.</p>
            </div>
          ) : (
            <table className="carnets-table">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Código</th>
                  <th>Foto</th>
                  <th style={{ textAlign: 'right' }}>Carnet</th>
                </tr>
              </thead>
              <tbody>
                {alumnos.map(alumno => {
                  const key = alumno.codigo ?? String(alumno.id)
                  const isGen = generating[key]
                  return (
                    <tr key={key}>
                      <td>
                        <div className="alumno-info">
                          {alumno.foto_url
                            ? <img className="alumno-avatar" src={alumno.foto_url} alt="" />
                            : (
                              <div className="alumno-avatar-placeholder">
                                <i className="bi bi-person" />
                              </div>
                            )
                          }
                          <div>
                            <div className="alumno-name">{alumno.nombres} {alumno.apellidos}</div>
                            {alumno.email_alumno && (
                              <div className="alumno-code">{alumno.email_alumno}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="alumno-code" style={{ fontSize: 13 }}>{alumno.codigo ?? '—'}</span>
                      </td>
                      <td>
                        {alumno.foto_url
                          ? <span style={{ color: '#166534', fontSize: 12, fontWeight: 600 }}>
                              <i className="bi bi-check-circle-fill" /> Sí
                            </span>
                          : <span style={{ color: '#6c757d', fontSize: 12 }}>Sin foto</span>
                        }
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isGen
                          ? <span className="generating-badge">
                              <span className="spinner-xs" /> Generando…
                            </span>
                          : (
                            <button
                              className="btn-outline-cec"
                              onClick={() => handleDescargar(alumno)}
                              disabled={isBulkRunning}
                            >
                              <i className="bi bi-file-earmark-person" />
                              Descargar
                            </button>
                          )
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Empty (no ciclo selected) ── */}
      {!cicloId && !loading && (
        <div className="carnets-card">
          <div className="empty-state">
            <i className="bi bi-credit-card" />
            <p>Selecciona un ciclo para ver los alumnos y descargar sus carnets.</p>
          </div>
        </div>
      )}
    </div>
  )
}
