import { useEffect, useState, useCallback } from 'react'
import { adminApi } from '../../models/adminApi'
import type { PlantillaExamen, PlantillaCursoItem, PlantillaSeccionItem } from '../../models/types'

// ─── tipos locales del editor ──────────────────────────────────────────────
interface CursoEditor {
  nombre: string
  cantidadPreguntas: string
  puntajeBuena: string
  puntajeMala: string
}

interface SeccionEditor {
  nombre: string
  cursos: CursoEditor[]
}

interface PlantillaForm {
  nombre: string
  descripcion: string
  tipo_calculo: 'buenas_malas' | 'nota_directa'
  tiene_secciones: boolean
  secciones: SeccionEditor[]
  cursos: CursoEditor[]
}

const FORM_VACIO: PlantillaForm = {
  nombre: '',
  descripcion: '',
  tipo_calculo: 'buenas_malas',
  tiene_secciones: false,
  secciones: [],
  cursos: [],
}

function cursoVacio(): CursoEditor {
  return { nombre: '', cantidadPreguntas: '', puntajeBuena: '4', puntajeMala: '1' }
}

function seccionVacia(): SeccionEditor {
  return { nombre: '', cursos: [cursoVacio()] }
}

// ─── utilidades ─────────────────────────────────────────────────────────────
function plantillaToForm(p: PlantillaExamen): PlantillaForm {
  const secciones: SeccionEditor[] = (p.Secciones ?? []).map(s => ({
    nombre: s.nombre,
    cursos: (s.Cursos ?? []).map(c => ({
      nombre: c.nombre,
      cantidadPreguntas: c.cantidadPreguntas != null ? String(c.cantidadPreguntas) : '',
      puntajeBuena: String(c.puntajeBuena),
      puntajeMala: String(c.puntajeMala),
    })),
  }))

  const cursos: CursoEditor[] = (p.Cursos ?? []).map(c => ({
    nombre: c.nombre,
    cantidadPreguntas: c.cantidadPreguntas != null ? String(c.cantidadPreguntas) : '',
    puntajeBuena: String(c.puntajeBuena),
    puntajeMala: String(c.puntajeMala),
  }))

  return {
    nombre: p.nombre,
    descripcion: p.descripcion ?? '',
    tipo_calculo: p.tipo_calculo,
    tiene_secciones: !!p.tiene_secciones,
    secciones,
    cursos,
  }
}

function formToPayload(f: PlantillaForm) {
  const mapCurso = (c: CursoEditor, i: number): PlantillaCursoItem => ({
    nombre: c.nombre,
    cantidadPreguntas: c.cantidadPreguntas ? Number(c.cantidadPreguntas) : null,
    puntajeBuena: Number(c.puntajeBuena) || 4,
    puntajeMala: Number(c.puntajeMala) || 1,
    orden: i,
  })

  const secciones = f.secciones.map((s, i) => ({
    nombre: s.nombre,
    orden: i,
    cursos: s.cursos.map(mapCurso),
  }))

  const cursos: PlantillaCursoItem[] = f.cursos.map(mapCurso)

  return {
    nombre: f.nombre,
    descripcion: f.descripcion || null,
    tipo_calculo: f.tipo_calculo,
    tiene_secciones: f.tiene_secciones,
    secciones: f.tiene_secciones ? secciones : [],
    cursos: f.tiene_secciones ? [] : cursos,
  }
}

// ─── componente principal ────────────────────────────────────────────────────
export default function AdminPlantillasView() {
  const [plantillas, setPlantillas] = useState<PlantillaExamen[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Editor
  const [editando, setEditando] = useState<number | 'nueva' | null>(null)
  const [form, setForm] = useState<PlantillaForm>(FORM_VACIO)
  const [saving, setSaving] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const r = await adminApi.getPlantillasExamen()
      setPlantillas(r.data)
    } catch {
      setError('Error al cargar plantillas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  function abrirNueva() {
    setForm(FORM_VACIO)
    setEditando('nueva')
    setError(null)
    setSuccess(null)
  }

  async function abrirEditar(id: number) {
    try {
      const r = await adminApi.getPlantillaExamen(id)
      setForm(plantillaToForm(r.data))
      setEditando(id)
      setError(null)
      setSuccess(null)
    } catch {
      setError('Error al cargar plantilla')
    }
  }

  function cerrarEditor() {
    setEditando(null)
  }

  async function guardar() {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    setSaving(true)
    setError(null)
    try {
      const payload = formToPayload(form)
      if (editando === 'nueva') {
        await adminApi.crearPlantillaExamen(payload as any)
        setSuccess('Plantilla creada correctamente')
      } else {
        await adminApi.actualizarPlantillaExamen(editando as number, payload as any)
        setSuccess('Plantilla actualizada correctamente')
      }
      setEditando(null)
      await cargar()
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(id: number, nombre: string) {
    if (!confirm(`¿Eliminar la plantilla "${nombre}"?`)) return
    try {
      const r = await adminApi.eliminarPlantillaExamen(id)
      setSuccess((r.data as any)?.mensaje ?? 'Plantilla eliminada')
      await cargar()
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Error al eliminar')
    }
  }

  // ── Helpers form ──────────────────────────────────────────────────────────
  function setField<K extends keyof PlantillaForm>(k: K, v: PlantillaForm[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  // Cursos directos
  function addCurso() { setForm(f => ({ ...f, cursos: [...f.cursos, cursoVacio()] })) }
  function removeCurso(i: number) { setForm(f => ({ ...f, cursos: f.cursos.filter((_, j) => j !== i) })) }
  function setCurso(i: number, k: keyof CursoEditor, v: string) {
    setForm(f => {
      const cursos = [...f.cursos]
      cursos[i] = { ...cursos[i], [k]: v }
      return { ...f, cursos }
    })
  }

  // Secciones
  function addSeccion() { setForm(f => ({ ...f, secciones: [...f.secciones, seccionVacia()] })) }
  function removeSeccion(si: number) { setForm(f => ({ ...f, secciones: f.secciones.filter((_, j) => j !== si) })) }
  function setSeccionNombre(si: number, v: string) {
    setForm(f => {
      const secciones = [...f.secciones]
      secciones[si] = { ...secciones[si], nombre: v }
      return { ...f, secciones }
    })
  }
  function addCursoSeccion(si: number) {
    setForm(f => {
      const secciones = [...f.secciones]
      secciones[si] = { ...secciones[si], cursos: [...secciones[si].cursos, cursoVacio()] }
      return { ...f, secciones }
    })
  }
  function removeCursoSeccion(si: number, ci: number) {
    setForm(f => {
      const secciones = [...f.secciones]
      secciones[si] = { ...secciones[si], cursos: secciones[si].cursos.filter((_, j) => j !== ci) }
      return { ...f, secciones }
    })
  }
  function setCursoSeccion(si: number, ci: number, k: keyof CursoEditor, v: string) {
    setForm(f => {
      const secciones = [...f.secciones]
      const cursos = [...secciones[si].cursos]
      cursos[ci] = { ...cursos[ci], [k]: v }
      secciones[si] = { ...secciones[si], cursos }
      return { ...f, secciones }
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 960, margin: '0 auto', padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0d4f5c', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#0a9396,#0d4f5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 17, flexShrink: 0 }}>
              <i className="bi bi-layout-text-sidebar-reverse" />
            </span>
            Plantillas de Examen
          </h1>
          <p style={{ margin: '4px 0 0 48px', fontSize: 13, color: '#6c757d' }}>
            Define los tipos de evaluación, secciones y cursos con sus puntajes base
          </p>
        </div>
        <button onClick={abrirNueva} style={btnPrimary}>
          <i className="bi bi-plus-lg" /> Nueva plantilla
        </button>
      </div>

      {/* Alerts */}
      {error   && <div style={alertError}><i className="bi bi-exclamation-circle" /> {error}</div>}
      {success && <div style={alertSuccess}><i className="bi bi-check-circle" /> {success}</div>}

      {/* Lista de plantillas */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#6c757d' }}>Cargando…</div>
      ) : plantillas.length === 0 ? (
        <div style={emptyBox}>
          <i className="bi bi-journal-x" style={{ fontSize: 36, color: '#94d2bd', display: 'block', marginBottom: 8 }} />
          No hay plantillas creadas. Crea la primera para empezar a registrar exámenes.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plantillas.map(p => (
            <PlantillaCard key={p.id} plantilla={p} onEdit={abrirEditar} onDelete={eliminar} />
          ))}
        </div>
      )}

      {/* Editor modal / panel lateral */}
      {editando !== null && (
        <EditorOverlay
          form={form}
          esNueva={editando === 'nueva'}
          saving={saving}
          onClose={cerrarEditor}
          onGuardar={guardar}
          setField={setField}
          addCurso={addCurso}
          removeCurso={removeCurso}
          setCurso={setCurso}
          addSeccion={addSeccion}
          removeSeccion={removeSeccion}
          setSeccionNombre={setSeccionNombre}
          addCursoSeccion={addCursoSeccion}
          removeCursoSeccion={removeCursoSeccion}
          setCursoSeccion={setCursoSeccion}
        />
      )}
    </div>
  )
}

// ─── PlantillaCard ────────────────────────────────────────────────────────────
function PlantillaCard({ plantilla, onEdit, onDelete }: {
  plantilla: PlantillaExamen
  onEdit: (id: number) => void
  onDelete: (id: number, nombre: string) => void
}) {
  const totalCursos = plantilla.tiene_secciones
    ? (plantilla.Secciones ?? []).reduce((s, sec) => s + (sec.Cursos?.length ?? 0), 0)
    : (plantilla.Cursos ?? []).length

  return (
    <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid #f0f4f5', background: 'linear-gradient(90deg,#e8f4f5,#fff)' }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#0a9396,#0d4f5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, flexShrink: 0 }}>
          <i className="bi bi-journal-bookmark" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#0d4f5c' }}>{plantilla.nombre}</div>
          {plantilla.descripcion && <div style={{ fontSize: 12, color: '#6c757d', marginTop: 2 }}>{plantilla.descripcion}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={badgeTeal}>{plantilla.tipo_calculo === 'buenas_malas' ? 'Buenas/Malas' : 'Nota directa'}</span>
          {plantilla.tiene_secciones ? <span style={badgeBlue}>Con secciones</span> : null}
          <span style={badgeGray}>{totalCursos} cursos</span>
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
          <button onClick={() => onEdit(plantilla.id)} style={btnEdit} title="Editar"><i className="bi bi-pencil" /></button>
          <button onClick={() => onDelete(plantilla.id, plantilla.nombre)} style={btnDanger} title="Eliminar"><i className="bi bi-trash" /></button>
        </div>
      </div>

      {/* Preview de secciones / cursos */}
      <div style={{ padding: '12px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {plantilla.tiene_secciones
          ? (plantilla.Secciones ?? []).map((sec, si) => (
              <div key={si} style={{ background: '#f0f6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 12px', fontSize: 12 }}>
                <span style={{ fontWeight: 700, color: '#1d3557' }}>{sec.nombre}</span>
                <span style={{ color: '#457b9d', marginLeft: 6 }}>({sec.Cursos?.length ?? 0})</span>
              </div>
            ))
          : (plantilla.Cursos ?? []).map((c, ci) => (
              <span key={ci} style={{ background: '#e8f4f5', color: '#0d4f5c', border: '1px solid #94d2bd', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                {c.nombre}{c.cantidadPreguntas ? ` (${c.cantidadPreguntas}Q)` : ''}
              </span>
            ))
        }
      </div>
    </div>
  )
}

// ─── EditorOverlay ─────────────────────────────────────────────────────────────
function EditorOverlay({ form, esNueva, saving, onClose, onGuardar, setField, addCurso, removeCurso, setCurso, addSeccion, removeSeccion, setSeccionNombre, addCursoSeccion, removeCursoSeccion, setCursoSeccion }: {
  form: PlantillaForm
  esNueva: boolean
  saving: boolean
  onClose: () => void
  onGuardar: () => void
  setField: <K extends keyof PlantillaForm>(k: K, v: PlantillaForm[K]) => void
  addCurso: () => void
  removeCurso: (i: number) => void
  setCurso: (i: number, k: keyof CursoEditor, v: string) => void
  addSeccion: () => void
  removeSeccion: (si: number) => void
  setSeccionNombre: (si: number, v: string) => void
  addCursoSeccion: (si: number) => void
  removeCursoSeccion: (si: number, ci: number) => void
  setCursoSeccion: (si: number, ci: number, k: keyof CursoEditor, v: string) => void
}) {
  const esBuenasMalas = form.tipo_calculo === 'buenas_malas'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 680, height: '100%', overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column' }}>
        {/* Header panel */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #dee2e6', background: 'linear-gradient(90deg,#e8f4f5,#fff)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#0d4f5c' }}>{esNueva ? 'Nueva plantilla' : 'Editar plantilla'}</div>
            <div style={{ fontSize: 12, color: '#6c757d', marginTop: 2 }}>Define el tipo, secciones y cursos con sus puntajes</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6c757d', padding: 4 }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Datos básicos */}
          <section>
            <SectionTitle icon="bi-info-circle" title="Datos generales" />
            <Field label="Nombre de la plantilla *">
              <input value={form.nombre} onChange={e => setField('nombre', e.target.value)} placeholder="Ej: Simulacro OMR, Examen UNI, Actitudinal…" style={inputStyle} />
            </Field>
            <Field label="Descripción (opcional)">
              <input value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} placeholder="Breve descripción del tipo de evaluación" style={inputStyle} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Field label="Tipo de cálculo">
                <div style={{ position: 'relative' }}>
                  <select value={form.tipo_calculo} onChange={e => setField('tipo_calculo', e.target.value as any)} style={selectStyle}>
                    <option value="buenas_malas">Buenas / Malas</option>
                    <option value="nota_directa">Nota directa (0–20)</option>
                  </select>
                  <SelectCaret />
                </div>
              </Field>
              <Field label="¿Con secciones?">
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', cursor: 'pointer', userSelect: 'none' }}>
                  <input type="checkbox" checked={form.tiene_secciones} onChange={e => setField('tiene_secciones', e.target.checked)} style={{ width: 16, height: 16, cursor: 'pointer' }} />
                  <span style={{ fontSize: 13, color: '#212529' }}>
                    {form.tiene_secciones ? 'Sí (p.ej. UNI: Habilidades, Ciencias…)' : 'No (lista plana de cursos)'}
                  </span>
                </label>
              </Field>
            </div>
          </section>

          {/* Cursos o secciones */}
          {form.tiene_secciones ? (
            <section>
              <SectionTitle icon="bi-diagram-3" title="Secciones y cursos" />
              <p style={{ fontSize: 12, color: '#6c757d', marginBottom: 14, marginTop: -4 }}>
                Cada sección agrupa cursos (p.ej. <b>Habilidades</b> → Aptitud Verbal, Razonamiento Matemático).
              </p>
              {form.secciones.map((sec, si) => (
                <SeccionEditor key={si} seccion={sec} si={si} esBuenasMalas={esBuenasMalas}
                  onNombre={v => setSeccionNombre(si, v)}
                  onRemoveSeccion={() => removeSeccion(si)}
                  onAddCurso={() => addCursoSeccion(si)}
                  onRemoveCurso={ci => removeCursoSeccion(si, ci)}
                  onSetCurso={(ci, k, v) => setCursoSeccion(si, ci, k, v)}
                />
              ))}
              <button onClick={addSeccion} style={btnDashed}>
                <i className="bi bi-plus-circle" /> Agregar sección
              </button>
            </section>
          ) : (
            <section>
              <SectionTitle icon="bi-list-ul" title="Cursos evaluados" />
              {form.tipo_calculo === 'nota_directa' && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#92400e', marginBottom: 12 }}>
                  <i className="bi bi-info-circle" /> En nota directa los cursos son opcionales. Si los agregas, permite llevar registro por área.
                </div>
              )}
              {form.cursos.length === 0 && (
                <div style={emptyBox}>Sin cursos aún. Agrega al menos uno.</div>
              )}
              {form.cursos.map((cur, ci) => (
                <CursoRow key={ci} curso={cur} index={ci} esBuenasMalas={esBuenasMalas}
                  onChange={(k, v) => setCurso(ci, k, v)}
                  onRemove={() => removeCurso(ci)}
                />
              ))}
              <button onClick={addCurso} style={btnDashed}>
                <i className="bi bi-plus-circle" /> Agregar curso
              </button>
            </section>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #dee2e6', display: 'flex', gap: 10, justifyContent: 'flex-end', background: '#fafafa' }}>
          <button onClick={onClose} style={btnSecondary} disabled={saving}>Cancelar</button>
          <button onClick={onGuardar} style={btnPrimary} disabled={saving}>
            {saving ? <><i className="bi bi-hourglass-split" /> Guardando…</> : <><i className="bi bi-check-lg" /> {esNueva ? 'Crear plantilla' : 'Guardar cambios'}</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SeccionEditor ─────────────────────────────────────────────────────────────
function SeccionEditor({ seccion, si, esBuenasMalas, onNombre, onRemoveSeccion, onAddCurso, onRemoveCurso, onSetCurso }: {
  seccion: SeccionEditor
  si: number
  esBuenasMalas: boolean
  onNombre: (v: string) => void
  onRemoveSeccion: () => void
  onAddCurso: () => void
  onRemoveCurso: (ci: number) => void
  onSetCurso: (ci: number, k: keyof CursoEditor, v: string) => void
}) {
  return (
    <div style={{ border: '1px solid #bfdbfe', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ background: '#eff6ff', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontWeight: 700, fontSize: 12, color: '#1d3557', flex: 1 }}>
          <i className="bi bi-collection" style={{ marginRight: 6 }} />Sección {si + 1}
        </span>
        <input value={seccion.nombre} onChange={e => onNombre(e.target.value)} placeholder="Nombre de la sección (Ej: Habilidades)" style={{ ...inputStyle, flex: 2, padding: '6px 10px', fontSize: 13 }} />
        <button onClick={onRemoveSeccion} style={btnDangerSm} title="Eliminar sección"><i className="bi bi-trash" /></button>
      </div>
      <div style={{ padding: '10px 14px', background: '#fff' }}>
        {seccion.cursos.map((cur, ci) => (
          <CursoRow key={ci} curso={cur} index={ci} esBuenasMalas={esBuenasMalas}
            onChange={(k, v) => onSetCurso(ci, k, v)}
            onRemove={() => onRemoveCurso(ci)}
          />
        ))}
        <button onClick={onAddCurso} style={{ ...btnDashed, fontSize: 11, padding: '5px 12px' }}>
          <i className="bi bi-plus" /> Agregar curso a esta sección
        </button>
      </div>
    </div>
  )
}

// ─── CursoRow ─────────────────────────────────────────────────────────────────
function CursoRow({ curso, index, esBuenasMalas, onChange, onRemove }: {
  curso: CursoEditor
  index: number
  esBuenasMalas: boolean
  onChange: (k: keyof CursoEditor, v: string) => void
  onRemove: () => void
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: esBuenasMalas ? '2fr 1fr 1fr 1fr 32px' : '2fr 1fr 32px', gap: 8, alignItems: 'center', marginBottom: 8, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 9, padding: '8px 10px' }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 3 }}>Curso {index + 1}</div>
        <input value={curso.nombre} onChange={e => onChange('nombre', e.target.value)} placeholder="Nombre del curso" style={{ ...inputStyle, padding: '5px 8px', fontSize: 12 }} />
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 3 }}>N° preg.</div>
        <input type="number" min={0} value={curso.cantidadPreguntas} onChange={e => onChange('cantidadPreguntas', e.target.value)} placeholder="—" style={{ ...inputStyle, padding: '5px 8px', fontSize: 12 }} />
      </div>
      {esBuenasMalas && <>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: 3 }}>Pts. buena</div>
          <input type="number" step="0.001" min={0} value={curso.puntajeBuena} onChange={e => onChange('puntajeBuena', e.target.value)} style={{ ...inputStyle, padding: '5px 8px', fontSize: 12 }} />
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: '#b91c1c', textTransform: 'uppercase', marginBottom: 3 }}>Pts. mala</div>
          <input type="number" step="0.001" min={0} value={curso.puntajeMala} onChange={e => onChange('puntajeMala', e.target.value)} style={{ ...inputStyle, padding: '5px 8px', fontSize: 12 }} />
        </div>
      </>}
      <button onClick={onRemove} style={btnDangerSm}><i className="bi bi-x" /></button>
    </div>
  )
}

// ─── Sub-componentes pequeños ─────────────────────────────────────────────────
function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
      <span style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#0a9396,#0d4f5c)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12 }}>
        <i className={`bi ${icon}`} />
      </span>
      <span style={{ fontWeight: 700, fontSize: 13, color: '#0d4f5c' }}>{title}</span>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6c757d', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function SelectCaret() {
  return (
    <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#6c757d', pointerEvents: 'none', fontSize: 12 }}>
      <i className="bi bi-chevron-down" />
    </span>
  )
}

// ─── Estilos ─────────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #dee2e6', borderRadius: 9,
  fontSize: 13, fontFamily: 'inherit', background: '#fafafa', outline: 'none',
  boxSizing: 'border-box',
}
const selectStyle: React.CSSProperties = {
  ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 30, cursor: 'pointer',
}
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 9,
  border: 'none', background: 'linear-gradient(135deg,#0a9396,#0d4f5c)', color: '#fff',
  fontSize: 13, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
  boxShadow: '0 4px 10px rgba(10,147,150,0.25)',
}
const btnSecondary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 9,
  border: '1.5px solid #dee2e6', background: '#fff', color: '#495057',
  fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer',
}
const btnEdit: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, border: '1.5px solid #94d2bd', background: '#e8f4f5',
  color: '#0d4f5c', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
}
const btnDanger: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8, border: '1.5px solid #fca5a5', background: '#fff5f5',
  color: '#b91c1c', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
}
const btnDangerSm: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 7, border: 'none', background: '#fff0ed',
  color: '#e76f51', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
}
const btnDashed: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
  border: '1.5px dashed #94d2bd', background: '#e8f4f5', color: '#0d4f5c',
  fontSize: 12, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', marginTop: 6,
}
const alertError: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, background: '#fff5f5',
  border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px',
  color: '#b91c1c', fontSize: 13, marginBottom: 16,
}
const alertSuccess: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, background: '#f0fdf4',
  border: '1px solid #86efac', borderRadius: 10, padding: '12px 16px',
  color: '#166534', fontSize: 13, marginBottom: 16,
}
const emptyBox: React.CSSProperties = {
  textAlign: 'center', padding: 32, color: '#6c757d', fontSize: 13,
  background: '#f8fafc', borderRadius: 12, border: '1.5px dashed #dee2e6',
}
const badgeTeal: React.CSSProperties = {
  padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700,
  background: '#e8f4f5', color: '#0d4f5c', border: '1px solid #94d2bd',
}
const badgeBlue: React.CSSProperties = {
  padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 700,
  background: '#eff6ff', color: '#1d3557', border: '1px solid #bfdbfe',
}
const badgeGray: React.CSSProperties = {
  padding: '2px 9px', borderRadius: 20, fontSize: 10, fontWeight: 600,
  background: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0',
}
