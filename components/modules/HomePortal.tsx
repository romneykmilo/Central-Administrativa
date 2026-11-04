'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { parseUserIntent } from '@/lib/intent-engine';
import { ServiceCategory } from '@/types';
import {
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
  LifeBuoy,
  Truck,
  Wrench,
  ShoppingBag,
  Plane,
  FileText,
  Building2,
  Boxes,
  PhoneCall,
  Users,
  CalendarDays,
  CreditCard,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const HomePortal: React.FC = () => {
  const {
    currentUser,
    tickets,
    setActiveTab,
    openNewTicketWithPrefill,
    setSelectedTicketId,
    schedules,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const intent = parseUserIntent(inputVal);

  const userTickets = tickets
    .filter((t) => t.requesterId === currentUser.id || currentUser.role === 'admin' || currentUser.role === 'attendant')
    .slice(0, 5);

  const categories: {
    id: ServiceCategory | 'agendamentos';
    label: string;
    sublabel: string;
    icon: any;
    targetTab: string;
  }[] = [
    { id: 'logistica', label: 'Logística', sublabel: 'Motoristas, frotas e correios', icon: Truck, targetTab: 'logistica' },
    { id: 'manutencao', label: 'Manutenção', sublabel: 'Ar-condicionado e predial', icon: Wrench, targetTab: 'manutencao' },
    { id: 'compras', label: 'Compras', sublabel: 'Materiais, cotações e pedidos', icon: ShoppingBag, targetTab: 'compras' },
    { id: 'viagens', label: 'Viagens', sublabel: 'Passagens, hotel e seguro', icon: Plane, targetTab: 'viagens' },
    { id: 'documentos', label: 'Documentos & GED', sublabel: 'Contratos, licenças e alvarás', icon: FileText, targetTab: 'documentos' },
    { id: 'imoveis', label: 'Imóveis', sublabel: 'Gestão de sedes e aluguéis', icon: Building2, targetTab: 'imoveis' },
    { id: 'estoque', label: 'Estoque', sublabel: 'Papelaria, copa e insumos', icon: Boxes, targetTab: 'estoque' },
    { id: 'telefonia', label: 'Telefonia', sublabel: 'Chips corporativos e linhas', icon: PhoneCall, targetTab: 'telefonia' },
    { id: 'atendimento', label: 'Atendimento', sublabel: 'Limpeza, garçons e portaria', icon: Users, targetTab: 'atendimento' },
    { id: 'agendamentos', label: 'Agendamentos', sublabel: 'Salas, carros e garçons', icon: CalendarDays, targetTab: 'agendamentos' },
    { id: 'pagamentos', label: 'Pagamentos', sublabel: 'Contas, concessionárias e taxas', icon: CreditCard, targetTab: 'pagamentos' },
    { id: 'gestao', label: 'Gestão', sublabel: 'Tarefas, pendências e auditoria', icon: ClipboardList, targetTab: 'dashboard' },
  ];

  const handleApplyIntent = () => {
    if (!intent) return;
    if (intent.prefill) {
      openNewTicketWithPrefill(intent.prefill);
    } else {
      setActiveTab(intent.navigationTarget.tab);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; bg: string; text: string }> = {
      novo: { label: 'Novo', bg: 'bg-slate-100', text: 'text-slate-800' },
      em_analise: { label: 'Em Análise', bg: 'bg-blue-100', text: 'text-blue-800' },
      aguardando_info: { label: 'Aguardando Info', bg: 'bg-amber-100', text: 'text-amber-800' },
      aguardando_aprovacao: { label: 'Aprovação', bg: 'bg-purple-100', text: 'text-purple-800' },
      agendado: { label: 'Agendado', bg: 'bg-cyan-100', text: 'text-cyan-800' },
      em_andamento: { label: 'Em Andamento', bg: 'bg-indigo-100', text: 'text-indigo-800' },
      concluido: { label: 'Concluído', bg: 'bg-emerald-100', text: 'text-emerald-800' },
      cancelado: { label: 'Cancelado', bg: 'bg-rose-100', text: 'text-rose-800' },
    };
    const c = config[status] || config.novo;
    return (
      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${c.bg} ${c.text} font-medium`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      {/* Hero Concierge Center Section */}
      <div className="text-center pt-4 sm:pt-8 pb-4 max-w-3xl mx-auto px-4">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Olá, {currentUser.name.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-2">
          Como posso te ajudar hoje? Centralize qualquer demanda ou serviço corporativo.
        </p>

        {/* Large Conversational Search Input */}
        <div className="mt-6 relative">
          <div className="relative flex items-center shadow-md rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all p-1.5 sm:p-2">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Digite o que você precisa... (ex: 'Preciso de um motorista amanhã às 14h', 'Meu ar-condicionado parou')"
              className="w-full text-xs sm:text-sm px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && intent) {
                  handleApplyIntent();
                }
              }}
            />
            <button
              onClick={() => {
                if (intent) {
                  handleApplyIntent();
                } else if (inputVal.trim()) {
                  openNewTicketWithPrefill({ title: inputVal, description: inputVal });
                }
              }}
              className="px-4 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick example tags */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="text-[11px] text-slate-400">Sugestões rápidas:</span>
            {[
              'Preciso de um motorista amanhã às 14h',
              'Ar-condicionado quebrado na sala 03',
              'Quero agendar garçom para evento',
              'Solicitar papel sulfite A4 e café',
            ].map((s) => (
              <button
                key={s}
                onClick={() => setInputVal(s)}
                className="text-[11px] bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-600 px-2 py-0.5 rounded-full transition-colors text-slate-600"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Live Intent Preview Card if typed */}
          {intent && inputVal.trim().length > 2 && (
            <div className="mt-4 text-left p-4 bg-blue-50/90 border border-blue-200 rounded-xl shadow-xs animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Entendemos sua solicitação:</span>
                  <span className="text-[10px] font-mono uppercase bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                    {intent.serviceName}
                  </span>
                </div>
                <span className="text-[11px] text-blue-700 font-medium">SLA estimado: {intent.suggestedPriority === 'alta' ? '12h' : '24h'}</span>
              </div>
              <p className="text-xs text-slate-700 mt-1">{intent.explanation}</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleApplyIntent}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <span>{intent.suggestedActionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTab(intent.navigationTarget.tab)}
                  className="text-xs text-blue-700 hover:underline font-medium"
                >
                  Ir direto para a área do módulo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Or choose a category section */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Ou escolha uma categoria de serviço</h2>
            <p className="text-xs text-slate-500">Navegue pelas áreas especializadas da gestão administrativa</p>
          </div>
          <button
            onClick={() => setActiveTab('central')}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Ver catálogo completo</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* 12 Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'agendamentos') {
                    setActiveTab('agendamentos');
                  } else {
                    setActiveTab(cat.targetTab);
                  }
                }}
                className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-blue-400 rounded-xl text-left transition-all group flex flex-col justify-between h-28 shadow-2xs hover:shadow-xs"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {cat.label}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">
                    {cat.sublabel}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent requests & Today's Agendas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* User Recent Tickets (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Solicitações Recentes</h3>
              <p className="text-xs text-slate-500">Últimos chamados abertos para acompanhamento</p>
            </div>
            <button
              onClick={() => setActiveTab('central')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Ver todos os chamados</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {userTickets.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                Você ainda não possui chamados abertos. Use o campo acima para solicitar qualquer serviço.
              </div>
            ) : (
              userTickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className="p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600">{t.ticketNumber}</span>
                      <span className="font-semibold text-slate-900 truncate">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>{t.serviceName}</span>
                      <span>·</span>
                      <span>Prioridade: <strong className="uppercase font-mono">{t.priority}</strong></span>
                      <span>·</span>
                      <span>{t.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {getStatusBadge(t.status)}
                    <span className="text-blue-600 text-xs font-semibold hover:underline">Ver detalhes</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick summary widget: Confirmed Bookings today */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Agendamentos do Dia</h3>
                <p className="text-xs text-slate-500">Motoristas, salas e garçons confirmados</p>
              </div>
              <button
                onClick={() => setActiveTab('agendamentos')}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Agenda
              </button>
            </div>

            <div className="space-y-3">
              {schedules.slice(0, 3).map((sch) => (
                <div key={sch.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 truncate">{sch.title}</span>
                    <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-medium">
                      {sch.resourceType}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1">{sch.resourceName}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5" suppressHydrationWarning>
                    {sch.location} · <span suppressHydrationWarning>{new Date(sch.startDateTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('agendamentos')}
            className="w-full mt-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            + Fazer Novo Agendamento
          </button>
        </div>
      </div>
    </div>
  );
};
