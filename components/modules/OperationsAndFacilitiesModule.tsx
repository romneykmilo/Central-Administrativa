'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Users,
  Wrench,
  PhoneCall,
  Plane,
  CreditCard,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Building,
  DollarSign,
  Coffee,
  Shield,
  Sparkles,
} from 'lucide-react';

interface Props {
  initialType: 'atendimento' | 'manutencao' | 'telefonia' | 'viagens' | 'pagamentos';
}

export const OperationsAndFacilitiesModule: React.FC<Props> = ({ initialType }) => {
  const { tickets, openNewTicketWithPrefill, setSelectedTicketId } = useApp();

  const [activeModule, setActiveModule] = useState<
    'atendimento' | 'manutencao' | 'telefonia' | 'viagens' | 'pagamentos'
  >(initialType);

  const moduleMeta: Record<
    string,
    { title: string; subtitle: string; category: string; defaultService: string; icon: any }
  > = {
    atendimento: {
      title: 'Atendimento, Limpeza, Copa & Portaria',
      subtitle: 'Controle de facilities, serviços de copeiragem, portaria e segurança predial',
      category: 'atendimento',
      defaultService: 'Limpeza & Higienização',
      icon: Users,
    },
    manutencao: {
      title: 'Manutenção Predial',
      subtitle: 'Solicitações de manutenção e conservação predial.',
      category: 'manutencao',
      defaultService: 'Climatização e Ar-Condicionado',
      icon: Wrench,
    },
    telefonia: {
      title: 'Telefonia Móvel, Fixa & Conectividade',
      subtitle: 'Gestão de chips corporativos, aparelhos smartphones e ramais PABX',
      category: 'telefonia',
      defaultService: 'Telefonia Móvel / Chip',
      icon: PhoneCall,
    },
    viagens: {
      title: 'Viagens Corporativas & Hospedagem',
      subtitle: 'Emissão de passagens aéreas, reservas de hotéis, seguros e translados',
      category: 'viagens',
      defaultService: 'Passagens & Hospedagem',
      icon: Plane,
    },
    pagamentos: {
      title: 'Pagamentos Comuns, Contas & Concessionárias',
      subtitle: 'Controle de vencimentos de energia, água, condomínio, IPTU e taxas administrativas',
      category: 'pagamentos',
      defaultService: 'Pagamento de Concessionária / Taxa',
      icon: CreditCard,
    },
  };

  const current = moduleMeta[activeModule] || moduleMeta.atendimento;
  const Icon = current.icon;

  const relevantTickets = tickets.filter((t) => t.category === activeModule);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Icon className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{current.title}</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{current.subtitle}</p>
        </div>

        <button
          onClick={() =>
            openNewTicketWithPrefill({
              category: current.category as any,
              serviceName: current.defaultService,
            })
          }
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Solicitação</span>
        </button>
      </div>

      {/* Module Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'atendimento', label: 'Atendimento & Copa', icon: Users },
          { id: 'manutencao', label: 'Manutenção Predial', icon: Wrench },
          { id: 'telefonia', label: 'Telefonia & Chips', icon: PhoneCall },
          { id: 'viagens', label: 'Viagens & Passagens', icon: Plane },
          { id: 'pagamentos', label: 'Pagamentos & Contas', icon: CreditCard },
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isSel = activeModule === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModule(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                isSel
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TabIcon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Custom Cards for Specific Modules */}
      {activeModule === 'telefonia' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Linhas Corporativas</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">142 Ativas</div>
            <span className="text-[11px] text-slate-400">Plano corporativo Vivo Ilimitado</span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Aparelhos em Campo</span>
            <div className="text-xl font-bold font-mono text-blue-600 mt-1">128 Celulares</div>
            <span className="text-[11px] text-slate-400">Samsung Galaxy A55 e S23</span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Chips em Estoque TI</span>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-1">18 Disponíveis</div>
            <span className="text-[11px] text-slate-400">Prontos para ativação de novos colaboradores</span>
          </div>
        </div>
      )}

      {activeModule === 'pagamentos' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Contas Previstas no Mês</span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-1">R$ 142.850,00</div>
            <span className="text-[11px] text-slate-400">Energia, água, taxas e condomínio</span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Liquidadas / Pagas</span>
            <div className="text-xl font-bold font-mono text-emerald-600 mt-1">R$ 98.400,00</div>
            <span className="text-[11px] text-slate-400">Comprovantes anexados</span>
          </div>
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase">Vencendo nos Próximos 5 Dias</span>
            <div className="text-xl font-bold font-mono text-amber-600 mt-1">3 Boletos</div>
            <span className="text-[11px] text-slate-400">Sem pendências atrasadas</span>
          </div>
        </div>
      )}

      {/* Relevant Tickets List for this module */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            Demandas e Chamados de {current.title.split(',')[0]} ({relevantTickets.length})
          </h3>
          <span className="text-xs text-slate-500 font-mono">Filtro por categoria</span>
        </div>

        {relevantTickets.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Nenhum chamado ativo nesta categoria no momento. Clique em &ldquo;Nova Solicitação&rdquo; para registrar.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {relevantTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicketId(t.id)}
                className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-600">{t.ticketNumber}</span>
                    <span className="font-semibold text-slate-900 truncate">{t.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>{t.serviceName}</span>
                    <span>·</span>
                    <span>Solicitante: <strong>{t.requesterName}</strong></span>
                    <span>·</span>
                    <span>{t.location}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                    {t.status.replace('_', ' ')}
                  </span>
                  <span className="text-blue-600 font-semibold text-xs hover:underline">Ver Detalhes</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
