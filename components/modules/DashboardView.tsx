'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  FileCheck2,
  Boxes,
  CreditCard,
  HardHat,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    tickets,
    contracts,
    inventory,
    purchaseRequests,
    schedules,
    works,
    setSelectedTicketId,
    setActiveTab,
  } = useApp();

  const [period, setPeriod] = useState<'semana' | 'mes' | 'anterior' | 'ano'>('mes');
  const [nowTimestamp] = useState(() => Date.now());

  // Todos os indicadores de chamados respeitam o período selecionado.
  const now = new Date(nowTimestamp);
  const rangeStart = new Date(now);
  const rangeEnd = new Date(now);
  if (period === 'semana') {
    rangeStart.setDate(rangeStart.getDate() - 6);
    rangeStart.setHours(0, 0, 0, 0);
  } else if (period === 'mes') {
    rangeStart.setDate(1);
    rangeStart.setHours(0, 0, 0, 0);
  } else if (period === 'anterior') {
    rangeStart.setDate(1);
    rangeStart.setMonth(rangeStart.getMonth() - 1);
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setDate(0);
    rangeEnd.setHours(23, 59, 59, 999);
  } else {
    rangeStart.setFullYear(2026, 0, 1);
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd.setFullYear(2026, 11, 31);
    rangeEnd.setHours(23, 59, 59, 999);
  }
  const periodTickets = tickets.filter((ticket) => {
    const createdAt = new Date(ticket.createdAt).getTime();
    return createdAt >= rangeStart.getTime() && createdAt <= rangeEnd.getTime();
  });
  const openTickets = periodTickets.filter((t) => t.status !== 'concluido' && t.status !== 'cancelado');
  const inProgressTickets = periodTickets.filter((t) => t.status === 'em_andamento');
  const overdueTickets = periodTickets.filter((t) => {
    if (t.status === 'concluido' || t.status === 'cancelado' || !t.slaDeadline) return false;
    return new Date(t.slaDeadline).getTime() < nowTimestamp;
  });
  const getCompletionTimestamp = (ticket: (typeof tickets)[number]) => {
    if (ticket.completedAt) return new Date(ticket.completedAt).getTime();
    const completionEntry = [...ticket.history].reverse().find((entry) => entry.action.toLowerCase().includes('conclu'));
    return completionEntry ? new Date(completionEntry.timestamp).getTime() : null;
  };
  const completedTickets = tickets.filter((ticket) => {
    if (ticket.status !== 'concluido') return false;
    const completedAt = getCompletionTimestamp(ticket);
    return completedAt !== null && completedAt >= rangeStart.getTime() && completedAt <= rangeEnd.getTime();
  });
  const completedWithKnownSla = completedTickets.filter((ticket) => ticket.slaDeadline && getCompletionTimestamp(ticket) !== null);
  const completedWithinSla = completedWithKnownSla.filter((ticket) => (getCompletionTimestamp(ticket) as number) <= new Date(ticket.slaDeadline).getTime());
  const serviceEfficiency = completedWithKnownSla.length
    ? Math.round((completedWithinSla.length / completedWithKnownSla.length) * 100)
    : null;
  const awaitingApproval = purchaseRequests.filter((p) => p.status === 'aguardando_aprovacao');
  const contractsExpiringSoon = contracts.filter((c) => c.status === 'vencendo');
  const lowStockItems = inventory.filter((i) => i.currentStock <= i.minStock);
  const todaySchedules = schedules.filter((s) => s.status !== 'cancelado');
  const ongoingWorks = works.filter((w) => w.status === 'em_andamento' || w.status === 'em_medicao');

  // Breakdown by Category
  const categoryCounts: Record<string, number> = {};
  periodTickets.forEach((t) => {
    categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
  });

  const categoriesSorted = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);

  // Status breakdown
  const statusCounts = {
    novo: periodTickets.filter((t) => t.status === 'novo').length,
    em_analise: periodTickets.filter((t) => t.status === 'em_analise').length,
    em_andamento: periodTickets.filter((t) => t.status === 'em_andamento').length,
    agendado: periodTickets.filter((t) => t.status === 'agendado').length,
    aguardando: periodTickets.filter((t) => t.status === 'aguardando_info' || t.status === 'aguardando_aprovacao').length,
    concluido: completedTickets.length,
  };

  // Spending estimate by operational category (BRL)
  const spendingData = [
    { label: 'Obras e Reformas', value: 185000, color: 'bg-blue-600' },
    { label: 'Limpeza e Portaria', value: 85100, color: 'bg-emerald-600' },
    { label: 'Mobilidade e Frotas', value: 24800, color: 'bg-indigo-600' },
    { label: 'Manutenção e Climatização', value: 27400, color: 'bg-amber-600' },
    { label: 'Telefonia e Links', value: 12600, color: 'bg-purple-600' },
    { label: 'Copa e Suprimentos', value: 15200, color: 'bg-slate-600' },
  ];
  const totalSpending = spendingData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Dashboard Administrativo</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visão gerencial consolidada das demandas, facilities, contratos, patrimônio e prazos
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs self-start">
          <button
            onClick={() => setPeriod('semana')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              period === 'semana' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Últimos 7 dias
          </button>
          <button
            onClick={() => setPeriod('mes')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              period === 'mes' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Mês Atual
          </button>
          <button
            onClick={() => setPeriod('anterior')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${period === 'anterior' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Mês Anterior
          </button>
          <button
            onClick={() => setPeriod('ano')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              period === 'ano' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ano 2026
          </button>
        </div>
      </div>

      {/* SECTION: MINHA ATENÇÃO HOJE (Critical daily actions) */}
      <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm sm:text-base font-semibold tracking-tight">Minha Atenção Hoje</h2>
          </div>
          <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded text-slate-300 border border-slate-700">
            {overdueTickets.length + awaitingApproval.length + lowStockItems.length + contractsExpiringSoon.length} Ações Críticas
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Overdue Tickets */}
          <div
            onClick={() => setActiveTab('central')}
            className="p-3.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-red-400 font-semibold mb-1">
              <span>SLA Vencido</span>
              <span className="font-mono text-sm">{overdueTickets.length}</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2">
              {overdueTickets.length > 0
                ? `${overdueTickets[0].ticketNumber} - ${overdueTickets[0].title}`
                : 'Nenhum chamado atrasado.'}
            </p>
          </div>

          {/* Pending Purchase Approvals */}
          <div
            onClick={() => setActiveTab('compras')}
            className="p-3.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-amber-400 font-semibold mb-1">
              <span>Aprovações Pendentes</span>
              <span className="font-mono text-sm">{awaitingApproval.length}</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2">
              {awaitingApproval.length > 0
                ? `${awaitingApproval[0].requestNumber} (${awaitingApproval[0].title})`
                : 'Todas as compras aprovadas.'}
            </p>
          </div>

          {/* Low Stock Alerts */}
          <div
            onClick={() => setActiveTab('estoque')}
            className="p-3.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-blue-400 font-semibold mb-1">
              <span>Estoque Crítico</span>
              <span className="font-mono text-sm">{lowStockItems.length} itens</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2">
              {lowStockItems.length > 0
                ? `Repor ${lowStockItems[0].name} (saldo ${lowStockItems[0].currentStock})`
                : 'Estoque regularizado.'}
            </p>
          </div>

          {/* Contracts Expiring */}
          <div
            onClick={() => setActiveTab('contratos')}
            className="p-3.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-purple-400 font-semibold mb-1">
              <span>Contratos a Vencer</span>
              <span className="font-mono text-sm">{contractsExpiringSoon.length}</span>
            </div>
            <p className="text-[11px] text-slate-300 line-clamp-2">
              {contractsExpiringSoon.length > 0
                ? `${contractsExpiringSoon[0].contractNumber} (${contractsExpiringSoon[0].supplierName})`
                : 'Nenhum contrato em renovação.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Abertos</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-1 tabular-nums">{openTickets.length}</div>
          <span className="text-[11px] text-slate-400">Total ativo</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-indigo-600 tracking-wider">Em Andamento</span>
          <div className="text-xl sm:text-2xl font-bold text-indigo-600 font-mono mt-1 tabular-nums">{inProgressTickets.length}</div>
          <span className="text-[11px] text-slate-400">Com equipe</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-emerald-600 tracking-wider">Concluídos</span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 font-mono mt-1 tabular-nums">{completedTickets.length}</div>
          <span className="text-[11px] text-slate-400">No período</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-violet-600 tracking-wider">Eficiência no Atendimento</span>
          <div className="text-xl sm:text-2xl font-bold text-violet-600 font-mono mt-1 tabular-nums">{serviceEfficiency === null ? '—' : `${serviceEfficiency}%`}</div>
          <span className="text-[11px] text-slate-400">{completedWithinSla.length} de {completedWithKnownSla.length} concluídos com SLA registrado</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-cyan-600 tracking-wider">Agendamentos</span>
          <div className="text-xl sm:text-2xl font-bold text-cyan-600 font-mono mt-1 tabular-nums">{todaySchedules.length}</div>
          <span className="text-[11px] text-slate-400">Confirmados</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-amber-600 tracking-wider">Contratos</span>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 font-mono mt-1 tabular-nums">{contracts.length}</div>
          <span className="text-[11px] text-slate-400">Vigentes</span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-blue-600 tracking-wider">Obras Ativas</span>
          <div className="text-xl sm:text-2xl font-bold text-blue-600 font-mono mt-1 tabular-nums">{ongoingWorks.length}</div>
          <span className="text-[11px] text-slate-400">Em execução</span>
        </div>
      </div>

      {/* Visual Charts & Breakdowns (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Demandas por Categoria */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Demandas por Categoria</h3>
              <p className="text-xs text-slate-500">Distribuição de chamados abertos no período selecionado</p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">Total: {periodTickets.length}</span>
          </div>

          <div className="space-y-3">
            {categoriesSorted.slice(0, 6).map(([cat, count]) => {
              const pct = Math.round((count / periodTickets.length) * 100);
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="capitalize text-slate-700">{cat}</span>
                    <span className="font-mono text-slate-500">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                      style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Gastos Administrativos por Categoria */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Gastos Administrativos Mensais</h3>
              <p className="text-xs text-slate-500">Estimativa orçamentária dos contratos e facilities</p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-800">
              R$ {totalSpending.toLocaleString('pt-BR')} /mês
            </span>
          </div>

          <div className="space-y-3">
            {spendingData.map((item) => {
              const pct = Math.round((item.value / totalSpending) * 100);
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{item.label}</span>
                    <span className="font-mono text-slate-600">
                      R$ {item.value.toLocaleString('pt-BR')} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Row: Ongoing Works & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nova Sede & Obras Progress (2 spans) */}
        <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Acompanhamento de Obras & Reformas</h3>
              <p className="text-xs text-slate-500">Cronograma físico-financeiro da Nova Sede e modernizações</p>
            </div>
            <button
              onClick={() => setActiveTab('obras')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Ver todas as obras</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {works.map((w) => (
              <div key={w.id} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-900">{w.title}</span>
                  <span className="font-mono font-bold text-blue-600">{w.progressPercent}% Concluído</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden my-2">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${w.progressPercent}%` }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-1">
                  <span>Etapa atual: {w.currentStage}</span>
                  <span className="font-mono">
                    Gasto: R$ {(w.spent / 1000000).toFixed(2)}M de R$ {(w.budget / 1000000).toFixed(2)}M
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">Distribuição de Status</h3>
            <p className="text-xs text-slate-500 mb-4">Volume de chamados por estado de atendimento</p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Novos (Aguardando triagem)</span>
                <span className="font-mono font-bold text-slate-900">{statusCounts.novo}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Em Análise</span>
                <span className="font-mono font-bold text-blue-600">{statusCounts.em_analise}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Em Andamento</span>
                <span className="font-mono font-bold text-indigo-600">{statusCounts.em_andamento}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Agendados</span>
                <span className="font-mono font-bold text-cyan-600">{statusCounts.agendado}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Aguardando Aprovação / Info</span>
                <span className="font-mono font-bold text-purple-600">{statusCounts.aguardando}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Concluídos com Sucesso</span>
                <span className="font-mono font-bold text-emerald-600">{statusCounts.concluido}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('central')}
            className="w-full mt-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors text-center"
          >
            Acessar Fila de Atendimento
          </button>
        </div>
      </div>
    </div>
  );
};
