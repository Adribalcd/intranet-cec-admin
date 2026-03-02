import { useEffect, useRef, useState } from 'react'
import { adminApi } from '../../models/adminApi'
import type { Ciclo, Examen, CalificacionExamenItem } from '../../models/types'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  .exam-wrap * { font-family: 'Plus Jakarta Sans', sans-serif; }

  .exam-wrap {
    --teal-dark:  #0d4f5c;
    --teal-mid:   #0a9396;
    --teal-light: #94d2bd;
    --teal-pale:  #e8f4f5;
    --accent:     #e9c46a;
    --danger:     #e76f51;
    --blue-dark:  #1d3557;
    --blue-mid:   #457b9d;
    --green-dark: #1a7a6e;
    --green-mid:  #2a9d8f;
    --text-main:  #212529;
    --text-muted: #6c757d;
    --border:     #dee2e6;
  }

  /* Header */
  .exam-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 12px; flex-wrap: wrap; }
  .exam-title { font-size: 22px; font-weight: 700; color: var(--teal-dark); display: flex; align-items: center; gap: 10px; margin: 0; }
  .exam-title-icon {
    width: 38px; height: 38px; border-radius: 10px;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 17px; flex-shrink: 0;
    box-shadow: 0 4px 10px rgba(10,147,150,0.3);
  }
  .exam-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 2px; font-weight: 400; }

  /* Alerts */
  .exam-alert-error {
    display: flex; align-items: flex-start; gap: 10px;
    background: #fff5f5; border: 1px solid #fca5a5; border-radius: 10px;
    padding: 12px 16px; color: #b91c1c; font-size: 13px; margin-bottom: 16px;
  }
  .exam-alert-success {
    display: flex; align-items: flex-start; gap: 10px;
    background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px;
    padding: 12px 16px; color: #166534; font-size: 13px; margin-bottom: 16px;
  }

  /* Layout grid */
  .exam-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start; }
  @media (max-width: 900px) { .exam-grid { grid-template-columns: 1fr; } }

  /* Cards */
  .exam-card {
    background: white; border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07); margin-bottom: 0;
  }
  .exam-card-header {
    display: flex; align-items: center; gap: 12px;
    padding: 15px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, var(--teal-pale), #fff);
  }
  .exam-card-header-icon {
    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: white;
  }
  .exam-card-header-icon.crear   { background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark)); }
  .exam-card-header-icon.notas   { background: linear-gradient(135deg, var(--green-mid), var(--green-dark)); }
  .exam-card-header-icon.excel   { background: linear-gradient(135deg, #457b9d, #1d3557); }
  .exam-card-title { font-size: 14px; font-weight: 700; color: var(--teal-dark); margin: 0; }
  .exam-card-desc  { font-size: 12px; color: var(--text-muted); margin: 0; }
  .exam-card-body  { padding: 20px; }

  /* Examen activo chip */
  .exam-active-chip {
    display: inline-flex; align-items: center; gap: 6px;
    background: linear-gradient(135deg, var(--teal-pale), #e0f2f1);
    border: 1px solid var(--teal-light); color: var(--teal-dark);
    font-size: 12px; font-weight: 700; padding: 6px 14px;
    border-radius: 20px; margin-bottom: 16px;
  }
  .exam-active-chip i { color: var(--teal-mid); }

  /* Fields */
  .exam-field { margin-bottom: 14px; }
  .exam-field label {
    display: block; font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--text-muted); margin-bottom: 6px;
  }
  .exam-field input, .exam-field select {
    width: 100%; padding: 9px 12px;
    border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; font-family: inherit; background: #fafafa;
    outline: none; transition: border-color 0.18s, box-shadow 0.18s;
    appearance: none; -webkit-appearance: none;
  }
  .exam-field input:focus, .exam-field select:focus {
    border-color: var(--teal-mid); background: white;
    box-shadow: 0 0 0 3px rgba(10,147,150,0.12);
  }
  .exam-select-wrap { position: relative; }
  .exam-select-wrap::after {
    content: '\\f282'; font-family: 'Bootstrap Icons';
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    color: var(--text-muted); pointer-events: none; font-size: 12px;
  }
  .exam-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .exam-field-row3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }

  /* Buttons */
  .btn-crear-examen {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 9px; border: none;
    background: linear-gradient(135deg, var(--teal-mid), var(--teal-dark));
    color: white; font-size: 13px; font-weight: 700; font-family: inherit;
    cursor: pointer; box-shadow: 0 4px 10px rgba(10,147,150,0.25);
    transition: opacity 0.18s, transform 0.12s; width: 100%; justify-content: center;
  }
  .btn-crear-examen:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-crear-examen:disabled { opacity: 0.55; cursor: not-allowed; }

  .btn-registrar-notas {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 20px; border-radius: 9px; border: none;
    background: linear-gradient(135deg, var(--green-mid), var(--green-dark));
    color: white; font-size: 13px; font-weight: 700; font-family: inherit;
    cursor: pointer; box-shadow: 0 4px 10px rgba(42,157,143,0.25);
    transition: opacity 0.18s, transform 0.12s;
  }
  .btn-registrar-notas:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-registrar-notas:disabled { opacity: 0.55; cursor: not-allowed; }

  .btn-add-fila {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 7px 14px; border-radius: 8px;
    border: 1.5px dashed var(--teal-light); background: var(--teal-pale);
    color: var(--teal-dark); font-size: 12px; font-weight: 600; font-family: inherit; cursor: pointer;
    transition: border-color 0.18s, background 0.18s;
  }
  .btn-add-fila:hover { border-color: var(--teal-mid); background: #d4eced; }

  .btn-remove-fila {
    width: 30px; height: 30px; border-radius: 7px; border: none;
    background: #fff0ed; color: var(--danger); font-size: 13px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: background 0.15s; flex-shrink: 0;
  }
  .btn-remove-fila:hover { background: #ffe0d9; }

  .btn-excel-dl {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 16px; border-radius: 9px; border: none;
    background: linear-gradient(135deg, #457b9d, #1d3557);
    color: white; font-size: 12px; font-weight: 700; font-family: inherit;
    cursor: pointer; box-shadow: 0 4px 10px rgba(29,53,87,0.2);
    transition: opacity 0.18s, transform 0.12s;
  }
  .btn-excel-dl:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .btn-excel-dl:disabled { opacity: 0.55; cursor: not-allowed; }

  .btn-excel-up {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 8px 16px; border-radius: 9px;
    border: 1.5px solid var(--blue-mid); background: white;
    color: var(--blue-mid); font-size: 12px; font-weight: 700; font-family: inherit;
    cursor: pointer; transition: background 0.15s, color 0.15s;
  }
  .btn-excel-up:hover:not(:disabled) { background: var(--blue-mid); color: white; }
  .btn-excel-up:disabled { opacity: 0.55; cursor: not-allowed; }

  /* Calificaciones rows */
  .calif-rows { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
  .calif-row {
    display: grid; grid-template-columns: 1fr 0.7fr 30px;
    gap: 8px; align-items: center;
    background: #f8fafc; border: 1px solid var(--border);
    border-radius: 10px; padding: 10px 12px; transition: border-color 0.15s;
  }
  .calif-row:hover { border-color: var(--teal-light); }
  .calif-row-num { font-size: 9px; font-weight: 700; color: var(--teal-mid); margin-bottom: 3px; }
  .calif-row input {
    width: 100%; padding: 7px 10px;
    border: 1.5px solid var(--border); border-radius: 8px;
    font-size: 12px; font-family: inherit; background: white; outline: none;
    transition: border-color 0.18s; appearance: none; -webkit-appearance: none;
  }
  .calif-row input:focus { border-color: var(--green-mid); }
  .calif-empty {
    text-align: center; padding: 22px; color: var(--text-muted); font-size: 13px;
    background: #f8fafc; border-radius: 10px; border: 1.5px dashed var(--border); margin-bottom: 14px;
  }
  .calif-empty i { font-size: 26px; color: var(--teal-light); display: block; margin-bottom: 6px; }

  /* Examen selector list */
  .exam-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .exam-list-item {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 14px; border-radius: 10px;
    border: 1.5px solid var(--border); background: #f8fafc;
    cursor: pointer; transition: border-color 0.18s, background 0.18s;
  }
  .exam-list-item:hover { border-color: var(--teal-light); background: var(--teal-pale); }
  .exam-list-item.selected { border-color: var(--teal-mid); background: var(--teal-pale); }
  .exam-list-item-left { flex: 1; }
  .exam-list-item-tipo { font-size: 13px; font-weight: 700; color: var(--teal-dark); }
  .exam-list-item-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .exam-list-item-check {
    width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
    background: var(--teal-mid); color: white; font-size: 11px;
    display: flex; align-items: center; justify-content: center;
  }

  /* Divider */
  .exam-divider { display: flex; align-items: center; gap: 12px; margin: 20px 0 16px; }
  .exam-divider-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); white-space: nowrap; }
  .exam-divider-line { flex: 1; height: 1px; background: var(--border); }

  /* Excel panel */
  .excel-panel { background: #f0f6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; }
  .excel-panel-title { font-size: 12px; font-weight: 700; color: var(--blue-dark); margin-bottom: 4px; }
  .excel-panel-desc  { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
  .excel-panel-actions { display: flex; gap: 10px; flex-wrap: wrap; }

  /* Nota badge */
  .nota-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 12px; font-weight: 700; font-family: monospace; }
  .nota-alta  { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
  .nota-media { background: #fef9c3; color: #854d0e; border: 1px solid #fcd34d; }
  .nota-baja  { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }

  /* Loading */
  .exam-loading { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 60px; color: var(--teal-mid); font-size: 14px; font-weight: 500; }
  .exam-spinner { width: 22px; height: 22px; border-radius: 50%; border: 2.5px solid var(--teal-light); border-top-color: var(--teal-mid); animation: exspin 0.7s linear infinite; }
  .exam-spinner-sm { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; animation: exspin 0.7s linear infinite; }
  @keyframes exspin { to { transform: rotate(360deg); } }

  /* ── Ranking ── */
  .ranking-section {
    background: white; border: 1px solid var(--border); border-radius: 16px;
    overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    margin-top: 24px; animation: fadeInUp 0.3s ease;
  }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

  .ranking-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, #fff9e6, #fff);
  }
  .ranking-header-left {
    display: flex; align-items: center; gap: 10px;
  }
  .ranking-header-icon {
    width: 34px; height: 34px; border-radius: 9px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    display: flex; align-items: center; justify-content: center;
    color: white; font-size: 16px; flex-shrink: 0;
    box-shadow: 0 3px 8px rgba(245,158,11,0.35);
  }
  .ranking-title { font-size: 14px; font-weight: 700; color: #92400e; margin: 0; }
  .ranking-subtitle { font-size: 11px; color: var(--text-muted); margin: 0; }
  .ranking-close {
    width: 28px; height: 28px; border-radius: 7px; border: none;
    background: #f1f5f9; color: var(--text-muted); cursor: pointer; font-size: 13px;
    display: flex; align-items: center; justify-content: center;
  }
  .ranking-close:hover { background: #e2e8f0; }

  /* Podium */
  .ranking-podium {
    display: flex; align-items: flex-end; justify-content: center; gap: 12px;
    padding: 28px 20px 8px; background: linear-gradient(180deg, #fffbeb 0%, #fff 100%);
  }
  .podium-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .podium-medal {
    width: 52px; height: 52px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px; border: 3px solid;
    position: relative;
  }
  .podium-medal.gold   { background: linear-gradient(135deg,#fef3c7,#fde68a); border-color: #f59e0b; box-shadow: 0 4px 14px rgba(245,158,11,0.4); }
  .podium-medal.silver { background: linear-gradient(135deg,#f1f5f9,#e2e8f0); border-color: #94a3b8; box-shadow: 0 3px 10px rgba(148,163,184,0.3); }
  .podium-medal.bronze { background: linear-gradient(135deg,#fef3e2,#fed7aa); border-color: #f97316; box-shadow: 0 3px 10px rgba(249,115,22,0.3); }
  .podium-code { font-size: 12px; font-weight: 700; color: #374151; max-width: 80px; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .podium-nota {
    font-size: 15px; font-weight: 800;
    padding: 3px 12px; border-radius: 20px; border: 1.5px solid;
  }
  .podium-nota.gold   { background: #fef3c7; border-color: #f59e0b; color: #78350f; }
  .podium-nota.silver { background: #f1f5f9;  border-color: #94a3b8; color: #1e293b; }
  .podium-nota.bronze { background: #fef3e2;  border-color: #f97316; color: #7c2d12; }
  .podium-base {
    border-radius: 10px 10px 0 0; width: 80px; display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; color: white; padding: 8px;
  }
  .podium-base.gold   { height: 70px; background: linear-gradient(180deg, #f59e0b, #d97706); }
  .podium-base.silver { height: 50px; background: linear-gradient(180deg, #94a3b8, #64748b); }
  .podium-base.bronze { height: 36px; background: linear-gradient(180deg, #f97316, #ea580c); }

  /* Ranking table */
  .ranking-table { width: 100%; border-collapse: collapse; }
  .ranking-table th {
    padding: 9px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--text-muted); text-align: left;
    border-bottom: 1px solid var(--border); background: #fafafa;
  }
  .ranking-table td {
    padding: 10px 16px; font-size: 13px; border-bottom: 1px solid #f0f4f5;
    vertical-align: middle;
  }
  .ranking-table tr:last-child td { border-bottom: none; }
  .ranking-table tr:hover td { background: #f8fafc; }

  .rank-pos {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 50%; font-size: 12px; font-weight: 800;
    background: var(--teal-pale); color: var(--teal-dark);
  }
  .rank-pos.p1 { background: linear-gradient(135deg,#fef3c7,#fde68a); color: #78350f; border: 1.5px solid #f59e0b; }
  .rank-pos.p2 { background: linear-gradient(135deg,#f1f5f9,#e2e8f0); color: #1e293b; border: 1.5px solid #94a3b8; }
  .rank-pos.p3 { background: linear-gradient(135deg,#fef3e2,#fed7aa); color: #7c2d12; border: 1.5px solid #f97316; }

  .rank-bar-wrap { flex: 1; background: #f1f5f9; border-radius: 20px; height: 8px; overflow: hidden; min-width: 80px; }
  .rank-bar { height: 100%; border-radius: 20px; transition: width 0.5s ease; }
  .rank-bar.high   { background: linear-gradient(90deg, #34d399, #059669); }
  .rank-bar.mid    { background: linear-gradient(90deg, #facc15, #ca8a04); }
  .rank-bar.low    { background: linear-gradient(90deg, #f87171, #dc2626); }

  /* Ciclo selector banner */
  .exam-ciclo-selector {
    background: white; border: 1px solid var(--border); border-radius: 12px;
    padding: 16px 20px; margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
  }
  .exam-ciclo-selector label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); white-space: nowrap; }
  .exam-ciclo-select-wrap { position: relative; flex: 1; min-width: 200px; }
  .exam-ciclo-select-wrap::after { content: '\\f282'; font-family: 'Bootstrap Icons'; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; font-size: 12px; }
  .exam-ciclo-select-wrap select {
    width: 100%; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: 9px;
    font-size: 13px; font-family: inherit; background: #fafafa; outline: none; appearance: none; -webkit-appearance: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .exam-ciclo-select-wrap select:focus { border-color: var(--teal-mid); background: white; box-shadow: 0 0 0 3px rgba(10,147,150,0.12); }

  .exam-no-ciclo { text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 13px; }
  .exam-no-ciclo i { font-size: 36px; color: var(--teal-light); display: block; margin-bottom: 10px; }

  @media (max-width: 500px) { .exam-field-row { grid-template-columns: 1fr; } .exam-field-row3 { grid-template-columns: 1fr; } }

  /* ── Consultar sección ── */
  .consultar-card {
    background: white; border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.07);
    margin-top: 24px;
  }
  .consultar-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 15px 20px; border-bottom: 1px solid var(--border);
    background: linear-gradient(90deg, #fff9e6, #fff);
    gap: 12px; flex-wrap: wrap;
  }
  .consultar-header-left { display: flex; align-items: center; gap: 12px; }
  .consultar-header-icon {
    width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; color: white;
    background: linear-gradient(135deg, #f59e0b, #d97706);
  }
  .consultar-body { padding: 20px; }
  .consultar-exam-list { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
  .consultar-exam-item {
    display: grid; grid-template-columns: 1fr auto auto;
    align-items: center; gap: 10px;
    padding: 12px 16px; border-radius: 10px;
    border: 1.5px solid var(--border); background: #f8fafc;
    transition: border-color 0.18s;
  }
  .consultar-exam-item:hover { border-color: var(--teal-light); background: var(--teal-pale); }
  .consultar-exam-tipo { font-size: 13px; font-weight: 700; color: var(--teal-dark); }
  .consultar-exam-meta { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
  .btn-ver-ranking {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px; border: none;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white; font-size: 11px; font-weight: 700; font-family: inherit;
    cursor: pointer; white-space: nowrap; transition: opacity 0.15s;
  }
  .btn-ver-ranking:hover { opacity: 0.85; }
  .btn-dl-ranking {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    border: 1.5px solid #166534; background: white;
    color: #166534; font-size: 11px; font-weight: 700; font-family: inherit;
    cursor: pointer; white-space: nowrap; transition: background 0.15s, color 0.15s;
  }
  .btn-dl-ranking:hover { background: #166534; color: white; }
  .ranking-loading {
    display: flex; align-items: center; gap: 8px;
    padding: 16px; color: var(--teal-mid); font-size: 13px;
  }
`

export function AdminExamenesView() {
  const [ciclos, setCiclos]           = useState<Ciclo[]>([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  // Ciclo seleccionado para crear examen
  const [cicloCrearId, setCicloCrearId] = useState<number | ''>('')
  const [creando, setCreando]         = useState(false)
  const [examenForm, setExamenForm]   = useState({
    semana: '', tipoExamen: '', subtipoExamen: '', fecha: '',
    cantidadPreguntas: '', puntajeBuena: '4', puntajeMala: '1',
  })

  // Ciclo + examen seleccionado para registrar notas
  const [cicloNotasId, setCicloNotasId] = useState<number | ''>('')
  const [examenesLista, setExamenesLista] = useState<Examen[]>([])
  const [loadingExamenes, setLoadingExamenes] = useState(false)
  const [selectedExamen, setSelectedExamen] = useState<Examen | null>(null)
  const [registrando, setRegistrando] = useState(false)
  const [califFilas, setCalifFilas]   = useState([{ codigoAlumno: '', nota: '', buenas: '', malas: '' }])

  const [ranking, setRanking]           = useState<CalificacionExamenItem[]>([])
  const [rankingExamen, setRankingExamen] = useState<Examen | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Consulta de exámenes ──
  const [consultaCicloId, setConsultaCicloId] = useState<number | ''>('')
  const [consultaExamenes, setConsultaExamenes] = useState<Examen[]>([])
  const [loadingConsulta, setLoadingConsulta] = useState(false)
  const [consultaRanking, setConsultaRanking] = useState<{
    examen: any
    notas: Array<{ puesto: number; nota: number; codigo: string; nombres: string; apellidos: string }>
  } | null>(null)
  const [loadingRanking, setLoadingRanking] = useState(false)
  const [dlRankingId, setDlRankingId] = useState<number | null>(null)

  useEffect(() => {
    adminApi.getCiclos()
      .then((res) => setCiclos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('No se pudieron cargar los ciclos.'))
      .finally(() => setLoading(false))
  }, [])

  // Cargar exámenes cuando cambia cicloNotasId
  useEffect(() => {
    if (!cicloNotasId) { setExamenesLista([]); setSelectedExamen(null); return }
    setLoadingExamenes(true)
    adminApi.getExamenesPorCiclo(cicloNotasId as number)
      .then((res) => { setExamenesLista(Array.isArray(res.data) ? res.data : []); setSelectedExamen(null) })
      .catch(() => setError('Error al cargar exámenes del ciclo.'))
      .finally(() => setLoadingExamenes(false))
  }, [cicloNotasId])

  const clearAlerts = () => { setError(''); setSuccess('') }

  // Crear examen
  const handleCrearExamen = async (e: React.FormEvent) => {
    e.preventDefault(); clearAlerts()
    if (!cicloCrearId || !examenForm.semana || !examenForm.tipoExamen || !examenForm.fecha) {
      setError('Completa todos los campos obligatorios.'); return
    }
    if (!examenForm.subtipoExamen) {
      setError('Selecciona el subtipo de examen.'); return
    }
    setCreando(true)
    try {
      await adminApi.crearExamen({
        cicloId:           cicloCrearId as number,
        semana:            parseInt(examenForm.semana, 10),
        tipoExamen:        examenForm.tipoExamen,
        subtipoExamen:     examenForm.subtipoExamen || undefined,
        fecha:             examenForm.fecha,
        cantidadPreguntas: examenForm.cantidadPreguntas ? parseInt(examenForm.cantidadPreguntas, 10) : undefined,
        puntajeBuena:      examenForm.puntajeBuena  ? parseFloat(examenForm.puntajeBuena) : 4,
        puntajeMala:       examenForm.puntajeMala   ? parseFloat(examenForm.puntajeMala)  : 1,
      })
      setSuccess('Examen creado correctamente.')
      setExamenForm({ semana: '', tipoExamen: '', subtipoExamen: '', fecha: '', cantidadPreguntas: '', puntajeBuena: '4', puntajeMala: '1' })
      // Refrescar lista si está en el mismo ciclo
      if (cicloNotasId === cicloCrearId) {
        const res = await adminApi.getExamenesPorCiclo(cicloCrearId as number)
        setExamenesLista(Array.isArray(res.data) ? res.data : [])
      }
    } catch {
      setError('Error al crear el examen.')
    } finally {
      setCreando(false)
    }
  }

  // Registrar calificaciones — soporta nota directa O buenas/malas
  const usaBuenasMalas = Boolean(
    selectedExamen &&
    (selectedExamen.puntaje_pregunta_buena ?? selectedExamen.puntajePreguntaBuena)
  )

  const handleRegistrarCalificaciones = async (e: React.FormEvent) => {
    e.preventDefault(); clearAlerts()
    if (!selectedExamen) { setError('Selecciona un examen primero.'); return }

    const calificaciones: CalificacionExamenItem[] = usaBuenasMalas
      ? califFilas
          .filter((f) => f.codigoAlumno.trim() && f.buenas !== '' && f.malas !== '')
          .map((f) => ({ codigoAlumno: f.codigoAlumno.trim(), buenas: parseInt(f.buenas, 10), malas: parseInt(f.malas, 10) }))
      : califFilas
          .filter((f) => f.codigoAlumno.trim() && f.nota !== '')
          .map((f) => ({ codigoAlumno: f.codigoAlumno.trim(), nota: parseFloat(f.nota) }))

    if (calificaciones.length === 0) { setError('Ingresa al menos una calificación.'); return }
    setRegistrando(true)
    try {
      await adminApi.registrarCalificaciones(selectedExamen.id, calificaciones)
      setSuccess(`${calificaciones.length} calificación(es) registradas con orden de mérito.`)
      const sorted = [...calificaciones].sort((a, b) => (b.nota ?? 0) - (a.nota ?? 0))
      setRanking(sorted)
      setRankingExamen(selectedExamen)
      setCalifFilas([{ codigoAlumno: '', nota: '', buenas: '', malas: '' }])
    } catch {
      setError('Error al registrar calificaciones.')
    } finally {
      setRegistrando(false)
    }
  }

  const addFila    = () => setCalifFilas([...califFilas, { codigoAlumno: '', nota: '', buenas: '', malas: '' }])
  const removeFila = (i: number) => setCalifFilas(califFilas.filter((_, idx) => idx !== i))
  const updateFila = (i: number, field: 'codigoAlumno' | 'nota' | 'buenas' | 'malas', val: string) => {
    const next = [...califFilas]; next[i] = { ...next[i], [field]: val }
    setCalifFilas(next)
  }

  const descargarPlantilla = () => {
    if (!selectedExamen) { setError('Selecciona un examen primero.'); return }
    clearAlerts()
    adminApi.getExamenPlantillaNotas(selectedExamen.id)
      .then((res) => {
        const url = URL.createObjectURL(res.data as Blob)
        const a = document.createElement('a')
        a.href = url; a.download = `plantilla-notas-examen-${selectedExamen.id}.xlsx`; a.click()
        URL.revokeObjectURL(url)
        setSuccess('Plantilla descargada.')
      })
      .catch(() => setError('Error al descargar la plantilla.'))
  }

  const subirNotasExcel = (file: File) => {
    if (!selectedExamen) { setError('Selecciona un examen primero.'); return }
    clearAlerts()
    adminApi.postExamenNotasExcel(selectedExamen.id, file)
      .then(() => setSuccess('Notas cargadas desde Excel con orden de mérito.'))
      .catch(() => setError('Error al subir el Excel.'))
  }

  // ── Handlers de consulta ──
  const handleConsultaCiclo = (cicloId: number | '') => {
    setConsultaCicloId(cicloId)
    setConsultaExamenes([])
    setConsultaRanking(null)
    if (!cicloId) return
    setLoadingConsulta(true)
    adminApi.getExamenesPorCiclo(cicloId as number)
      .then((res) => setConsultaExamenes(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Error al cargar exámenes del ciclo.'))
      .finally(() => setLoadingConsulta(false))
  }

  const verRanking = async (ex: Examen) => {
    setLoadingRanking(true)
    setConsultaRanking(null)
    try {
      const res = await adminApi.getNotasExamen(ex.id)
      setConsultaRanking(res.data)
    } catch {
      setError('Error al cargar el ranking de este examen.')
    } finally {
      setLoadingRanking(false)
    }
  }

  const descargarRanking = async (examenId: number) => {
    setDlRankingId(examenId)
    try {
      const res = await adminApi.reporteOrdenMerito(examenId)
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url; a.download = `ranking-examen-${examenId}.xlsx`; a.click()
      URL.revokeObjectURL(url)
    } catch {
      setError('Error al descargar el ranking.')
    } finally {
      setDlRankingId(null)
    }
  }

  const notaBadge = (nota: string) => {
    const n = parseFloat(nota)
    if (isNaN(n)) return null
    if (n >= 14) return <span className="nota-badge nota-alta">{nota}</span>
    if (n >= 11) return <span className="nota-badge nota-media">{nota}</span>
    return <span className="nota-badge nota-baja">{nota}</span>
  }

  const fmtFecha = (f: string) => {
    if (!f) return ''
    const [y, m, d] = f.split('-')
    return `${d}/${m}/${y}`
  }

  if (loading) return (
    <div className="exam-wrap">
      <style>{styles}</style>
      <div className="exam-loading"><div className="exam-spinner" /> Cargando...</div>
    </div>
  )

  return (
    <div className="exam-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="exam-header">
        <h2 className="exam-title">
          <span className="exam-title-icon"><i className="bi bi-file-earmark-text-fill" /></span>
          <span>
            Exámenes y notas
            <div className="exam-subtitle">Crea exámenes y registra calificaciones por ciclo</div>
          </span>
        </h2>
      </div>

      {/* Alerts */}
      {error   && <div className="exam-alert-error">  <i className="bi bi-exclamation-circle-fill" style={{ flexShrink: 0 }} /> {error}</div>}
      {success && <div className="exam-alert-success"><i className="bi bi-check-circle-fill"       style={{ flexShrink: 0 }} /> {success}</div>}

      <div className="exam-grid">

        {/* ── CREAR EXAMEN ── */}
        <div className="exam-card">
          <div className="exam-card-header">
            <span className="exam-card-header-icon crear"><i className="bi bi-plus-circle-fill" /></span>
            <div>
              <p className="exam-card-title">Crear examen</p>
              <p className="exam-card-desc">Define el ciclo, semana, tipo y fecha</p>
            </div>
          </div>
          <div className="exam-card-body">
            <form onSubmit={handleCrearExamen}>
              <div className="exam-field">
                <label>Ciclo</label>
                <div className="exam-select-wrap">
                  <select value={cicloCrearId} onChange={(e) => setCicloCrearId(e.target.value ? parseInt(e.target.value) : '')} required>
                    <option value="">-- Seleccionar ciclo --</option>
                    {ciclos.map((c) => <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="exam-field-row">
                <div className="exam-field">
                  <label>Semana</label>
                  <input type="number" placeholder="Ej: 7" min={1}
                    value={examenForm.semana}
                    onChange={(e) => setExamenForm({ ...examenForm, semana: e.target.value })} required />
                </div>
                <div className="exam-field">
                  <label>Tipo de examen</label>
                  <div className="exam-select-wrap">
                    <select
                      value={examenForm.tipoExamen}
                      onChange={(e) => setExamenForm({
                        ...examenForm,
                        tipoExamen: e.target.value,
                        subtipoExamen: '',        // resetear subtipo al cambiar tipo
                      })}
                      required
                    >
                      <option value="">-- Seleccionar tipo --</option>
                      <option value="Anual">Anual</option>
                      <option value="Semestral">Semestral</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Subtipo Anual ── */}
              {examenForm.tipoExamen === 'Anual' && (
                <div className="exam-field">
                  <label>Subtipo <span style={{ color: '#e76f51', fontWeight: 400 }}>*</span></label>
                  <div className="exam-select-wrap">
                    <select
                      value={examenForm.subtipoExamen}
                      onChange={(e) => setExamenForm({ ...examenForm, subtipoExamen: e.target.value })}
                      required
                    >
                      <option value="">-- Seleccionar subtipo --</option>
                      <optgroup label="Simulacros Semanales">
                        <option value="Simulacro Semanal - Matemáticas y Ciencias">Simulacro Semanal — Matemáticas y Ciencias</option>
                        <option value="Simulacro Semanal - Humanidades">Simulacro Semanal — Humanidades</option>
                      </optgroup>
                      <optgroup label="Simulacros Bimestrales">
                        <option value="Simulacro Bimestral">Simulacro Bimestral</option>
                      </optgroup>
                    </select>
                  </div>
                </div>
              )}

              {/* ── Subtipo Semestral ── */}
              {examenForm.tipoExamen === 'Semestral' && (
                <div className="exam-field">
                  <label>Subtipo <span style={{ color: '#e76f51', fontWeight: 400 }}>*</span></label>
                  <div className="exam-select-wrap">
                    <select
                      value={examenForm.subtipoExamen}
                      onChange={(e) => setExamenForm({ ...examenForm, subtipoExamen: e.target.value })}
                      required
                    >
                      <option value="">-- Seleccionar subtipo --</option>
                      <option value="Semanal de Profesores">Semanal de Profesores</option>
                      <optgroup label="Semanales por Área">
                        <option value="Semanal por Área - Matemáticas y Ciencias">Semanal por Área — Matemáticas y Ciencias</option>
                        <option value="Semanal por Área - Humanidades">Semanal por Área — Humanidades</option>
                      </optgroup>
                      <option value="Tipo Admisión">Tipo Admisión</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="exam-field-row">
                <div className="exam-field">
                  <label>Fecha</label>
                  <input type="date" value={examenForm.fecha}
                    onChange={(e) => setExamenForm({ ...examenForm, fecha: e.target.value })} required />
                </div>
                <div className="exam-field">
                  <label>N° preguntas</label>
                  <input type="number" placeholder="Ej: 50" min={1}
                    value={examenForm.cantidadPreguntas}
                    onChange={(e) => setExamenForm({ ...examenForm, cantidadPreguntas: e.target.value })} />
                </div>
              </div>

              {/* Puntajes para fórmula Buenas/Malas */}
              <div className="exam-field-row">
                <div className="exam-field">
                  <label>Pts. respuesta correcta</label>
                  <input type="number" step="0.5" min={0} placeholder="4"
                    value={examenForm.puntajeBuena}
                    onChange={(e) => setExamenForm({ ...examenForm, puntajeBuena: e.target.value })} />
                </div>
                <div className="exam-field">
                  <label>Pts. descontados (incorrecta)</label>
                  <input type="number" step="0.5" min={0} placeholder="1"
                    value={examenForm.puntajeMala}
                    onChange={(e) => setExamenForm({ ...examenForm, puntajeMala: e.target.value })} />
                </div>
              </div>

              <button type="submit" className="btn-crear-examen" disabled={creando}>
                {creando
                  ? <><div className="exam-spinner-sm" /> Creando...</>
                  : <><i className="bi bi-plus-circle" /> Crear examen</>}
              </button>
            </form>
          </div>
        </div>

        {/* ── REGISTRAR CALIFICACIONES ── */}
        <div className="exam-card">
          <div className="exam-card-header">
            <span className="exam-card-header-icon notas"><i className="bi bi-bar-chart-line-fill" /></span>
            <div>
              <p className="exam-card-title">Registrar calificaciones</p>
              <p className="exam-card-desc">Selecciona el ciclo y el examen, luego ingresa notas</p>
            </div>
          </div>
          <div className="exam-card-body">

            {/* Selector de ciclo */}
            <div className="exam-field" style={{ marginBottom: 16 }}>
              <label>Ciclo para buscar examen</label>
              <div className="exam-select-wrap">
                <select value={cicloNotasId} onChange={(e) => setCicloNotasId(e.target.value ? parseInt(e.target.value) : '')}>
                  <option value="">-- Seleccionar ciclo --</option>
                  {ciclos.map((c) => <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>)}
                </select>
              </div>
            </div>

            {/* Lista de exámenes del ciclo */}
            {cicloNotasId && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  Examen
                </label>
                {loadingExamenes ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0', color: 'var(--teal-mid)', fontSize: 13 }}>
                    <div className="exam-spinner-sm" style={{ borderColor: 'var(--teal-light)', borderTopColor: 'var(--teal-mid)' }} /> Cargando exámenes...
                  </div>
                ) : examenesLista.length === 0 ? (
                  <div className="calif-empty" style={{ marginBottom: 0 }}>
                    <i className="bi bi-file-earmark-x" />
                    No hay exámenes en este ciclo.
                  </div>
                ) : (
                  <div className="exam-list">
                    {examenesLista.map((ex) => (
                      <div
                        key={ex.id}
                        className={`exam-list-item${selectedExamen?.id === ex.id ? ' selected' : ''}`}
                        onClick={() => setSelectedExamen(ex)}
                      >
                        <div className="exam-list-item-left">
                          <div className="exam-list-item-tipo">{ex.tipo_examen ?? ex.tipoExamen} — Sem. {ex.semana}</div>
                          <div className="exam-list-item-meta">
                            {fmtFecha(ex.fecha)}
                            {(ex.cantidad_preguntas ?? ex.cantidadPreguntas) && <span style={{ marginLeft: 8 }}><i className="bi bi-question-circle me-1" />{ex.cantidad_preguntas ?? ex.cantidadPreguntas} preg.</span>}
                            <span style={{ marginLeft: 8, fontFamily: 'monospace', fontSize: 10 }}>#{ex.id}</span>
                          </div>
                        </div>
                        {selectedExamen?.id === ex.id && (
                          <div className="exam-list-item-check"><i className="bi bi-check-lg" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Examen activo chip */}
            {selectedExamen && (
              <div className="exam-active-chip" style={{ marginBottom: 12 }}>
                <i className="bi bi-bookmark-check-fill" />
                Examen: <strong>{selectedExamen.tipo_examen ?? selectedExamen.tipoExamen}</strong>
                <span style={{ fontWeight: 400, marginLeft: 4, color: 'var(--text-muted)' }}>#{selectedExamen.id}</span>
              </div>
            )}

            {/* Filas de notas manuales */}
            {selectedExamen && (
              <form onSubmit={handleRegistrarCalificaciones}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: 8 }}>
                  {usaBuenasMalas
                    ? `Código / Buenas / Malas — fórmula: (B×${selectedExamen.puntaje_pregunta_buena ?? 4}) − (M×${selectedExamen.puntaje_pregunta_mala ?? 1})`
                    : 'Código alumno / Nota directa'}
                </label>

                {califFilas.length === 0 ? (
                  <div className="calif-empty">
                    <i className="bi bi-table" />
                    Agrega filas para ingresar notas.
                  </div>
                ) : (
                  <div className="calif-rows">
                    {califFilas.map((f, i) => (
                      <div key={i} className="calif-row">
                        <div>
                          <div className="calif-row-num">ALUMNO #{i + 1}</div>
                          <input type="text" placeholder="Código"
                            value={f.codigoAlumno}
                            onChange={(e) => updateFila(i, 'codigoAlumno', e.target.value)} />
                        </div>
                        {usaBuenasMalas ? (<>
                          <div>
                            <div className="calif-row-num">BUENAS</div>
                            <input type="number" min={0} placeholder="0"
                              value={f.buenas}
                              onChange={(e) => updateFila(i, 'buenas', e.target.value)} />
                          </div>
                          <div>
                            <div className="calif-row-num">MALAS</div>
                            <input type="number" min={0} placeholder="0"
                              value={f.malas}
                              onChange={(e) => updateFila(i, 'malas', e.target.value)} />
                          </div>
                        </>) : (
                          <div>
                            <div className="calif-row-num">NOTA</div>
                            <input type="number" step="0.01" min={0} max={20} placeholder="0.00"
                              value={f.nota}
                              onChange={(e) => updateFila(i, 'nota', e.target.value)} />
                            {f.nota && <div style={{ marginTop: 4 }}>{notaBadge(f.nota)}</div>}
                          </div>
                        )}
                        <button type="button" className="btn-remove-fila" onClick={() => removeFila(i)}>
                          <i className="bi bi-trash3-fill" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                  <button type="button" className="btn-add-fila" onClick={addFila}>
                    <i className="bi bi-plus-circle" /> Agregar fila
                  </button>
                  {califFilas.some((f) => f.codigoAlumno && (f.nota || (f.buenas && f.malas))) && (
                    <button type="submit" className="btn-registrar-notas" disabled={registrando}>
                      {registrando
                        ? <><div className="exam-spinner-sm" /> Registrando...</>
                        : <><i className="bi bi-check2-all" /> Registrar {califFilas.filter(f => f.codigoAlumno && (f.nota || f.buenas)).length} nota(s)</>}
                    </button>
                  )}
                </div>
              </form>
            )}

            {/* Excel section */}
            <div className="exam-divider">
              <div className="exam-divider-line" />
              <span className="exam-divider-label"><i className="bi bi-file-earmark-excel-fill me-1" style={{ color: '#1d6f42' }} />Carga masiva por Excel</span>
              <div className="exam-divider-line" />
            </div>

            <div className="excel-panel">
              <p className="excel-panel-title">Plantilla Excel</p>
              <p className="excel-panel-desc">
                {selectedExamen
                  ? <>Plantilla para <strong>{selectedExamen.tipo_examen ?? selectedExamen.tipoExamen}</strong> (Sem. {selectedExamen.semana}). Descarga, llena las notas y sube el archivo.</>
                  : 'Selecciona un ciclo y un examen para descargar la plantilla o subir notas.'}
              </p>
              <div className="excel-panel-actions">
                <button type="button" className="btn-excel-dl" onClick={descargarPlantilla} disabled={!selectedExamen}>
                  <i className="bi bi-download" /> Descargar plantilla
                </button>
                <button type="button" className="btn-excel-up" onClick={() => fileInputRef.current?.click()} disabled={!selectedExamen}>
                  <i className="bi bi-upload" /> Subir Excel
                </button>
                <input ref={fileInputRef} type="file" accept=".xlsx" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) subirNotasExcel(f) }} />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Consultar Exámenes del Ciclo ── */}
      <div className="consultar-card">
        <div className="consultar-header">
          <div className="consultar-header-left">
            <span className="consultar-header-icon"><i className="bi bi-trophy-fill" /></span>
            <div>
              <p className="exam-card-title" style={{ margin: 0 }}>Consultar exámenes por ciclo</p>
              <p className="exam-card-desc" style={{ margin: 0 }}>Ver notas, fechas y ranking de exámenes registrados</p>
            </div>
          </div>
          <div className="exam-select-wrap" style={{ minWidth: 200, flex: '0 0 auto' }}>
            <select
              value={consultaCicloId}
              onChange={(e) => handleConsultaCiclo(e.target.value ? parseInt(e.target.value) : '')}
            >
              <option value="">-- Seleccionar ciclo --</option>
              {ciclos.map((c) => <option key={c.id} value={c.id}>{c.nombres ?? c.nombre}</option>)}
            </select>
          </div>
        </div>

        <div className="consultar-body">
          {!consultaCicloId ? (
            <div className="exam-no-ciclo">
              <i className="bi bi-arrow-up-circle" />
              Selecciona un ciclo para ver sus exámenes
            </div>
          ) : loadingConsulta ? (
            <div className="ranking-loading"><div className="exam-spinner-sm" style={{ borderColor: 'var(--teal-light)', borderTopColor: 'var(--teal-mid)' }} /> Cargando exámenes...</div>
          ) : consultaExamenes.length === 0 ? (
            <div className="exam-no-ciclo">
              <i className="bi bi-file-earmark-x" />
              No hay exámenes registrados en este ciclo.
            </div>
          ) : (
            <div className="consultar-exam-list">
              {consultaExamenes.map((ex) => (
                <div key={ex.id} className="consultar-exam-item">
                  <div>
                    <div className="consultar-exam-tipo">{ex.tipo_examen ?? ex.tipoExamen} — Semana {ex.semana}</div>
                    <div className="consultar-exam-meta">
                      <i className="bi bi-calendar-event me-1" />
                      {fmtFecha(ex.fecha)}
                      {(ex.cantidad_preguntas ?? ex.cantidadPreguntas) && (
                        <span style={{ marginLeft: 10 }}>
                          <i className="bi bi-question-circle me-1" />{ex.cantidad_preguntas ?? ex.cantidadPreguntas} preg.
                        </span>
                      )}
                      <span style={{ marginLeft: 10, fontFamily: 'monospace', fontSize: 10 }}>#{ex.id}</span>
                    </div>
                  </div>
                  <button className="btn-ver-ranking" onClick={() => verRanking(ex)}>
                    <i className="bi bi-eye-fill" /> Ver ranking
                  </button>
                  <button
                    className="btn-dl-ranking"
                    onClick={() => descargarRanking(ex.id)}
                    disabled={dlRankingId === ex.id}
                  >
                    <i className="bi bi-file-earmark-excel-fill" />
                    {dlRankingId === ex.id ? '...' : 'Excel'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Ranking inline del examen seleccionado */}
          {loadingRanking && (
            <div className="ranking-loading" style={{ marginTop: 16 }}>
              <div className="exam-spinner-sm" style={{ borderColor: 'var(--teal-light)', borderTopColor: 'var(--teal-mid)' }} />
              Cargando ranking...
            </div>
          )}

          {consultaRanking && !loadingRanking && (
            <div className="ranking-section" style={{ marginTop: 20 }}>
              <div className="ranking-header">
                <div className="ranking-header-left">
                  <div className="ranking-header-icon"><i className="bi bi-trophy-fill" /></div>
                  <div>
                    <p className="ranking-title">
                      {consultaRanking.examen?.tipo_examen ?? consultaRanking.examen?.tipoExamen} — Sem. {consultaRanking.examen?.semana}
                    </p>
                    <p className="ranking-subtitle">
                      {fmtFecha(consultaRanking.examen?.fecha)} &nbsp;·&nbsp; {consultaRanking.notas.length} alumnos
                    </p>
                  </div>
                </div>
                <button className="ranking-close" onClick={() => setConsultaRanking(null)}><i className="bi bi-x-lg" /></button>
              </div>

              {/* Podium top 3 */}
              {consultaRanking.notas.length >= 2 && (
                <div className="ranking-podium">
                  {consultaRanking.notas[1] && (
                    <div className="podium-item">
                      <div className="podium-medal silver">🥈</div>
                      <div className="podium-code" title={consultaRanking.notas[1].codigo}>{consultaRanking.notas[1].apellidos}</div>
                      <div className="podium-nota silver">{consultaRanking.notas[1].nota}</div>
                      <div className="podium-base silver">2°</div>
                    </div>
                  )}
                  {consultaRanking.notas[0] && (
                    <div className="podium-item">
                      <div className="podium-medal gold">🥇</div>
                      <div className="podium-code" title={consultaRanking.notas[0].codigo}>{consultaRanking.notas[0].apellidos}</div>
                      <div className="podium-nota gold">{consultaRanking.notas[0].nota}</div>
                      <div className="podium-base gold">1°</div>
                    </div>
                  )}
                  {consultaRanking.notas[2] && (
                    <div className="podium-item">
                      <div className="podium-medal bronze">🥉</div>
                      <div className="podium-code" title={consultaRanking.notas[2].codigo}>{consultaRanking.notas[2].apellidos}</div>
                      <div className="podium-nota bronze">{consultaRanking.notas[2].nota}</div>
                      <div className="podium-base bronze">3°</div>
                    </div>
                  )}
                </div>
              )}

              {consultaRanking.notas.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  <i className="bi bi-inbox" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} />
                  No hay notas registradas para este examen aún.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="ranking-table">
                    <thead>
                      <tr>
                        <th style={{ width: 50 }}>Pos.</th>
                        <th>Alumno</th>
                        <th>Código</th>
                        <th>Nota</th>
                        <th>Distribución</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consultaRanking.notas.map((r, i) => {
                        const posClass = i === 0 ? 'p1' : i === 1 ? 'p2' : i === 2 ? 'p3' : ''
                        const pct = (r.nota / 20) * 100
                        const barClass = r.nota >= 14 ? 'high' : r.nota >= 11 ? 'mid' : 'low'
                        return (
                          <tr key={i}>
                            <td><span className={`rank-pos ${posClass}`}>{r.puesto}</span></td>
                            <td style={{ fontWeight: 600 }}>{r.apellidos}, {r.nombres}</td>
                            <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{r.codigo}</td>
                            <td>
                              <span className={`nota-badge ${r.nota >= 14 ? 'nota-alta' : r.nota >= 11 ? 'nota-media' : 'nota-baja'}`}>
                                {r.nota}
                              </span>
                            </td>
                            <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="rank-bar-wrap">
                                <div className={`rank-bar ${barClass}`} style={{ width: `${pct}%` }} />
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{pct.toFixed(0)}%</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Ranking visual (tras registrar) ── */}
      {ranking.length > 0 && rankingExamen && (
        <div className="ranking-section">
          <div className="ranking-header">
            <div className="ranking-header-left">
              <div className="ranking-header-icon"><i className="bi bi-trophy-fill" /></div>
              <div>
                <p className="ranking-title">Orden de mérito</p>
                <p className="ranking-subtitle">
                  {rankingExamen.tipo_examen ?? rankingExamen.tipoExamen} — Sem. {rankingExamen.semana} &nbsp;·&nbsp; {ranking.length} alumnos
                </p>
              </div>
            </div>
            <button className="ranking-close" onClick={() => setRanking([])} title="Cerrar">
              <i className="bi bi-x-lg" />
            </button>
          </div>

          {/* Podium for top 3 */}
          {ranking.length >= 2 && (
            <div className="ranking-podium">
              {/* 2nd */}
              {ranking[1] && (
                <div className="podium-item">
                  <div className="podium-medal silver">🥈</div>
                  <div className="podium-code" title={ranking[1].codigoAlumno}>{ranking[1].codigoAlumno}</div>
                  <div className="podium-nota silver">{ranking[1].nota}</div>
                  <div className="podium-base silver">2°</div>
                </div>
              )}
              {/* 1st */}
              {ranking[0] && (
                <div className="podium-item">
                  <div className="podium-medal gold">🥇</div>
                  <div className="podium-code" title={ranking[0].codigoAlumno}>{ranking[0].codigoAlumno}</div>
                  <div className="podium-nota gold">{ranking[0].nota}</div>
                  <div className="podium-base gold">1°</div>
                </div>
              )}
              {/* 3rd */}
              {ranking[2] && (
                <div className="podium-item">
                  <div className="podium-medal bronze">🥉</div>
                  <div className="podium-code" title={ranking[2].codigoAlumno}>{ranking[2].codigoAlumno}</div>
                  <div className="podium-nota bronze">{ranking[2].nota}</div>
                  <div className="podium-base bronze">3°</div>
                </div>
              )}
            </div>
          )}

          {/* Full table */}
          <div style={{ overflowX: 'auto' }}>
            <table className="ranking-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>Pos.</th>
                  <th>Código alumno</th>
                  <th>Nota</th>
                  <th>Distribución</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r, i) => {
                  const posClass = i === 0 ? 'p1' : i === 1 ? 'p2' : i === 2 ? 'p3' : ''
                  const pct = ranking[0].nota > 0 ? (r.nota / 20) * 100 : 0
                  const barClass = r.nota >= 14 ? 'high' : r.nota >= 11 ? 'mid' : 'low'
                  return (
                    <tr key={i}>
                      <td><span className={`rank-pos ${posClass}`}>{i + 1}</span></td>
                      <td style={{ fontWeight: 600 }}>{r.codigoAlumno}</td>
                      <td>
                        <span className={`nota-badge ${r.nota >= 14 ? 'nota-alta' : r.nota >= 11 ? 'nota-media' : 'nota-baja'}`}>
                          {r.nota}
                        </span>
                      </td>
                      <td style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="rank-bar-wrap">
                          <div className={`rank-bar ${barClass}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {pct.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
