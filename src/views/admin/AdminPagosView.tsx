import { useState, useEffect, useCallback } from 'react'
import { adminApi } from '../../models/adminApi'

const MESES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre']

const TIPO_LABELS: Record<string, string> = {
  mensualidad: 'Mensualidad', matricula: 'Matrícula',
  materiales: 'Materiales', escolaridad: 'Escolaridad', otro: 'Otro',
}

const s: Record<string, React.CSSProperties> = {
  page: { padding: '0 0 40px' },
  header: { marginBottom: 24 },
  h1: { fontSize: 24, fontWeight: 700, color: '#0d4f5c', margin: 0 },
  sub: { fontSize: 13, color: '#6c8a91', marginTop: 4 },
  card: { background: 'white', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 24, marginBottom: 20 },
  row: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const },
  label: { fontSize: 12, fontWeight: 600, color: '#0d4f5c', marginBottom: 4 },
  select: { padding: '8px 12px', borderRadius: 8, border: '1.5px solid #cde0e4', fontSize: 14, color: '#0d4f5c', background: 'white', minWidth: 220 },
  input: { padding: '8px 12px', borderRadius: 8, border: '1.5px solid #cde0e4', fontSize: 14, color: '#0d4f5c', background: 'white', width: '100%' },
  tabBar: { display: 'flex', gap: 4, borderBottom: '2px solid #e0eef0', marginBottom: 24 },
  tab: { padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#6c8a91', borderRadius: '8px 8px 0 0', transition: 'all 0.15s' },
  tabActive: { padding: '10px 20px', border: 'none', background: '#e8f5f6', cursor: 'pointer', fontSize: 14, fontWeight: 700, color: '#0a9396', borderRadius: '8px 8px 0 0', borderBottom: '2px solid #0a9396', marginBottom: -2 },
  btnPrimary: { padding: '8px 18px', background: '#0a9396', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 },
  btnDanger: { padding: '6px 12px', background: '#fff0f0', color: '#c0392b', border: '1px solid #fbc4c4', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  btnSecondary: { padding: '6px 12px', background: '#f0f7f8', color: '#0d4f5c', border: '1px solid #cde0e4', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  btnWarning: { padding: '6px 12px', background: '#fff8e6', color: '#856404', border: '1px solid #ffd970', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 },
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 },
  th: { padding: '10px 12px', textAlign: 'left' as const, background: '#f0f7f8', color: '#0d4f5c', fontWeight: 700, borderBottom: '2px solid #cde0e4', whiteSpace: 'nowrap' as const },
  td: { padding: '10px 12px', borderBottom: '1px solid #f0f4f5', verticalAlign: 'middle' as const },
  badge: { display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 700 },
  modal: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modalBox: { background: 'white', borderRadius: 16, padding: 28, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' as const, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#0d4f5c', marginBottom: 20 },
  formGroup: { marginBottom: 16 },
  splitPanel: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  leftPanel: { width: 280, flexShrink: 0, background: 'white', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden' },
  rightPanel: { flex: 1, background: 'white', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', padding: 20 },
  alumnoItem: { padding: '10px 14px', borderBottom: '1px solid #f0f4f5', cursor: 'pointer', transition: 'background 0.12s' },
  alumnoItemActive: { padding: '10px 14px', borderBottom: '1px solid #f0f4f5', cursor: 'pointer', background: '#e8f5f6', borderLeft: '3px solid #0a9396' },
  searchBox: { padding: '10px 14px', borderBottom: '1px solid #e0eef0' },
}

const emptyConcepto = { tipo: 'mensualidad', descripcion: '', mes: '', anio: '', monto_opcion_1: '', etiqueta_opcion_1: 'Tarifa regular', monto_opcion_2: '', etiqueta_opcion_2: 'Tarifa especial', fecha_vencimiento: '', orden: 0 }
const emptyPago = { alumno_id: '', concepto_id: '', monto_pagado: '', opcion_pago: 'opcion_1', metodo_pago: 'Yape', fecha_pago: new Date().toISOString().slice(0, 10), visible_alumno: false, observaciones: '', numero_operacion: '', codigo_recibo: '' }

export function AdminPagosView() {
  const [ciclos, setCiclos] = useState<any[]>([])
  const [cicloId, setCicloId] = useState<number | null>(null)
  const [tab, setTab] = useState(0)

  // Tab 1 — Conceptos
  const [conceptos, setConceptos] = useState<any[]>([])
  const [showConceptoModal, setShowConceptoModal] = useState(false)
  const [editConcepto, setEditConcepto] = useState<any>(null)
  const [conceptoForm, setConceptoForm] = useState<any>(emptyConcepto)

  // Tab 2 — Pagos por alumno
  const [alumnos, setAlumnos] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedAlumno, setSelectedAlumno] = useState<any>(null)
  const [alumnoConceptos, setAlumnoConceptos] = useState<any[]>([])
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [editPago, setEditPago] = useState<any>(null)
  const [pagoForm, setPagoForm] = useState<any>(emptyPago)
  const [pagoConcepto, setPagoConcepto] = useState<any>(null)

  // Tab 3 — Resumen
  const [resumen, setResumen] = useState<any>(null)

  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  // Específicos para Tabs nuevos
  const [configPagos, setConfigPagos] = useState<any>(null)
  const [visibilidadGlobal, setVisibilidadGlobal] = useState<any>(null)

  const loadVisibilidadGlobal = () => {
    adminApi.getVisibilidadGlobal().then(r => setVisibilidadGlobal(r.data)).catch(() => {})
  }

  useEffect(() => {
    adminApi.getCiclos().then(r => {
      setCiclos(r.data)
      if (r.data.length) setCicloId(r.data[0].id)
    })
    loadVisibilidadGlobal()
  }, [])

  const loadConceptos = useCallback(() => {
    if (!cicloId) return
    adminApi.getConceptosPago(cicloId).then(r => setConceptos(r.data))
  }, [cicloId])

  const loadAlumnos = useCallback(() => {
    if (!cicloId) return
    adminApi.getAlumnosPorCiclo(cicloId).then(r => setAlumnos(r.data.alumnos || []))
  }, [cicloId])

  const loadResumen = useCallback(() => {
    if (!cicloId) return
    setLoading(true)
    adminApi.getResumenPagosCiclo(cicloId).then(r => { setResumen(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [cicloId])

  const loadConfigPagos = useCallback(() => {
    if (!cicloId) return
    adminApi.getConfigPagos(cicloId).then(r => setConfigPagos(r.data))
  }, [cicloId])

  useEffect(() => {
    if (!cicloId) return
    setSelectedAlumno(null)
    setAlumnoConceptos([])
    if (tab === 0) loadConceptos()
    if (tab === 1) loadAlumnos()
    if (tab === 2) loadResumen()
    if (tab === 3) loadConfigPagos()
  }, [cicloId, tab, loadConceptos, loadAlumnos, loadResumen, loadConfigPagos])

  const loadPagosAlumno = useCallback((alumno: any) => {
    if (!cicloId || !alumno) return
    adminApi.getPagosAlumno(alumno.id, cicloId).then(r => setAlumnoConceptos(r.data))
  }, [cicloId])

  useEffect(() => {
    if (selectedAlumno) loadPagosAlumno(selectedAlumno)
  }, [selectedAlumno, loadPagosAlumno])

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000) }

  const cambiarVisibilidadGlobal = async (visible: boolean) => {
    const msg = visible
      ? '¿Activar el módulo de pagos para TODOS los ciclos?\n\nLos alumnos podrán ver y consultar sus pagos.'
      : '¿Ocultar el módulo de pagos para TODOS los ciclos?\n\nLos alumnos dejarán de ver el módulo hasta que lo reactives.'
    if (!confirm(msg)) return
    try {
      await adminApi.setVisibilidadGlobal(visible)
      flash(visible ? 'Módulo de pagos activado para todos los ciclos' : 'Módulo de pagos ocultado para todos los ciclos')
      loadVisibilidadGlobal()
      if (tab === 3) loadConfigPagos()
    } catch { flash('Error al cambiar visibilidad') }
  }

  // ── Concepto CRUD ──
  const openCreateConcepto = () => { setEditConcepto(null); setConceptoForm({ ...emptyConcepto }); setShowConceptoModal(true) }
  const openEditConcepto = (c: any) => { setEditConcepto(c); setConceptoForm({ tipo: c.tipo, descripcion: c.descripcion, mes: c.mes ?? '', anio: c.anio ?? '', monto_opcion_1: c.monto_opcion_1, etiqueta_opcion_1: c.etiqueta_opcion_1, monto_opcion_2: c.monto_opcion_2 ?? '', etiqueta_opcion_2: c.etiqueta_opcion_2 ?? '', fecha_vencimiento: c.fecha_vencimiento ?? '', orden: c.orden }); setShowConceptoModal(true) }

  const saveConcepto = async () => {
    if (!cicloId) return
    const body: any = { ...conceptoForm }
    if (!body.mes) delete body.mes
    if (!body.anio) delete body.anio
    if (!body.monto_opcion_2) { body.monto_opcion_2 = null; body.etiqueta_opcion_2 = null }
    if (!body.fecha_vencimiento) delete body.fecha_vencimiento
    try {
      if (editConcepto) await adminApi.updateConceptoPago(editConcepto.id, body)
      else await adminApi.createConceptoPago(cicloId, body)
      setShowConceptoModal(false); loadConceptos(); flash('Concepto guardado')
    } catch { flash('Error al guardar') }
  }

  const deleteConcepto = async (id: number) => {
    if (!confirm('¿Eliminar este concepto y todos sus pagos?')) return
    await adminApi.deleteConceptoPago(id); loadConceptos(); flash('Concepto eliminado')
  }

  // ── Config Ciclo ──
  const saveConfig = async () => {
    if (!cicloId || !configPagos) return
    try {
      await adminApi.upsertConfigPagos(cicloId, configPagos)
      flash('Configuración guardada')
    } catch { flash('Error al guardar config') }
  }

  // ── Pago CRUD ──
  const openCreatePago = (concepto: any) => {
    setPagoConcepto(concepto)
    setEditPago(null)
    const tarifa = concepto.monto_opcion_2 ? 'opcion_1' : 'opcion_1'
    setPagoForm({ ...emptyPago, alumno_id: selectedAlumno.id, concepto_id: concepto.id, monto_pagado: concepto.monto_opcion_1, opcion_pago: tarifa, fecha_pago: new Date().toISOString().slice(0, 10) })
    setShowPagoModal(true)
  }

  const openEditPago = (concepto: any, pago: any) => {
    setPagoConcepto(concepto)
    setEditPago(pago)
    setPagoForm({ alumno_id: pago.alumno_id, concepto_id: pago.concepto_id, monto_pagado: pago.monto_pagado, opcion_pago: pago.opcion_pago, metodo_pago: pago.metodo_pago, fecha_pago: pago.fecha_pago, visible_alumno: pago.visible_alumno, observaciones: pago.observaciones ?? '', numero_operacion: pago.numero_operacion ?? '', codigo_recibo: pago.codigo_recibo ?? '' })
    setShowPagoModal(true)
  }

  const savePago = async () => {
    try {
      if (editPago) await adminApi.updatePago(editPago.id, pagoForm)
      else await adminApi.registrarPago(pagoForm)
      setShowPagoModal(false); loadPagosAlumno(selectedAlumno); flash('Pago guardado')
    } catch { flash('Error al guardar') }
  }

  const deletePago = async (pagoId: number) => {
    if (!confirm('¿Eliminar este pago?')) return
    await adminApi.deletePago(pagoId); loadPagosAlumno(selectedAlumno); flash('Pago eliminado')
  }

  const toggleVis = async (pagoId: number) => {
    await adminApi.toggleVisibilidadPago(pagoId); loadPagosAlumno(selectedAlumno)
  }

  const toggleSuspension = async (alumno: any) => {
    const accion = alumno.suspendido ? 'reactivar' : 'suspender'
    if (!confirm(`¿${accion} la cuenta de ${alumno.nombres} ${alumno.apellidos}?`)) return
    await adminApi.toggleSuspension(alumno.codigo)
    loadAlumnos()
    setSelectedAlumno((prev: any) => prev ? { ...prev, suspendido: !prev.suspendido } : prev)
    flash(`Cuenta ${accion === 'suspender' ? 'suspendida' : 'reactivada'}`)
  }

  const opcionChange = (opcion: string) => {
    const monto = opcion === 'opcion_2' ? pagoConcepto?.monto_opcion_2 : pagoConcepto?.monto_opcion_1
    setPagoForm((f: any) => ({ ...f, opcion_pago: opcion, monto_pagado: monto ?? f.monto_pagado }))
  }

  const filteredAlumnos = alumnos.filter(a => {
    const q = search.toLowerCase()
    return !q || a.nombres?.toLowerCase().includes(q) || a.apellidos?.toLowerCase().includes(q) || a.codigo?.toLowerCase().includes(q)
  })

  const hoy = new Date()
  const isVencido = (c: any) => c.fecha_vencimiento && new Date(c.fecha_vencimiento) < hoy

  const renderConceptoCard = (c: any) => {
    const pago = c.Pagos?.[0] ?? null
    const vencido = !pago && isVencido(c)
    return (
      <div key={c.id} style={{ borderRadius: 10, border: `1.5px solid ${pago ? '#a5d6a7' : vencido ? '#fbc4c4' : '#e0eef0'}`, background: pago ? '#f9fffe' : vencido ? '#fff5f5' : 'white', padding: '12px 16px' }}>
        <div style={{ ...s.row, justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontWeight: 600, fontSize: 14, color: '#0d4f5c' }}>{c.descripcion}</span>
            <span style={{ marginLeft: 8, ...s.badge, background: pago ? '#e8f5e9' : vencido ? '#ffe0e0' : '#f0f7f8', color: pago ? '#27ae60' : vencido ? '#c0392b' : '#6c8a91' }}>
              {pago ? 'Pagado' : vencido ? 'Vencido' : 'Pendiente'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
            {!pago && <button style={s.btnPrimary} onClick={() => openCreatePago(c)}><i className="bi bi-plus" /> Registrar</button>}
            {pago && <>
              <button style={{ ...s.btnSecondary, fontSize: 11 }} onClick={() => toggleVis(pago.id)} title={pago.visible_alumno ? 'Ocultar al alumno' : 'Mostrar al alumno'}>
                <i className={`bi bi-eye${pago.visible_alumno ? '-slash' : ''}`} /> {pago.visible_alumno ? 'Visible' : 'Oculto'}
              </button>
              <button style={s.btnSecondary} onClick={() => openEditPago(c, pago)}><i className="bi bi-pencil" /></button>
              <button style={s.btnDanger} onClick={() => deletePago(pago.id)}><i className="bi bi-trash" /></button>
            </>}
          </div>
        </div>
        {pago && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#6c8a91', display: 'flex', gap: 16, flexWrap: 'wrap' as const }}>
            <span><i className="bi bi-currency-dollar" /> S/ {Number(pago.monto_pagado).toFixed(2)}</span>
            <span><i className="bi bi-credit-card" /> {pago.metodo_pago}</span>
            <span><i className="bi bi-calendar-check" /> {pago.fecha_pago}</span>
            {pago.numero_operacion && <span><i className="bi bi-hash" /> {pago.numero_operacion}</span>}
          </div>
        )}
        {!pago && c.fecha_vencimiento && (
          <div style={{ fontSize: 12, color: vencido ? '#c0392b' : '#6c8a91', marginTop: 4 }}>
            Vence: {c.fecha_vencimiento} &nbsp;|&nbsp; S/ {Number(c.monto_opcion_1).toFixed(2)}
            {c.monto_opcion_2 && ` / S/ ${Number(c.monto_opcion_2).toFixed(2)}`}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.h1}><i className="bi bi-cash-stack" style={{ marginRight: 10, color: '#0a9396' }} />Gestión de Pagos</h1>
        <p style={s.sub}>Conceptos de pago, registro y seguimiento por alumno</p>
      </div>

      {/* Banner de visibilidad global */}
      {visibilidadGlobal && (
        visibilidadGlobal.todos_ocultos ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: '#fff3cd', border: '1.5px solid #ffc107', borderRadius: 10, padding: '12px 18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="bi bi-eye-slash-fill" style={{ fontSize: 18, color: '#856404' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#856404', fontSize: 14 }}>Módulo de pagos oculto para todos los alumnos</div>
                <div style={{ fontSize: 12, color: '#a07800', marginTop: 2 }}>Ningún ciclo tiene el módulo de pagos visible actualmente.</div>
              </div>
            </div>
            <button style={{ ...s.btnPrimary, background: '#0a9396', whiteSpace: 'nowrap' as const }} onClick={() => cambiarVisibilidadGlobal(true)}>
              <i className="bi bi-eye-fill" />Activar para todos
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, background: '#e8f5f6', border: '1.5px solid #a8d8dc', borderRadius: 10, padding: '12px 18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="bi bi-eye-fill" style={{ fontSize: 18, color: '#0a9396' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#0d4f5c', fontSize: 14 }}>Módulo de pagos visible</div>
                <div style={{ fontSize: 12, color: '#4a7c85', marginTop: 2 }}>{visibilidadGlobal.visibles} de {visibilidadGlobal.total} ciclo(s) con pagos visibles para alumnos.</div>
              </div>
            </div>
            <button style={{ padding: '8px 16px', background: '#fff3cd', color: '#856404', border: '1.5px solid #ffc107', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' as const }} onClick={() => cambiarVisibilidadGlobal(false)}>
              <i className="bi bi-eye-slash-fill" />Ocultar para todos
            </button>
          </div>
        )
      )}

      {msg && <div style={{ background: '#e8f5e9', border: '1px solid #a5d6a7', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#1b5e20', fontSize: 13 }}>{msg}</div>}

      {/* Selector de ciclo */}
      <div style={s.card}>
        <div style={s.row}>
          <div>
            <div style={s.label}>Ciclo</div>
            <select style={s.select} value={cicloId ?? ''} onChange={e => setCicloId(Number(e.target.value))}>
              {ciclos.map(c => <option key={c.id} value={c.id}>{c.nombres}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabBar}>
        {['Conceptos de pago', 'Pagos por alumno', 'Resumen', 'Configuración'].map((t, i) => (
          <button key={i} style={tab === i ? s.tabActive : s.tab} onClick={() => setTab(i)}>{t}</button>
        ))}
      </div>

      {/* ── TAB 0: Conceptos ── */}
      {tab === 0 && (
        <div style={s.card}>
          <div style={{ ...s.row, marginBottom: 16, justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, color: '#0d4f5c', fontSize: 15 }}>Conceptos de pago</span>
            <button style={s.btnPrimary} onClick={openCreateConcepto}><i className="bi bi-plus-lg" /> Agregar concepto</button>
          </div>
          {conceptos.length === 0 ? (
            <p style={{ color: '#6c8a91', fontSize: 13 }}>No hay conceptos para este ciclo.</p>
          ) : (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Tipo</th>
                  <th style={s.th}>Descripción</th>
                  <th style={s.th}>Mes/Año</th>
                  <th style={s.th}>Tarifa A</th>
                  <th style={s.th}>Tarifa B</th>
                  <th style={s.th}>Vencimiento</th>
                  <th style={s.th}>Orden</th>
                  <th style={s.th}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {conceptos.map(c => (
                  <tr key={c.id}>
                    <td style={s.td}>
                      <span style={{ ...s.badge, background: c.tipo === 'mensualidad' ? '#e8f5f6' : c.tipo === 'matricula' ? '#e8f0ff' : c.tipo === 'materiales' ? '#fff8e6' : '#f0f0f0', color: c.tipo === 'mensualidad' ? '#0a9396' : c.tipo === 'matricula' ? '#5c40b0' : c.tipo === 'materiales' ? '#856404' : '#555' }}>
                        {TIPO_LABELS[c.tipo]}
                      </span>
                    </td>
                    <td style={s.td}>{c.descripcion}</td>
                    <td style={s.td}>{c.mes ? `${MESES[c.mes]} ${c.anio ?? ''}` : '—'}</td>
                    <td style={s.td}><strong>S/ {Number(c.monto_opcion_1).toFixed(2)}</strong><br /><span style={{ fontSize: 11, color: '#6c8a91' }}>{c.etiqueta_opcion_1}</span></td>
                    <td style={s.td}>{c.monto_opcion_2 ? <><strong>S/ {Number(c.monto_opcion_2).toFixed(2)}</strong><br /><span style={{ fontSize: 11, color: '#6c8a91' }}>{c.etiqueta_opcion_2}</span></> : <span style={{ color: '#ccc' }}>—</span>}</td>
                    <td style={s.td}>{c.fecha_vencimiento ? <span style={{ color: isVencido(c) ? '#c0392b' : '#0d4f5c' }}>{c.fecha_vencimiento}</span> : '—'}</td>
                    <td style={s.td}>{c.orden}</td>
                    <td style={s.td}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button style={s.btnSecondary} onClick={() => openEditConcepto(c)}><i className="bi bi-pencil" /></button>
                        <button style={s.btnDanger} onClick={() => deleteConcepto(c.id)}><i className="bi bi-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB 1: Pagos por alumno ── */}
      {tab === 1 && (
        <div style={s.splitPanel}>
          {/* Left: lista de alumnos */}
          <div style={s.leftPanel}>
            <div style={s.searchBox}>
              <input style={{ ...s.input, fontSize: 13 }} placeholder="Buscar alumno..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ maxHeight: 500, overflowY: 'auto' }}>
              {filteredAlumnos.length === 0 && <p style={{ padding: 14, color: '#6c8a91', fontSize: 12 }}>Sin resultados</p>}
              {filteredAlumnos.map(a => (
                <div key={a.id} style={selectedAlumno?.id === a.id ? s.alumnoItemActive : s.alumnoItem} onClick={() => setSelectedAlumno(a)}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0d4f5c' }}>{a.nombres} {a.apellidos}</div>
                  <div style={{ fontSize: 11, color: '#6c8a91' }}>{a.codigo}</div>
                  {a.suspendido && <span style={{ ...s.badge, background: '#ffe0e0', color: '#c0392b', fontSize: 10 }}>SUSPENDIDO</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Right: conceptos del alumno */}
          <div style={s.rightPanel}>
            {!selectedAlumno ? (
              <p style={{ color: '#6c8a91', fontSize: 13 }}>Selecciona un alumno de la lista.</p>
            ) : (
              <>
                <div style={{ ...s.row, marginBottom: 16, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#0d4f5c' }}>{selectedAlumno.nombres} {selectedAlumno.apellidos}</div>
                    <div style={{ fontSize: 12, color: '#6c8a91' }}>{selectedAlumno.codigo}</div>
                  </div>
                  <button
                    style={selectedAlumno.suspendido ? { ...s.btnSecondary, background: '#e8f5f6', color: '#0a9396', borderColor: '#94d2bd' } : s.btnWarning}
                    onClick={() => toggleSuspension(selectedAlumno)}
                  >
                    <i className={`bi bi-${selectedAlumno.suspendido ? 'unlock' : 'lock'}`} /> {selectedAlumno.suspendido ? 'Reactivar cuenta' : 'Suspender cuenta'}
                  </button>
                </div>

                {alumnoConceptos.length === 0 ? (
                  <p style={{ color: '#6c8a91', fontSize: 13 }}>No hay conceptos para este ciclo.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Escolaridad — sección destacada */}
                    {alumnoConceptos.some((c: any) => c.tipo === 'escolaridad') && (
                      <div style={{ padding: '12px 14px', background: 'linear-gradient(135deg, #f8f0ff, #fff)', border: '2px solid #c7a0f0', borderRadius: 12, marginBottom: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                          <i className="bi bi-mortarboard-fill" style={{ color: '#7c3aed', fontSize: 16 }} />
                          <span style={{ fontWeight: 700, fontSize: 13, color: '#4c1d95', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Escolaridad</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {alumnoConceptos.filter((c: any) => c.tipo === 'escolaridad').map(renderConceptoCard)}
                        </div>
                      </div>
                    )}
                    {/* Matrícula y mensualidades */}
                    {alumnoConceptos.filter((c: any) => c.tipo !== 'escolaridad').map(renderConceptoCard)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: Pagos Online ── */}
      {/* ── TAB 2: Resumen ── */}
      {tab === 2 && (
        <div style={{ ...s.card, overflowX: 'auto' }}>
          <div style={{ ...s.row, marginBottom: 16, justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, color: '#0d4f5c', fontSize: 15 }}>Resumen de pagos por ciclo</span>
            <button style={s.btnSecondary} onClick={loadResumen}><i className="bi bi-arrow-clockwise" /> Actualizar</button>
          </div>
          {loading && <p style={{ color: '#6c8a91' }}>Cargando...</p>}
          {!loading && resumen && (
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Alumno</th>
                  <th style={s.th}>Código</th>
                  <th style={s.th}>Pagados</th>
                  {resumen.conceptos.map((c: any) => (
                    <th key={c.id} style={{ ...s.th, fontSize: 11, maxWidth: 90, whiteSpace: 'normal' as const, textAlign: 'center' as const }}>
                      {c.descripcion}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {resumen.alumnos.map((row: any) => (
                  <tr key={row.alumno.id}>
                    <td style={s.td}>
                      <span style={{ fontWeight: 600 }}>{row.alumno.nombres} {row.alumno.apellidos}</span>
                      {row.alumno.suspendido && <span style={{ ...s.badge, background: '#ffe0e0', color: '#c0392b', fontSize: 10, marginLeft: 6 }}>SUSP</span>}
                    </td>
                    <td style={s.td}>{row.alumno.codigo}</td>
                    <td style={s.td}>
                      <span style={{ fontWeight: 700, color: row.total_pagados === row.total_conceptos ? '#27ae60' : '#856404' }}>
                        {row.total_pagados}/{row.total_conceptos}
                      </span>
                    </td>
                    {row.pagos.map((p: any) => (
                      <td key={p.concepto_id} style={{ ...s.td, textAlign: 'center' as const }}>
                        {p.pago ? (
                          <span title={`S/ ${Number(p.pago.monto_pagado).toFixed(2)} · ${p.pago.metodo_pago} · ${p.pago.fecha_pago}`} style={{ fontSize: 18, cursor: 'default' }}>✅</span>
                        ) : (
                          <span title={`Pendiente · Vence ${p.fecha_vencimiento ?? 'N/A'}`} style={{ fontSize: 16, cursor: 'default', opacity: 0.5 }}>⬜</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && !resumen && <p style={{ color: '#6c8a91', fontSize: 13 }}>Selecciona un ciclo y haz clic en Actualizar.</p>}
        </div>
      )}

      {/* ── TAB 3: Configuración ── */}
      {tab === 3 && (
        <div style={s.card}>
          <div style={{ ...s.row, marginBottom: 16, justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, color: '#0d4f5c', fontSize: 15 }}>Configuración de Pagos por Ciclo</span>
            <button style={s.btnPrimary} onClick={saveConfig}><i className="bi bi-save" /> Guardar configuración</button>
          </div>
          {!configPagos ? (
            <p style={{ color: '#6c8a91' }}>Cargando configuración...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              <div style={{ padding: '16px', border: '1.5px solid #e0eef0', borderRadius: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0d4f5c', marginBottom: 12 }}>Visibilidad</h3>
                <div style={s.formGroup}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                    <input type="checkbox" checked={configPagos.pagos_visible} onChange={e => setConfigPagos((f: any) => ({ ...f, pagos_visible: e.target.checked }))} style={{ accentColor: '#0a9396' }} />
                    Pagos visibles para los alumnos del ciclo
                  </label>
                </div>
              </div>

              <div style={{ padding: '16px', border: '1.5px solid #e0eef0', borderRadius: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0d4f5c', marginBottom: 12 }}>Cuentas Bancarias</h3>
                <label style={s.label}>BCP (Cuenta / CCI)</label>
                <div style={{ ...s.row, marginBottom: 8 }}>
                  <input style={{ ...s.input, flex: 1 }} value={configPagos.bcp_cuenta || ''} onChange={e => setConfigPagos((f: any) => ({ ...f, bcp_cuenta: e.target.value }))} placeholder="N° Cuenta" />
                  <input style={{ ...s.input, flex: 1 }} value={configPagos.bcp_cci || ''} onChange={e => setConfigPagos((f: any) => ({ ...f, bcp_cci: e.target.value }))} placeholder="CCI" />
                </div>
                <label style={s.label}>BBVA (Cuenta / CCI)</label>
                <div style={{ ...s.row, marginBottom: 8 }}>
                  <input style={{ ...s.input, flex: 1 }} value={configPagos.bbva_cuenta || ''} onChange={e => setConfigPagos((f: any) => ({ ...f, bbva_cuenta: e.target.value }))} placeholder="N° Cuenta" />
                  <input style={{ ...s.input, flex: 1 }} value={configPagos.bbva_cci || ''} onChange={e => setConfigPagos((f: any) => ({ ...f, bbva_cci: e.target.value }))} placeholder="CCI" />
                </div>
                <label style={s.label}>Interbank (Cuenta / CCI)</label>
                <div style={{ ...s.row }}>
                  <input style={{ ...s.input, flex: 1 }} value={configPagos.interbank_cuenta || ''} onChange={e => setConfigPagos((f: any) => ({ ...f, interbank_cuenta: e.target.value }))} placeholder="N° Cuenta" />
                  <input style={{ ...s.input, flex: 1 }} value={configPagos.interbank_cci || ''} onChange={e => setConfigPagos((f: any) => ({ ...f, interbank_cci: e.target.value }))} placeholder="CCI" />
                </div>
              </div>

              <div style={{ padding: '16px', border: '1.5px solid #e0eef0', borderRadius: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0d4f5c', marginBottom: 12 }}>Yape / Plin</h3>
                <label style={s.label}>Número Yape</label>
                <input style={{ ...s.input, marginBottom: 8 }} value={configPagos.yape_numero || ''} onChange={e => setConfigPagos((f: any) => ({ ...f, yape_numero: e.target.value }))} />
                <label style={s.label}>URL QR Yape</label>
                <input style={{ ...s.input, marginBottom: 8 }} value={configPagos.yape_qr_url || ''} onChange={e => setConfigPagos((f: any) => ({ ...f, yape_qr_url: e.target.value }))} placeholder="https://..." />
                <label style={s.label}>Número Plin</label>
                <input style={{ ...s.input, marginBottom: 8 }} value={configPagos.plin_numero || ''} onChange={e => setConfigPagos((f: any) => ({ ...f, plin_numero: e.target.value }))} />
                <label style={s.label}>URL QR Plin</label>
                <input style={{ ...s.input, marginBottom: 8 }} value={configPagos.plin_qr_url || ''} onChange={e => setConfigPagos((f: any) => ({ ...f, plin_qr_url: e.target.value }))} placeholder="https://..." />
                <label style={s.label}>Número WhatsApp contacto (sin +, ej: 51924513040)</label>
                <input style={{ ...s.input }} value={configPagos.whatsapp_numero || ''} onChange={e => setConfigPagos((f: any) => ({ ...f, whatsapp_numero: e.target.value }))} placeholder="Ej: 51924513040" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modal Concepto ── */}
      {showConceptoModal && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) setShowConceptoModal(false) }}>
          <div style={s.modalBox}>
            <div style={s.modalTitle}>{editConcepto ? 'Editar concepto' : 'Nuevo concepto de pago'}</div>
            <div style={s.formGroup}>
              <div style={s.label}>Tipo</div>
              <select style={s.input} value={conceptoForm.tipo} onChange={e => setConceptoForm((f: any) => ({ ...f, tipo: e.target.value }))}>
                <option value="mensualidad">Mensualidad</option>
                <option value="matricula">Matrícula</option>
                <option value="materiales">Materiales</option>
                <option value="escolaridad">Escolaridad</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div style={s.formGroup}>
              <div style={s.label}>Descripción *</div>
              <input style={s.input} value={conceptoForm.descripcion} onChange={e => setConceptoForm((f: any) => ({ ...f, descripcion: e.target.value }))} placeholder="Ej: Pensión Marzo 2025" />
            </div>
            <div style={{ ...s.row, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={s.label}>Mes</div>
                <select style={s.input} value={conceptoForm.mes} onChange={e => setConceptoForm((f: any) => ({ ...f, mes: e.target.value }))}>
                  <option value="">— Sin mes —</option>
                  {MESES.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.label}>Año</div>
                <input style={s.input} type="number" value={conceptoForm.anio} onChange={e => setConceptoForm((f: any) => ({ ...f, anio: e.target.value }))} placeholder="2025" />
              </div>
            </div>
            <div style={{ ...s.row, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={s.label}>Monto Tarifa A *</div>
                <input style={s.input} type="number" value={conceptoForm.monto_opcion_1} onChange={e => setConceptoForm((f: any) => ({ ...f, monto_opcion_1: e.target.value }))} placeholder="350" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.label}>Etiqueta Tarifa A</div>
                <input style={s.input} value={conceptoForm.etiqueta_opcion_1} onChange={e => setConceptoForm((f: any) => ({ ...f, etiqueta_opcion_1: e.target.value }))} />
              </div>
            </div>
            <div style={{ ...s.row, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={s.label}>Monto Tarifa B (opcional)</div>
                <input style={s.input} type="number" value={conceptoForm.monto_opcion_2} onChange={e => setConceptoForm((f: any) => ({ ...f, monto_opcion_2: e.target.value }))} placeholder="300" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.label}>Etiqueta Tarifa B</div>
                <input style={s.input} value={conceptoForm.etiqueta_opcion_2} onChange={e => setConceptoForm((f: any) => ({ ...f, etiqueta_opcion_2: e.target.value }))} />
              </div>
            </div>
            <div style={{ ...s.row, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={s.label}>Fecha vencimiento</div>
                <input style={s.input} type="date" value={conceptoForm.fecha_vencimiento} onChange={e => setConceptoForm((f: any) => ({ ...f, fecha_vencimiento: e.target.value }))} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={s.label}>Orden</div>
                <input style={s.input} type="number" value={conceptoForm.orden} onChange={e => setConceptoForm((f: any) => ({ ...f, orden: Number(e.target.value) }))} />
              </div>
            </div>

            <div style={{ ...s.row, justifyContent: 'flex-end', marginTop: 8 }}>
              <button style={s.btnSecondary} onClick={() => setShowConceptoModal(false)}>Cancelar</button>
              <button style={s.btnPrimary} onClick={saveConcepto}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Pago ── */}
      {showPagoModal && (
        <div style={s.modal} onClick={e => { if (e.target === e.currentTarget) setShowPagoModal(false) }}>
          <div style={s.modalBox}>
            <div style={s.modalTitle}>{editPago ? 'Editar pago' : 'Registrar pago'}</div>
            {pagoConcepto && (
              <div style={{ background: '#f0f7f8', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#0d4f5c' }}>
                <strong>{pagoConcepto.descripcion}</strong>
                {pagoConcepto.fecha_vencimiento && <span style={{ marginLeft: 8, color: '#6c8a91' }}>Vence: {pagoConcepto.fecha_vencimiento}</span>}
              </div>
            )}
            {pagoConcepto?.monto_opcion_2 && (
              <div style={s.formGroup}>
                <div style={s.label}>Tarifa</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['opcion_1', 'opcion_2'].map(op => (
                    <label key={op} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, padding: '8px 14px', borderRadius: 8, border: `1.5px solid ${pagoForm.opcion_pago === op ? '#0a9396' : '#cde0e4'}`, background: pagoForm.opcion_pago === op ? '#e8f5f6' : 'white' }}>
                      <input type="radio" checked={pagoForm.opcion_pago === op} onChange={() => opcionChange(op)} style={{ accentColor: '#0a9396' }} />
                      {op === 'opcion_1' ? pagoConcepto.etiqueta_opcion_1 : pagoConcepto.etiqueta_opcion_2}
                      <strong style={{ marginLeft: 4 }}>S/ {op === 'opcion_1' ? Number(pagoConcepto.monto_opcion_1).toFixed(2) : Number(pagoConcepto.monto_opcion_2).toFixed(2)}</strong>
                    </label>
                  ))}
                </div>
              </div>
            )}
            <div style={s.formGroup}>
              <div style={s.label}>Monto pagado *</div>
              <input style={s.input} type="number" value={pagoForm.monto_pagado} onChange={e => setPagoForm((f: any) => ({ ...f, monto_pagado: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <div style={s.label}>Método de pago *</div>
              <select style={s.input} value={pagoForm.metodo_pago} onChange={e => setPagoForm((f: any) => ({ ...f, metodo_pago: e.target.value }))}>
                <option value="Yape">Yape</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
              </select>
            </div>
            <div style={s.formGroup}>
              <div style={s.label}>Fecha de pago *</div>
              <input style={s.input} type="date" value={pagoForm.fecha_pago} onChange={e => setPagoForm((f: any) => ({ ...f, fecha_pago: e.target.value }))} />
            </div>
            <div style={s.formGroup}>
              <div style={s.label}>N° operación (opcional)</div>
              <input style={s.input} value={pagoForm.numero_operacion} onChange={e => setPagoForm((f: any) => ({ ...f, numero_operacion: e.target.value }))} placeholder="Ej: 123456789" />
            </div>
            <div style={s.formGroup}>
              <div style={s.label}>Código de recibo (opcional)</div>
              <input style={s.input} value={pagoForm.codigo_recibo} onChange={e => setPagoForm((f: any) => ({ ...f, codigo_recibo: e.target.value }))} placeholder="Ej: REC-2026-001" />
            </div>
            <div style={s.formGroup}>
              <div style={s.label}>Observaciones</div>
              <textarea style={{ ...s.input, minHeight: 64, resize: 'vertical' as const }} value={pagoForm.observaciones} onChange={e => setPagoForm((f: any) => ({ ...f, observaciones: e.target.value }))} />
            </div>
            <div style={{ ...s.row, marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input type="checkbox" checked={pagoForm.visible_alumno} onChange={e => setPagoForm((f: any) => ({ ...f, visible_alumno: e.target.checked }))} style={{ accentColor: '#0a9396' }} />
                Visible para el alumno
              </label>
            </div>
            <div style={{ ...s.row, justifyContent: 'flex-end', gap: 10 }}>
              <button style={s.btnSecondary} onClick={() => setShowPagoModal(false)}>Cancelar</button>
              <button style={s.btnPrimary} onClick={savePago}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
