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
  HorarioBody,
  PlantillaExamen,
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
    return api.post<{ token: string; rolAdmin?: string; nombre?: string }>(`${PREFIX}/login`, body)
  },

  // --- Usuarios admin
  getAdminUsers() {
    return api.get<{ id: number; usuario: string; nombre: string | null; rol: string }[]>(`${PREFIX}/admin-users`)
  },
  createAdminUser(body: { usuario: string; contrasena: string; nombre?: string; rol: string }) {
    return api.post(`${PREFIX}/admin-users`, body)
  },
  updateAdminUser(id: number, body: { nombre?: string; rol?: string; contrasena?: string }) {
    return api.put(`${PREFIX}/admin-users/${id}`, body)
  },
  deleteAdminUser(id: number) {
    return api.delete(`${PREFIX}/admin-users/${id}`)
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
  getMatriculaByAlumno(codigo: string, cicloId: number) {
    return api.get<{ matriculaId: number; alumnoNombre: string; area: string; carrera_preferida: string; universidad_meta: string }>(
      `${PREFIX}/matricula/by-alumno`, { params: { codigo, cicloId } }
    )
  },
  updateMatriculaInfo(matriculaId: number, body: { area?: string | null; carreraPref?: string | null; univMeta?: string | null }) {
    return api.put(`${PREFIX}/matricula/${matriculaId}/info`, body)
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
  editarDatosAlumno(codigo: string, datos: Record<string, unknown>) {
    return api.put(`${PREFIX}/alumno/${encodeURIComponent(codigo)}/datos`, datos)
  },
  reenviarCredenciales(codigo: string) {
    return api.post<{ ok: boolean; mensaje: string }>(
      `${PREFIX}/alumno/${encodeURIComponent(codigo)}/reenviar-credenciales`, {}
    )
  },
  credencialesWhatsapp(codigo: string) {
    return api.post<{ ok: boolean; mensaje: string; telefono: string | null; nombre: string }>(
      `${PREFIX}/alumno/${encodeURIComponent(codigo)}/credenciales-whatsapp`, {}
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
  subirExcelSimulacro(examenId: number, file: File) {
    const form = new FormData()
    form.append('archivo', file)
    return api.post<{ ok: boolean; area: string; resumen: { procesados: number; noEncontrados: string[]; errores: Array<{ dni: string; error: string }> } }>(
      `${PREFIX}/examen/${examenId}/subir-excel-simulacro`, form
    )
  },
  getNotasSimulacro(examenId: number) {
    return api.get<any[]>(`${PREFIX}/examen/${examenId}/notas-simulacro`)
  },
  subirExcelResultados(examenId: number, file: File) {
    const form = new FormData()
    form.append('archivo', file)
    return api.post<{ ok: boolean; resumen: { procesados: number; noEncontradosEnExcel: string[]; noEncontrados: string[]; errores: Array<{ alumno: string; error: string }> } }>(
      `${PREFIX}/examen/${examenId}/subir-excel-resultados`, form
    )
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
  getPagosEscolaridadAlumno(alumnoId: number) { return api.get<any[]>(`${PREFIX}/alumnos/${alumnoId}/escolaridad`) },
  registrarPago(body: any) { return api.post<any>(`${PREFIX}/pago`, body) },
  updatePago(id: number, body: any) { return api.put<any>(`${PREFIX}/pago/${id}`, body) },
  deletePago(id: number) { return api.delete(`${PREFIX}/pago/${id}`) },
  toggleVisibilidadPago(id: number) { return api.put<any>(`${PREFIX}/pago/${id}/visibilidad`, {}) },
  toggleSuspension(codigo: string) { return api.put<any>(`${PREFIX}/alumno/${encodeURIComponent(codigo)}/suspender`, {}) },

  // --- Config pagos por ciclo
  getConfigPagos(cicloId: number) { return api.get<any>(`${PREFIX}/ciclos/${cicloId}/config-pagos`) },
  upsertConfigPagos(cicloId: number, body: any) { return api.put<any>(`${PREFIX}/ciclos/${cicloId}/config-pagos`, body) },
  getVisibilidadGlobal() { return api.get<any>(`${PREFIX}/pagos/visibilidad-global`) },
  setVisibilidadGlobal(visible: boolean) { return api.put<any>(`${PREFIX}/pagos/visibilidad-global`, { visible }) },

  // --- Pagos online
  getPagosOnlinePendientes() { return api.get<any[]>(`${PREFIX}/pagos/pendientes-online`) },
  confirmarPago(id: number, body: { accion: 'confirmar' | 'rechazar'; observaciones?: string }) {
    return api.put<any>(`${PREFIX}/pago/${id}/confirmar`, body)
  },

  // --- Plantillas de examen
  getPlantillasExamen() {
    return api.get<PlantillaExamen[]>(`${PREFIX}/plantillas-examen`)
  },
  getPlantillaExamen(id: number) {
    return api.get<PlantillaExamen>(`${PREFIX}/plantillas-examen/${id}`)
  },
  crearPlantillaExamen(body: Omit<PlantillaExamen, 'id' | 'activo'> & { secciones?: any[]; cursos?: any[] }) {
    return api.post<{ id: number; nombre: string }>(`${PREFIX}/plantillas-examen`, body)
  },
  actualizarPlantillaExamen(id: number, body: Partial<PlantillaExamen> & { secciones?: any[]; cursos?: any[] }) {
    return api.put(`${PREFIX}/plantillas-examen/${id}`, body)
  },
  eliminarPlantillaExamen(id: number) {
    return api.delete(`${PREFIX}/plantillas-examen/${id}`)
  },
}
