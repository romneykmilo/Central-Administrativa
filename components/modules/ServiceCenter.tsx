'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Ticket, TicketStatus, TicketPriority, ServiceCategory } from '@/types';
import {
  LifeBuoy,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Calendar,
  User,
  ChevronRight,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';

export const ServiceCenter: React.FC = () => {
  const {
    tickets,
    setSelectedTicketId,
    openNewTicketWithPrefill,
    currentUser,
    availableUsers,
  } = useApp();

  const [activeView, setActiveView] = useState<'todos' | 'meus' | 'sla_painel' | 'aprovacoes'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterPriority, setFilterPriority] = useState<string>('todas');
  const [filterSla, setFilterSla] = useState<string>('todos');
  const [nowTimestamp] = useState(() => Date.now());

  // Compute SLA status helper
  const getTicketSla = useCallback(
    (ticket: Ticket) => {
      if (ticket.status === 'concluido') return { status: 'concluido', label: 'Concluído', color: 'emerald' };
      if (ticket.status === 'cancelado') return { status: 'cancelado', label: 'Cancelado', color: 'slate' };

      const deadline = new Date(ticket.slaDeadline).getTime();
      const diffHours = (deadline - nowTimestamp) / 3600000;

      if (diffHours < 0) {
        const overHours = Math.abs(Math.round(diffHours));
        return { status: 'vencido', label: `Vencido (${overHours}h atrás)`, color: 'red' };
      } else if (diffHours <= 3) {
        return { status: 'critico', label: `Restam ${Math.round(diffHours)}h (Crítico)`, color: 'amber' };
      } else {
        return { status: 'no_prazo', label: `No prazo (${Math.round(diffHours)}h)`, color: 'emerald' };
      }
    },
    [nowTimestamp]
  );

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // Subtab filter
      if (activeView === 'meus' && ticket.requesterId !== currentUser.id) {
        return false;
      }
      if (activeView === 'aprovacoes' && ticket.status !== 'aguardando_aprovacao') {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchNum = ticket.ticketNumber.toLowerCase().includes(query);
        const matchTitle = ticket.title.toLowerCase().includes(query);
        const matchDesc = ticket.description.toLowerCase().includes(query);
        const matchReq = ticket.requesterName.toLowerCase().includes(query);
        const matchServ = ticket.serviceName.toLowerCase().includes(query);
        if (!matchNum && !matchTitle && !matchDesc && !matchReq && !matchServ) return false;
      }

      // Category filter
      if (filterCategory !== 'todas' && ticket.category !== filterCategory) {
        return false;
      }

      // Status filter
      if (filterStatus !== 'todos' && ticket.status !== filterStatus) {
        return false;
      }

      // Priority filter
      if (filterPriority !== 'todas' && ticket.priority !== filterPriority) {
        return false;
      }

      // SLA filter
      if (filterSla !== 'todos') {
        const sla = getTicketSla(ticket);
        if (filterSla === 'vencido' && sla.status !== 'vencido') return false;
        if (filterSla === 'critico' && sla.status !== 'critico') return false;
        if (filterSla === 'no_prazo' && sla.status !== 'no_prazo') return false;
      }

      return true;
    });
  }, [tickets, activeView, searchTerm, filterCategory, filterStatus, filterPriority, filterSla, currentUser, getTicketSla]);

  const stats = useMemo(() => {
    const total = tickets.length;
    const emAberto = tickets.filter((t) => t.status !== 'concluido' && t.status !== 'cancelado').length;
    const vencidos = tickets.filter((t) => getTicketSla(t).status === 'vencido').length;
    const concluidos = tickets.filter((t) => t.status === 'concluido').length;
    return { total, emAberto, vencidos, concluidos };
  }, [tickets, getTicketSla]);

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Central de Serviços</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestão operacional, acompanhamento de chamados e conformidade de SLA
          </p>
        </div>
        <button
          onClick={() => openNewTicketWithPrefill()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Novo Chamado</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total de Chamados</span>
          <div className="text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">{stats.total}</div>
          <span className="text-[11px] text-slate-400">Demandas cadastradas</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider block">Em Atendimento</span>
          <div className="text-2xl font-bold text-blue-600 font-mono mt-1 tabular-nums">{stats.emAberto}</div>
          <span className="text-[11px] text-slate-400">Requerem ação ou análise</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wider block">SLA Vencido</span>
          <div className="text-2xl font-bold text-red-600 font-mono mt-1 tabular-nums">{stats.vencidos}</div>
          <span className="text-[11px] text-red-500 font-medium">Prioridade máxima imediata</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">Concluídos</span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1 tabular-nums">{stats.concluidos}</div>
          <span className="text-[11px] text-slate-400">Finalizados com sucesso</span>
        </div>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'todos', label: `Todos os Chamados (${tickets.length})` },
          { id: 'meus', label: `Meus Chamados (${tickets.filter((t) => t.requesterId === currentUser.id).length})` },
          { id: 'sla_painel', label: 'Painel de SLA' },
          { id: 'aprovacoes', label: `Aguardando Aprovação (${tickets.filter((t) => t.status === 'aguardando_aprovacao').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id as any)}
            className={`px-4 py-2.5 border-b-2 font-medium transition-colors whitespace-nowrap ${
              activeView === tab.id
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, título, solicitante..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="todas">Todas as Categorias</option>
              <option value="logistica">Logística</option>
              <option value="manutencao">Manutenção</option>
              <option value="atendimento">Atendimento & Copa</option>
              <option value="viagens">Viagens</option>
              <option value="telefonia">Telefonia</option>
              <option value="compras">Compras</option>
              <option value="estoque">Estoque</option>
              <option value="documentos">Documentos / GED</option>
              <option value="patrimonio">Patrimônio</option>
              <option value="imoveis">Imóveis</option>
              <option value="obras">Obras</option>
              <option value="pagamentos">Pagamentos</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="todos">Todos os Status</option>
              <option value="novo">Novo</option>
              <option value="em_analise">Em Análise</option>
              <option value="aguardando_info">Aguardando Informação</option>
              <option value="aguardando_aprovacao">Aguardando Aprovação</option>
              <option value="agendado">Agendado</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          {/* SLA filter */}
          <div>
            <select
              value={filterSla}
              onChange={(e) => setFilterSla(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="todos">Status do SLA (Todos)</option>
              <option value="no_prazo">🟢 SLA Dentro do Prazo</option>
              <option value="critico">🟡 SLA Próximo do Vencimento</option>
              <option value="vencido">🔴 SLA Vencido / Atrasado</option>
            </select>
          </div>
        </div>

        {/* Clear filters shortcut if active */}
        {(searchTerm || filterCategory !== 'todas' || filterStatus !== 'todos' || filterSla !== 'todos') && (
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <span>Mostrando {filteredTickets.length} de {tickets.length} chamados</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('todas');
                setFilterStatus('todos');
                setFilterPriority('todas');
                setFilterSla('todos');
              }}
              className="text-blue-600 hover:underline font-medium"
            >
              Limpar todos os filtros
            </button>
          </div>
        )}
      </div>

      {/* Tickets Table / List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center">
            <LifeBuoy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800">Nenhum chamado encontrado</h4>
            <p className="text-xs text-slate-500 mt-1">Ajuste os filtros ou crie uma nova solicitação.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Chamado</th>
                  <th className="py-3 px-4">Demanda & Categoria</th>
                  <th className="py-3 px-4">Solicitante</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Controle de SLA</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((t) => {
                  const sla = getTicketSla(t);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      {/* Ticket Number & Date */}
                      <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {t.ticketNumber}
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5" suppressHydrationWarning>
                          {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>

                      {/* Title & Category */}
                      <td className="py-3 px-4 max-w-xs sm:max-w-md">
                        <div className="font-semibold text-slate-900 line-clamp-1">{t.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {t.serviceName} · <span className="capitalize">{t.category}</span>
                        </div>
                      </td>

                      {/* Requester */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-800">{t.requesterName}</div>
                        <div className="text-[11px] text-slate-400">{t.requesterDepartment}</div>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`font-mono uppercase font-semibold text-[10px] px-2 py-0.5 rounded ${
                            t.priority === 'critica'
                              ? 'bg-red-100 text-red-800'
                              : t.priority === 'alta'
                              ? 'bg-amber-100 text-amber-800'
                              : t.priority === 'media'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Visual SLA */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              sla.color === 'red'
                                ? 'bg-red-600'
                                : sla.color === 'amber'
                                ? 'bg-amber-500'
                                : sla.color === 'emerald'
                                ? 'bg-emerald-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          <span
                            className={`text-[11px] font-mono ${
                              sla.color === 'red'
                                ? 'text-red-700 font-bold'
                                : sla.color === 'amber'
                                ? 'text-amber-700 font-semibold'
                                : 'text-slate-600'
                            }`}
                          >
                            {sla.label}
                          </span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicketId(t.id);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                        >
                          <span>Atender</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
