'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ResourceSchedule } from '@/types';

interface Props {
  schedules: ResourceSchedule[];
  title?: string;
}

const statusLabels: Record<ResourceSchedule['status'], string> = {
  pendente: 'Aguardando aprovação',
  confirmado: 'Aprovado',
  rejeitado: 'Rejeitado',
  cancelado: 'Cancelado',
};

const scheduleCode = (id: string) => 'AG-' + id.replace(/^sch-/, '');

export const ScheduleAppointmentsFilter: React.FC<Props> = ({ schedules, title = 'Agendamentos registrados' }) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filtered = useMemo(() => schedules.filter(item => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const searchable = [scheduleCode(item.id), item.title, item.requesterName, item.resourceName, item.location, item.notes, item.driverName, item.vehicleName, item.passengerName, item.cleaningTeamName, item.roomName].filter(Boolean).join(' ').toLocaleLowerCase('pt-BR');
    const date = new Date(item.startDateTime);
    const key = Number.isNaN(date.getTime()) ? '' : [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    return (!term || searchable.includes(term)) &&
      (status === 'todos' || item.status === status) &&
      (!startDate || key >= startDate) &&
      (!endDate || key <= endDate);
  }).sort((a, b) => b.startDateTime.localeCompare(a.startDateTime)), [schedules, search, status, startDate, endDate]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">{title} ({filtered.length})</h3>
        <span className="text-[11px] text-slate-500">{schedules.length} registro(s)</span>
      </div>
      <div className="grid grid-cols-1 gap-2 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Buscar agendamento</span>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar código, descrição, solicitante ou recurso" className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400" />
        </label>
        <label>
          <span className="sr-only">Filtrar por situação</span>
          <select value={status} onChange={event => setStatus(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
            <option value="todos">Todas as situações</option>
            {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="min-w-0"><span className="mb-1 block text-[10px] text-slate-500">De</span><input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] text-slate-700" /></label>
          <label className="min-w-0"><span className="mb-1 block text-[10px] text-slate-500">Até</span><input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] text-slate-700" /></label>
        </div>
      </div>
      {filtered.length === 0 ? <div className="p-8 text-center text-xs text-slate-500">Nenhum agendamento encontrado com os filtros informados.</div> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-xs">
            <thead><tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Código</th><th className="px-4 py-3">Data e horário</th><th className="px-4 py-3">Descrição</th><th className="px-4 py-3">Solicitante</th><th className="px-4 py-3">Recurso / local</th><th className="px-4 py-3">Situação</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(item => <tr key={item.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-blue-600">{scheduleCode(item.id)}</td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Date(item.startDateTime).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td className="max-w-sm px-4 py-3 text-slate-700"><div className="line-clamp-2" title={item.title + (item.notes ? ' — ' + item.notes : '')}>{item.title}{item.notes ? ' — ' + item.notes : ''}</div></td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700">{item.requesterName}</td>
                <td className="px-4 py-3 text-slate-700"><div>{item.resourceName}</div><div className="text-[10px] text-slate-500">{item.vehicleName || item.roomName || item.cleaningTeamName || item.location}</div></td>
                <td className="whitespace-nowrap px-4 py-3"><span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800">{statusLabels[item.status]}</span></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
