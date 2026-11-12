'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SchedulingModule } from '@/components/modules/SchedulingModule';
import { ServiceTicketsFilter } from '@/components/modules/ServiceTicketsFilter';
import { Brush, Coffee, ShieldCheck, Package, Send, Users } from 'lucide-react';

type AttendanceService = 'limpeza' | 'garcom' | 'portaria' | 'externos';

export const AtendimentoModule: React.FC = () => {
  const { tickets, openNewTicketWithPrefill, serviceSlaPolicies, setSelectedTicketId } = useApp();
  const [activeSub, setActiveSub] = useState<AttendanceService>('limpeza');
  const [requestDetails, setRequestDetails] = useState('');
  const [location, setLocation] = useState('Sede Administrativa');
  const [requestedDate, setRequestedDate] = useState('');

  const getSlaLabel = (serviceName: string) => {
    const policy = serviceSlaPolicies.find(item => item.serviceName === serviceName && item.active);
    return policy ? `Prazo de atendimento: ${policy.businessDays} ${policy.businessDays === 1 ? 'dia útil' : 'dias úteis'}.` : 'Prazo de atendimento não cadastrado no momento.';
  };

  const requestTicket = (serviceName: string, title: string, guidance: string) => {
    openNewTicketWithPrefill({
      title,
      description: guidance,
      category: 'atendimento',
      serviceName,
      priority: 'media',
      location,
    });
  };

  const serviceTickets = tickets.filter(ticket => ticket.category === 'atendimento' && (
    activeSub === 'limpeza' ? ticket.serviceName === 'Limpeza & Higienização' :
    activeSub === 'garcom' ? ticket.serviceName === 'Copa & Garçom' :
    activeSub === 'portaria' ? ticket.serviceName === 'Solicitações para Portaria' :
    ticket.serviceName === 'Serviços Externos'
  ));

  const tabs = [
    { id: 'limpeza' as const, label: 'Limpeza', icon: Brush },
    { id: 'garcom' as const, label: 'Garçom', icon: Coffee },
    { id: 'portaria' as const, label: 'Portaria', icon: ShieldCheck },
    { id: 'externos' as const, label: 'Serviços Externos', icon: Package },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <Users className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Atendimento</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">Limpeza, copa, portaria e serviços externos. Selecione o atendimento para consultar as orientações e fazer sua solicitação.</p>
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const selected = activeSub === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveSub(tab.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition-colors ${selected ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {activeSub === 'limpeza' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900">
            Utilize o calendário para solicitar uma equipe de limpeza. Informe local, data e período de atendimento. A solicitação ficará pendente até aprovação da gestão; conflitos de equipe são verificados automaticamente. {getSlaLabel('Limpeza & Higienização')}
          </div>
          <ServiceTicketsFilter tickets={serviceTickets} onSelectTicket={setSelectedTicketId} title="Chamados de Limpeza" />
          <SchedulingModule embeddedResourceType="limpeza" hideAppointmentsFilter />
        </div>
      )}

      {activeSub === 'garcom' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900">
            Solicite o atendimento de garçom para reuniões e eventos. Informe sala, data, horário e modalidade do serviço (montado ou volante). O pedido ficará pendente até aprovação e o sistema verificará a disponibilidade. {getSlaLabel('Copa & Garçom')}
          </div>
          <ServiceTicketsFilter tickets={serviceTickets} onSelectTicket={setSelectedTicketId} title="Chamados de Garçom" />
          <SchedulingModule embeddedResourceType="garcom" hideAppointmentsFilter />
        </div>
      )}

      {activeSub === 'portaria' && (
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Solicitações para Portaria</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">Utilize este canal para comunicar necessidades de apoio da portaria, controle de acesso, recebimento ou liberação de visitantes e prestadores, orientações de entrada e outras demandas relacionadas ao atendimento na recepção.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">Local / unidade
              <input value={location} onChange={e => setLocation(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal" />
            </label>
            <label className="text-xs font-semibold text-slate-700">Data desejada
              <input type="date" value={requestedDate} onChange={e => setRequestedDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal" />
            </label>
          </div>
          <label className="mt-3 block text-xs font-semibold text-slate-700">Detalhes da solicitação *
            <textarea required rows={4} value={requestDetails} onChange={e => setRequestDetails(e.target.value)} placeholder="Informe pessoas envolvidas, empresa, finalidade, horários e orientações de acesso." className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal" />
          </label>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">{getSlaLabel('Solicitações para Portaria')}</span>
            <button onClick={() => requestTicket('Solicitações para Portaria', 'Solicitação de apoio da portaria', `Local: ${location}\nData desejada: ${requestedDate || 'A definir'}\nDetalhes: ${requestDetails}`)} disabled={!requestDetails.trim()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              Enviar solicitação <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {activeSub === 'externos' && (
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <Package className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Solicitar serviços externos</h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">Use esta opção para demandas administrativas que dependam de atendimento fora das instalações, como entregas, retiradas, protocolos, diligências e outras atividades externas.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-slate-700">Local / unidade de referência
              <input value={location} onChange={e => setLocation(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal" />
            </label>
            <label className="text-xs font-semibold text-slate-700">Data desejada
              <input type="date" value={requestedDate} onChange={e => setRequestedDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal" />
            </label>
          </div>
          <label className="mt-3 block text-xs font-semibold text-slate-700">Descrição da atividade e orientações *
            <textarea required rows={4} value={requestDetails} onChange={e => setRequestDetails(e.target.value)} placeholder="Descreva a atividade, endereço, contatos, documentos ou materiais envolvidos e prazo necessário." className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal" />
          </label>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500">{getSlaLabel('Serviços Externos')}</span>
            <button onClick={() => requestTicket('Serviços Externos', 'Solicitação de serviço externo', `Local de referência: ${location}\nData desejada: ${requestedDate || 'A definir'}\nDescrição: ${requestDetails}`)} disabled={!requestDetails.trim()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              Enviar solicitação <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {(activeSub === 'portaria' || activeSub === 'externos') && (
        <ServiceTicketsFilter
          tickets={serviceTickets}
          onSelectTicket={setSelectedTicketId}
          title={`Chamados de ${tabs.find(tab => tab.id === activeSub)?.label || 'Atendimento'}`}
        />
      )}
    </div>
  );
};
