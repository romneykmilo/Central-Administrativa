'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Truck,
  Car,
  Package,
  Plus,
  Clock,
  Phone,
  CheckCircle,
  AlertCircle,
  MapPin,
  Send,
  Navigation,
  Fuel,
  Wrench,
} from 'lucide-react';

export const LogisticsModule: React.FC = () => {
  const { drivers, vehicles, openNewTicketWithPrefill, setActiveTab } = useApp();
  const [activeSub, setActiveSub] = useState<'motoristas' | 'veiculos' | 'correios'>('motoristas');

  // Quick motoboy simulation state
  const [origin, setOrigin] = useState('Sede Paulista - 4º andar');
  const [destination, setDestination] = useState('');
  const [recipient, setRecipient] = useState('');
  const [notes, setNotes] = useState('');

  const handleRequestMotoboy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    openNewTicketWithPrefill({
      title: `Envio Express Motoboy para ${recipient || 'Destinatário'}`,
      description: `Origem: ${origin}\nDestino: ${destination}\nDestinatário: ${recipient}\nObservações: ${notes}`,
      category: 'logistica',
      serviceName: 'Correios e Motoboy',
      priority: 'alta',
      location: destination,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Módulo de Logística & Mobilidade</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestão operacional de motoristas corporativos, frota de veículos e despachos expressos
          </p>
        </div>

        <button
          onClick={() =>
            openNewTicketWithPrefill({
              category: 'logistica',
              serviceName: 'Motorista Executivo',
              priority: 'alta',
            })
          }
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Solicitar Transporte</span>
        </button>
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold pb-1">
        {[
          { id: 'motoristas', label: `Quadro de Motoristas (${drivers.length})`, icon: Truck },
          { id: 'veiculos', label: `Frota Corporativa (${vehicles.length})`, icon: Car },
          { id: 'correios', label: 'Solicitação Rápida / Motoboy & Correios', icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeSub === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSub(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 border-b-2 font-medium transition-colors ${
                isSel
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtab 1: Motoristas */}
      {activeSub === 'motoristas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drivers.map((d) => (
            <div key={d.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{d.name}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">CNH: {d.cnh}</span>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    d.status === 'disponivel'
                      ? 'bg-emerald-100 text-emerald-800'
                      : d.status === 'em_viagem'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {d.status.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Car className="w-3.5 h-3.5 text-slate-400" />
                  <span>{d.assignedVehicle || 'Veículo reserva'}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{d.phone}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-amber-500 font-bold">★ {d.rating.toFixed(1)}</span>
                <button
                  onClick={() =>
                    openNewTicketWithPrefill({
                      title: `Agendamento com Motorista ${d.name}`,
                      category: 'logistica',
                      serviceName: 'Motorista Executivo',
                      description: `Solicitação direta para o motorista ${d.name}.`,
                    })
                  }
                  className="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Agendar este motorista
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 2: Veículos */}
      {activeSub === 'veiculos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{v.model}</h4>
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                    {v.plate}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    v.status === 'disponivel'
                      ? 'bg-emerald-100 text-emerald-800'
                      : v.status === 'em_uso'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {v.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{v.currentKm.toLocaleString('pt-BR')} KM</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-slate-400" />
                  <span>{v.fuelLevel}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Próx. Revisão: {v.nextRevisionKm.toLocaleString('pt-BR')} KM</span>
                <span>Últ. Manut: {v.lastMaintenance}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtab 3: Motoboy & Correios Rápido */}
      {activeSub === 'correios' && (
        <div className="max-w-2xl bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Solicitação Expressa de Motoboy / Malote</h3>
            <p className="text-xs text-slate-500">Despacho de contratos, encomendas e correspondências urgentes</p>
          </div>

          <form onSubmit={handleRequestMotoboy} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Local de Coleta (Origem) *</label>
              <input
                type="text"
                required
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Endereço de Entrega (Destino Completo) *</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ex: Av. Faria Lima, 3477 - 14º andar, Itaim Bibi"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pessoa / Contato Destinatário</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="Ex: Dr. Roberto Alcantara (Jurídico)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Envio</label>
                <select className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800">
                  <option>Motoboy Dedicado (Até 2h)</option>
                  <option>SEDEX Correios</option>
                  <option>Malote Fixo Diário</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Instruções / Retorno de Protocolo</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Exigir assinatura no protocolo; esperar colher rubrica em 3 vias..."
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Solicitar Coleta e Envio</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
