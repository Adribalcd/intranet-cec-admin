import { useEffect, useState } from 'react'
import { adminApi } from '../../models/adminApi'

type Rol = 'general' | 'academico' | 'pagos'

interface AdminUser {
  id: number
  usuario: string
  nombre: string | null
  rol: Rol
}

const ROL_COLOR: Record<Rol, string> = {
  general:   '#0a9396',
  academico: '#5c40b0',
  pagos:     '#856404',
}
const ROL_LABEL: Record<Rol, string> = {
  general:   'General',
  academico: 'Académico',
  pagos:     'Pagos',
}
const ROL_DESC: Record<Rol, string> = {
  general:   'Acceso completo a todo el sistema',
  academico: 'Solo módulos académicos (sin pagos)',
  pagos:     'Solo módulo de pagos',
}

const s: Record<string, React.CSSProperties> = {
  page:    { padding: '0 0 60px', fontFamily: 'Plus Jakarta Sans, sans-serif' },
  h1:      { fontSize: 22, fontWeight: 700, color: '#0d4f5c', margin: '0 0 4px' },
  sub:     { fontSize: 13, color: '#6c8a91', margin: 0 },
  card:    { background: 'white', borderRadius: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', overflow: 'hidden', marginBottom: 16 },
  row:     { display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: '1px solid #f0f4f5' },
  badge:   { display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: 'white' },
  btn:     { padding: '8px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  input:   { padding: '10px 12px', borderRadius: 9, border: '1.5px solid #e2e8f0', fontSize: 13, width: '100%' },
  label:   { fontSize: 11, fontWeight: 700, textTransform: 'uppercase' as const, color: '#64748b', display: 'block', marginBottom: 4 },
  fgroup:  { marginBottom: 14 },
  modal:   { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  mbox:    { background: 'white', borderRadius: 16, width: '100%', maxWidth: 420, padding: 24 },
}

export function AdminUsuariosView() {
  const [users, setUsers]         = useState<AdminUser[]>([])
  const [loading, setLoading]     = useState(true)
  const [msg, setMsg]             = useState({ type: '', text: '' })
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]     = useState<AdminUser | null>(null)
  const [form, setForm]           = useState({ usuario: '', contrasena: '', nombre: '', rol: 'general' as Rol })
  const [saving, setSaving]       = useState(false)

  const load = () => {
    setLoading(true)
    adminApi.getAdminUsers()
      .then(r => setUsers(r.data as AdminUser[]))
      .catch(() => setMsg({ type: 'error', text: 'Error al cargar usuarios' }))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ usuario: '', contrasena: '', nombre: '', rol: 'general' })
    setShowModal(true)
  }

  const openEdit = (u: AdminUser) => {
    setEditing(u)
    setForm({ usuario: u.usuario, contrasena: '', nombre: u.nombre || '', rol: u.rol })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!editing && (!form.usuario || !form.contrasena)) {
      setMsg({ type: 'error', text: 'Usuario y contraseña son requeridos' }); return
    }
    setSaving(true)
    try {
      if (editing) {
        const body: any = { nombre: form.nombre, rol: form.rol }
        if (form.contrasena) body.contrasena = form.contrasena
        await adminApi.updateAdminUser(editing.id, body)
      } else {
        await adminApi.createAdminUser({ usuario: form.usuario, contrasena: form.contrasena, nombre: form.nombre, rol: form.rol })
      }
      setShowModal(false)
      setMsg({ type: 'success', text: editing ? 'Usuario actualizado' : 'Usuario creado correctamente' })
      load()
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Error al guardar' })
    } finally { setSaving(false) }
  }

  const handleDelete = async (u: AdminUser) => {
    if (!confirm(`¿Eliminar usuario "${u.usuario}"? Esta acción no se puede deshacer.`)) return
    try {
      await adminApi.deleteAdminUser(u.id)
      setMsg({ type: 'success', text: `Usuario "${u.usuario}" eliminado` })
      load()
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.error || 'Error al eliminar' })
    }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={s.h1}><i className="bi bi-shield-lock-fill" style={{ marginRight: 10, color: '#0a9396' }} />Gestión de Usuarios Admin</h2>
          <p style={s.sub}>Crea y administra cuentas de acceso al panel. Solo el rol General puede acceder a este módulo.</p>
        </div>
        <button style={{ ...s.btn, background: '#0a9396', color: 'white' }} onClick={openNew}>
          <i className="bi bi-person-plus-fill" style={{ marginRight: 6 }} />Nuevo Usuario
        </button>
      </div>

      {msg.text && (
        <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13,
          background: msg.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: msg.type === 'success' ? '#166534' : '#991b1b',
          border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
          <i className={`bi bi-${msg.type === 'success' ? 'check-circle-fill' : 'exclamation-octagon-fill'}`} style={{ marginRight: 8 }} />
          {msg.text}
        </div>
      )}

      {/* Roles info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {(['general', 'academico', 'pagos'] as Rol[]).map(r => (
          <div key={r} style={{ ...s.card, padding: 16, boxShadow: 'none', border: `1.5px solid ${ROL_COLOR[r]}22` }}>
            <span style={{ ...s.badge, background: ROL_COLOR[r], marginBottom: 8, display: 'inline-block' }}>{ROL_LABEL[r]}</span>
            <div style={{ fontSize: 12, color: '#4a6a72' }}>{ROL_DESC[r]}</div>
          </div>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ padding: 32, color: '#6c8a91', textAlign: 'center' }}>Cargando...</div>
      ) : (
        <div style={s.card}>
          {users.map((u, i) => (
            <div key={u.id} style={{ ...s.row, background: i % 2 === 0 ? 'white' : '#fafafa' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: ROL_COLOR[u.rol] + '15',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bi bi-person-fill" style={{ color: ROL_COLOR[u.rol], fontSize: 18 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0d4f5c' }}>{u.nombre || u.usuario}</div>
                <div style={{ fontSize: 12, color: '#6c8a91' }}>@{u.usuario}</div>
              </div>
              <span style={{ ...s.badge, background: ROL_COLOR[u.rol] }}>{ROL_LABEL[u.rol]}</span>
              <button style={{ ...s.btn, background: '#f0f4f5', color: '#0d4f5c' }} onClick={() => openEdit(u)}>
                <i className="bi bi-pencil-fill" />
              </button>
              <button style={{ ...s.btn, background: '#fee2e2', color: '#991b1b' }} onClick={() => handleDelete(u)}>
                <i className="bi bi-trash-fill" />
              </button>
            </div>
          ))}
          {users.length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: '#6c8a91', fontSize: 13 }}>No hay usuarios registrados.</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={s.modal} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.mbox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0d4f5c' }}>
                {editing ? 'Editar Usuario' : 'Nuevo Usuario Admin'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: '#6c8a91' }}>×</button>
            </div>
            {!editing && (
              <div style={s.fgroup}>
                <label style={s.label}>Usuario (nombre de acceso)</label>
                <input style={s.input} value={form.usuario} onChange={e => setForm(f => ({ ...f, usuario: e.target.value }))} placeholder="Ej: coordinador_academico" />
              </div>
            )}
            <div style={s.fgroup}>
              <label style={s.label}>Nombre de visualización</label>
              <input style={s.input} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: María García" />
            </div>
            <div style={s.fgroup}>
              <label style={s.label}>Contraseña {editing ? '(dejar vacío para no cambiar)' : ''}</label>
              <input style={s.input} type="password" value={form.contrasena} onChange={e => setForm(f => ({ ...f, contrasena: e.target.value }))} placeholder="Mínimo 8 caracteres" />
            </div>
            <div style={s.fgroup}>
              <label style={s.label}>Rol</label>
              <select style={{ ...s.input }} value={form.rol} onChange={e => setForm(f => ({ ...f, rol: e.target.value as Rol }))}>
                <option value="general">General — Acceso completo</option>
                <option value="academico">Académico — Solo módulos académicos (sin pagos)</option>
                <option value="pagos">Pagos — Solo módulo de pagos</option>
              </select>
              <div style={{ fontSize: 11, color: '#6c8a91', marginTop: 4 }}>{ROL_DESC[form.rol]}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button style={{ ...s.btn, background: '#f0f4f5', color: '#0d4f5c' }} onClick={() => setShowModal(false)}>Cancelar</button>
              <button style={{ ...s.btn, background: '#0a9396', color: 'white', opacity: saving ? 0.7 : 1 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
