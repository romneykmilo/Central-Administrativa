'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SchedulingModule } from '@/components/modules/SchedulingModule';
import { Truck, Car, Package, Send, MapPin, ArrowRightLeft, Boxes, Mail, ClipboardList } from 'lucide-react';

type LogisticsService = 'motorista' | 'locacao' | 'correios' | 'cargas' | 'malote';

export const LogisticsModule: React.FC = () => {
  const { vehicles, openNewTicketWithPrefill } = useApp();
  const [activeSub, setActiveSub] = useState<LogisticsService>('motorista');
  const [origin, setOrigin] = useState('Sede Administrativa');
  const [destination, setDestination] = useState('');
  const [recipient, setRecipient] = useState('');
  const [deliveryType, setDeliveryType] = useState('Motoboy dedicado');
  const [notes, setNotes] = useState('');

  const requestTicket = (serviceName: string, title: string, guidance: string) => {
    openNewTicketWithPrefill({
      title,
      description: guidance,
      category: 'logistica',
      serviceName,
      priority: 'media',
    });
  };

  const handleRequestMotoboy = (event: React.FormEvent) => {
    event.preventDefault();
    if (!destination.trim()) return;
    openNewTicketWithPrefill({
      title: `Envio / coleta: ${destination}`,
      description: `Tipo de envio: ${deliveryType}\nOrigem: ${origin}\nDestino: ${destination}\nDestinatário / contato: ${recipient || 'Não informado'}\nOrientações: ${notes || 'Não informado'}`,
      category: 'logistica',
      serviceName: 'Correios & Motoboy',
      priority: 'media',
      location: destination,
    });
  };

  const tabs = [
    { id: 'motorista' as const, label: 'Agendamento de Motorista', icon: Truck },
    { id: 'locacao' as const, label: 'Locação de Veículos', icon: Car },
    { id: 'correios' as const, label: 'Correios & Motoboy', icon: Package },
    { id: 'cargas' as const, label: 'Transporte de Cargas', icon: Boxes },
    { id: 'malote' as const, label: 'Malote Corporativo', icon: Mail },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Logística e Frotas</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">Selecione o serviço desejado para consultar as orientações e registrar sua solicitação.</p>
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

      {activeSub === 'motorista' && (
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900">
            Consulte o calendário, escolha o período e envie o pedido de transporte. A solicitação ficará pendente até a aprovação da gestão.
          </div>
          <SchedulingModule embeddedDriverOnly />
        </div>
      )}

      {activeSub === 'locacao' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-start gap-3">
              <Car className="mt-0.5 h-5 w-5 text-blue-600" />
              <div><h2 className="text-sm font-semibold text-slate-900">Solicitar locação de veículo</h2>
                <p className="mt-1 text-xs leading-5 text-slate-600">Utilize este serviço quando houver necessidade de veículo alugado para atividade institucional, deslocamento ou demanda temporária. Informe período, quantidade de passageiros, tipo de veículo, destino e justificativa.</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Informações necessárias</p>
              <ul className="mt-2 list-disc space-y-1 pl-5"><li>Data e horário de retirada e devolução</li><li>Local de retirada e devolução</li><li>Categoria do veículo e quantidade de passageiros</li><li>Destino, período de utilização e justificativa</li></ul>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">Prazo de atendimento cadastrado: 4 dias úteis.</span>
              <button onClick={() => requestTicket('Locação de Veículos','Solicitação de locação de veículo','Informe: período de utilização (retirada e devolução), local de retirada/devolução, categoria do veículo, quantidade de passageiros, destino e justificativa da locação.')}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700">Solicitar locação <Send className="h-4 w-4" /></button>
            </div>
          </div>
          {vehicles.length > 0 && <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-xs font-semibold text-slate-800">Frota própria cadastrada</h3>
            <p className="mt-1 text-[11px] text-slate-500">A locação é uma solicitação separada e será analisada pela equipe responsável.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{vehicles.map(vehicle => <div key={vehicle.id} className="rounded-lg border border-slate-100 p-3 text-xs"><p className="font-semibold text-slate-800">{vehicle.model}</p><p className="mt-1 text-slate-500">{vehicle.plate} · {vehicle.status.replace('_',' ')}</p></div>)}</div>
          </div>}
        </div>
      )}

      {activeSub === 'correios' && (
        <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3"><Package className="mt-0.5 h-5 w-5 text-blue-600" /><div><h2 className="text-sm font-semibold text-slate-900">Solicitar coleta ou envio</h2><p className="mt-1 text-xs text-slate-500">Para correspondências, documentos, encomendas e entregas externas.</p></div></div>
          <form onSubmit={handleRequestMotoboy} className="mt-4 space-y-3 text-xs">
            <label className="block font-semibold text-slate-700">Tipo de envio *<select required value={deliveryType} onChange={e=>setDeliveryType(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 font-normal"><option>Motoboy dedicado</option><option>Correios - SEDEX</option><option>Correios - PAC</option><option>Malote fixo</option></select></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="font-semibold text-slate-700">Local de coleta *<input required value={origin} onChange={e=>setOrigin(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal"/></label>
              <label className="font-semibold text-slate-700">Endereço de entrega *<input required value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Endereço completo" className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal"/></label>
            </div>
            <label className="block font-semibold text-slate-700">Destinatário / contato<input value={recipient} onChange={e=>setRecipient(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal"/></label>
            <label className="block font-semibold text-slate-700">Orientações e observações<textarea rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Descreva o conteúdo, prazo, necessidade de protocolo ou assinatura." className="mt-1 w-full rounded-lg border border-slate-300 p-2.5 font-normal"/></label>
            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700"><Send className="h-4 w-4"/> Enviar solicitação</button>
          </form>
        </div>
      )}

      {activeSub === 'cargas' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3"><Boxes className="mt-0.5 h-5 w-5 text-blue-600"/><div><h2 className="text-sm font-semibold text-slate-900">Solicitar transporte de cargas</h2><p className="mt-1 text-xs leading-5 text-slate-600">Para movimentação de materiais, mobiliário, equipamentos, documentos em volume ou outros itens que exijam transporte dedicado.</p></div></div>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600"><p className="font-semibold text-slate-700">Antes de solicitar, reúna:</p><ul className="mt-2 list-disc space-y-1 pl-5"><li>Descrição, quantidade e dimensões aproximadas dos itens</li><li>Endereço de origem e destino</li><li>Data desejada e necessidade de ajudantes</li><li>Condições de acesso, carga e descarga</li></ul></div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-[11px] text-slate-500">Prazo de atendimento cadastrado: 4 dias úteis.</span><button onClick={()=>requestTicket('Transporte de Cargas','Solicitação de transporte de cargas','Informe descrição dos itens, quantidade, dimensões e peso aproximados, endereço de origem e destino, data desejada, necessidade de ajudantes e condições de carga/descarga.')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700">Solicitar transporte <Send className="h-4 w-4"/></button></div>
        </div>
      )}

      {activeSub === 'malote' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3"><Mail className="mt-0.5 h-5 w-5 text-blue-600"/><div><h2 className="text-sm font-semibold text-slate-900">Solicitar envio por malote corporativo</h2><p className="mt-1 text-xs leading-5 text-slate-600">Para circulação programada de documentos e pequenos volumes entre unidades, departamentos ou endereços atendidos pelo serviço de malote.</p></div></div>
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-600"><p className="font-semibold text-slate-700">Informações necessárias</p><ul className="mt-2 list-disc space-y-1 pl-5"><li>Unidade ou setor de origem e destino</li><li>Nome do destinatário e contato</li><li>Descrição e quantidade de volumes</li><li>Data desejada e observações de entrega</li></ul></div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><span className="text-[11px] text-slate-500">Prazo de atendimento cadastrado: 2 dias úteis.</span><button onClick={()=>requestTicket('Malote Corporativo','Solicitação de malote corporativo','Informe unidade/setor de origem e destino, destinatário e contato, descrição e quantidade de volumes, data desejada e orientações especiais de entrega.')} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700">Solicitar malote <Send className="h-4 w-4"/></button></div>
        </div>
      )}
    </div>
  );
};
