/**
 * Modelo / Servicio API - Módulo Admin
 * Endpoints: /api/admin/*
 */
import api from '../config/api'
import type {
  Ciclo,
  CicloBody,
  Curso,
  CursoBody,
  MatriculaManualBody,
  MatriculaMasivaBody,
  AlumnoDetail,
  AsistenciaRegistroBody,
  AsistenciaInhabilitarBody,
  AsistenciaListResponse,
  CicloVigenteAlumnosResponse,
  ExamenBody,
  Examen,
  CalificacionExamenItem,
  HorarioAdmin,
  HorarioBody
} from './types'

const PREFIX = '/api/admin'

// Login usa mismo body que alumno
interface LoginBody {
  usuario: string
  contrasena: string
}

export const adminApi = {
  // POST /login - No auth
  login(body: LoginBody) {
    return api.post<{ token: string }>(`${PREFIX}/login`, body)
  },

  // --- Ciclos
  getCiclos() {
    return api.get<Ciclo[]>(`${PREFIX}/ciclos`)
  },
  createCiclo(body: CicloBody) {
    return api.post<Ciclo>(`${PREFIX}/ciclos`, body)
  },
  updateCiclo(id: number, body: Partial<CicloBody>) {
    return api.put<Ciclo>(`${PREFIX}/ciclos/${id}`, body)
  },
  deleteCiclo(id: number) {
    return api.delete(`${PREFIX}/ciclos/${id}`)
  },
  subirFotoAlumno(codigo: string, formData: FormData) {
    return api.post(`${PREFIX}/alumno/${encodeURIComponent(codigo)}/foto`, formData)
  },

  // --- Cursos
  getCursos() {
    return api.get<Curso[]>(`${PREFIX}/cursos`)
  },
  createCurso(body: CursoBody) {
    return api.post<Curso>(`${PREFIX}/cursos`, body)
  },
  updateCurso(id: number, body: Partial<CursoBody>) {
    return api.put<Curso>(`${PREFIX}/cursos/${id}`, body)
  },
  deleteCurso(id: number) {
    return api.delete(`${PREFIX}/cursos/${id}`)
  },

  // --- Matrícula (por ciclo; código alumno)
  matriculaManual(body: MatriculaManualBody) {
    return api.post(`${PREFIX}/matricula/manual`, body)
  },
  matriculaMasiva(body: MatriculaMasivaBody) {
    return api.post(`${PREFIX}/matricula/masiva`, body)
  },
  // --- Alumnos
  getAlumno(codigo: string) {
    return api.get<AlumnoDetail>(`${PREFIX}/alumno/${encodeURIComponent(codigo)}`)
  },
  getAlumnoQr(codigo: string) {
    return api.get(`${PREFIX}/alumno/${encodeURIComponent(codigo)}/qr`, { responseType: 'blob' })
  },
  getCicloVigenteAlumnos() {
    return api.get<CicloVigenteAlumnosResponse>(`${PREFIX}/ciclo-vigente/alumnos`)
  },
  getAlumnosPorCiclo(cicloId: number) {
    return api.get<CicloVigenteAlumnosResponse>(`${PREFIX}/ciclos/${cicloId}/alumnos-matriculados`)
  },
  registrarAlumno(body: any) {
    return api.post(`${PREFIX}/alumno/registrar`, body);
  },
  restaurarPassword(codigo: string) {
    return api.post<{ ok: boolean; passwordDefault: string; mensaje: string }>(
      `${PREFIX}/alumno/${encodeURIComponent(codigo)}/restaurar-password`, {}
    )
  },

  // --- Asistencia
  registrarAsistencia(body: AsistenciaRegistroBody) {
    return api.post(`${PREFIX}/asistencia`, body)
  },
  inhabilitarAsistencia(body: AsistenciaInhabilitarBody) {
    return api.post(`${PREFIX}/asistencia/inhabilitar-dia`, body)
  },
  getAsistenciaListado(cicloId: number, fecha: string) {
    return api.get<AsistenciaListResponse>(`${PREFIX}/asistencia/listado`, { params: { cicloId, fecha } })
  },

  // --- Matrícula: anular / eliminar alumno
  anularMatricula(codigoAlumno: string, cicloId: string) {
    return api.delete(`${PREFIX}/alumno/${encodeURIComponent(codigoAlumno)}/matricula/${cicloId}`)
  },
  eliminarAlumno(codigoAlumno: string) {
    return api.delete(`${PREFIX}/alumno/${encodeURIComponent(codigoAlumno)}/eliminar`)
  },

  // --- Exámenes y notas
  crearExamen(body: ExamenBody) {
    return api.post<Examen>(`${PREFIX}/examen`, body)
  },
  getExamenesPorCiclo(cicloId: number) {
    return api.get<Examen[]>(`${PREFIX}/ciclos/${cicloId}/examenes`)
  },
  registrarCalificaciones(examenId: number, calificaciones: CalificacionExamenItem[]) {
    return api.post(`${PREFIX}/examen/${examenId}/calificaciones`, calificaciones)
  },
  getNotasExamen(examenId: number) {
    return api.get<{ examen: any; notas: Array<{ puesto: number; nota: number; codigo: string; nombres: string; apellidos: string }> }>(
      `${PREFIX}/examen/${examenId}/notas`
    )
  },
  getExamenPlantillaNotas(examenId: number) {
    return api.get(`${PREFIX}/examen/${examenId}/plantilla-notas`, { responseType: 'blob' })
  },
  postExamenNotasExcel(examenId: number, file: File) {
    const form = new FormData()
    form.append('archivo', file)
    return api.post(`${PREFIX}/examen/${examenId}/notas-excel`, form)
  },

  // --- Horarios de cursos
  getHorarios(cicloId?: number) {
    return api.get<HorarioAdmin[]>(`${PREFIX}/horario`, { params: cicloId ? { cicloId } : {} })
  },
  createHorario(body: HorarioBody) {
    return api.post<HorarioAdmin>(`${PREFIX}/horario`, body)
  },
  updateHorario(id: number, body: Partial<HorarioBody>) {
    return api.put<HorarioAdmin>(`${PREFIX}/horario/${id}`, body)
  },
  deleteHorario(id: number) {
    return api.delete(`${PREFIX}/horario/${id}`)
  },

  // --- Materiales por curso (admin) — 1:N por semana
  getMaterialesPorCurso(cursoId: number) {
    return api.get<any>(`${PREFIX}/cursos/${cursoId}/materiales`)
  },
  createMaterial(cursoId: number, body: { semana: number; nombre: string; urlDrive?: string; urlArchivo?: string; tipoArchivo?: string }) {
    return api.post<any>(`${PREFIX}/cursos/${cursoId}/materiales`, body)
  },
  updateMaterial(cursoId: number, id: number, body: { semana?: number; nombre?: string; urlDrive?: string; urlArchivo?: string }) {
    return api.put<any>(`${PREFIX}/cursos/${cursoId}/materiales/${id}`, body)
  },
  deleteMaterial(cursoId: number, id: number) {
    return api.delete<any>(`${PREFIX}/cursos/${cursoId}/materiales/${id}`)
  },
  uploadMaterial(cursoId: number, semana: number, nombre: string, file: File, materialId?: number) {
    const form = new FormData()
    form.append('archivo', file)
    form.append('semana', String(semana))
    form.append('nombre', nombre)
    if (materialId != null) form.append('materialId', String(materialId))
    return api.post<any>(`${PREFIX}/cursos/${cursoId}/materiales/upload`, form)
  },
  // Alias para compatibilidad
  upsertMaterial(cursoId: number, body: { semana: number; nombre: string; urlDrive?: string; urlArchivo?: string }) {
    return api.post<any>(`${PREFIX}/cursos/${cursoId}/materiales`, body)
  },

  // --- Matrícula masiva por Excel
  plantillaMasivaExcel() {
    return api.get(`${PREFIX}/matricula/plantilla-masiva`, { responseType: 'blob' })
  },
  matriculaMasivaExcel(file: File, cicloId: number) {
    const form = new FormData()
    form.append('archivo', file)
    form.append('cicloId', String(cicloId))
    return api.post<any>(`${PREFIX}/matricula/masiva-excel`, form)
  },

  // --- Cierre de día
  cierreDia(body: any) {
    return api.post<any>(`${PREFIX}/asistencia/cierre-dia`, body)
  },

  // --- Reportes Excel
  reporteAlumnosCiclo(cicloId: number) {
    return api.get(`${PREFIX}/reportes/alumnos-ciclo`, { params: { cicloId }, responseType: 'blob' })
  },
  reporteOrdenMerito(examenId: number) {
    return api.get(`${PREFIX}/reportes/orden-merito`, { params: { examenId }, responseType: 'blob' })
  },

  // --- Pagos
  getConceptosPago(cicloId: number) { return api.get<any[]>(`${PREFIX}/ciclos/${cicloId}/conceptos-pago`) },
  createConceptoPago(cicloId: number, body: any) { return api.post<any>(`${PREFIX}/ciclos/${cicloId}/conceptos-pago`, body) },
  updateConceptoPago(id: number, body: any) { return api.put<any>(`${PREFIX}/concepto-pago/${id}`, body) },
  deleteConceptoPago(id: number) { return api.delete(`${PREFIX}/concepto-pago/${id}`) },
  getResumenPagosCiclo(cicloId: number) { return api.get<any>(`${PREFIX}/ciclos/${cicloId}/resumen-pagos`) },
  getPagosAlumno(alumnoId: number, cicloId: number) { return api.get<any[]>(`${PREFIX}/alumnos/${alumnoId}/pagos/${cicloId}`) },
  registrarPago(body: any) { return api.post<any>(`${PREFIX}/pago`, body) },
  updatePago(id: number, body: any) { return api.put<any>(`${PREFIX}/pago/${id}`, body) },
  deletePago(id: number) { return api.delete(`${PREFIX}/pago/${id}`) },
  toggleVisibilidadPago(id: number) { return api.put<any>(`${PREFIX}/pago/${id}/visibilidad`, {}) },
  toggleSuspension(codigo: string) { return api.put<any>(`${PREFIX}/alumno/${encodeURIComponent(codigo)}/suspender`, {}) },

  // --- Config pagos por ciclo
  getConfigPagos(cicloId: number) { return api.get<any>(`${PREFIX}/ciclos/${cicloId}/config-pagos`) },
  upsertConfigPagos(cicloId: number, body: any) { return api.put<any>(`${PREFIX}/ciclos/${cicloId}/config-pagos`, body) },

  // --- Pagos online
  getPagosOnlinePendientes() { return api.get<any[]>(`${PREFIX}/pagos/pendientes-online`) },
  confirmarPago(id: number, body: { accion: 'confirmar' | 'rechazar'; observaciones?: string }) {
    return api.put<any>(`${PREFIX}/pago/${id}/confirmar`, body)
  },
}
