'use client';

import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Ticket } from '@/types';

interface Props {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  title?: string;
}

const operationalStatusLabels: Record<string, string> = {
  novo: 'Novo',
  em_analise: 'Em análise',
  em_atendimento: 'Em atendimento',
  aguardando_fornecedor: 'Aguardando fornecedor',
  agendado: 'Agendado',
  aguardando_aprovacao_gestor: 'Aguardando aprovação do gestor',
  aguardando_aprovacao_solicitante: 'Aguardando aprovação do solicitante',
  aguardando_informacoes: 'Aguardando informações',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

const getOperationalStatus = (ticket: Ticket) => {
  const status = ticket.operationalStatus || (
    ticket.status === 'em_andamento' ? 'em_atendimento' :
    ticket.status === 'aguardando_info' ? 'aguardando_informacoes' :
    ticket.status === 'aguardando_aprovacao' ? 'aguardando_aprovacao_gestor' :
    ticket.status
  );
  return operationalStatusLabels[status] || 'Em análise';
};

export const ServiceTicketsFilter: React.FC<Props> = ({ tickets, onSelectTicket, title = 'Chamados do serviço' }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredTickets = useMemo(() => tickets.filter(ticket => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const matchesSearch = !term || [
      ticket.ticketNumber,
      ticket.description,
      ticket.title,
      ticket.requesterName,
    ].some(value => (value || '').toLocaleLowerCase('pt-BR').includes(term));
    const status = getOperationalStatus(ticket);
    const createdDate = new Date(ticket.createdAt);
    const dateKey = Number.isNaN(createdDate.getTime()) ? '' : [
      createdDate.getFullYear(),
      String(createdDate.getMonth() + 1).padStart(2, '0'),
      String(createdDate.getDate()).padStart(2, '0'),
    ].join('-');
    return matchesSearch &&
      (statusFilter === 'todos' || status === statusFilter) &&
      (!startDate || dateKey >= startDate) &&
      (!endDate || dateKey <= endDate);
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [tickets, search, statusFilter, startDate, endDate]);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">{title} ({filteredTickets.length})</h3>
        <span className="text-[11px] text-slate-500">{tickets.length} registro(s)</span>
      </div>
      <div className="grid grid-cols-1 gap-2 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2">
          <span className="sr-only">Buscar chamado</span>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar código, descrição ou solicitante" className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-blue-400" />
        </label>
        <label>
          <span className="sr-only">Filtrar por status</span>
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
            <option value="todos">Todos os status</option>
            {Object.values(operationalStatusLabels).map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="min-w-0"><span className="mb-1 block text-[10px] text-slate-500">De</span><input type="date" value={startDate} onChange={event => setStartDate(event.target.value)} className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] text-slate-700" /></label>
          <label className="min-w-0"><span className="mb-1 block text-[10px] text-slate-500">Até</span><input type="date" value={endDate} onChange={event => setEndDate(event.target.value)} className="w-full min-w-0 rounded-lg border border-slate-200 bg-white px-2 py-2 text-[11px] text-slate-700" /></label>
        </div>
      </div>
      {filteredTickets.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">Nenhum chamado encontrado com os filtros informados.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-xs">
            <thead><tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Código do chamado</th><th className="px-4 py-3">Data de abertura</th><th className="px-4 py-3">Descrição</th><th className="px-4 py-3">Solicitante</th><th className="px-4 py-3">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} onClick={() => onSelectTicket(ticket.id)} className="cursor-pointer hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 font-mono font-semibold text-blue-600">{ticket.ticketNumber}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</td>
                  <td className="max-w-md px-4 py-3 text-slate-700"><div className="line-clamp-2" title={ticket.description}>{ticket.description || ticket.title}</div></td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">{ticket.requesterName}</td>
                  <td className="whitespace-nowrap px-4 py-3"><span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800">{getOperationalStatus(ticket)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
