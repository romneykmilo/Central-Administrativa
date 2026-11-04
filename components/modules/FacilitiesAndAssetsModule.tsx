'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Package,
  Building2,
  HardHat,
  Plus,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

interface Props {
  initialTab?: 'patrimonio' | 'imoveis' | 'obras';
}

export const FacilitiesAndAssetsModule: React.FC<Props> = ({ initialTab = 'patrimonio' }) => {
  const { assets, realEstate, works, openNewTicketWithPrefill } = useApp();
  const [activeTab, setActiveTab] = useState<'patrimonio' | 'imoveis' | 'obras'>(initialTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {activeTab === 'patrimonio'
              ? 'Patrimônio & Gestão de Ativos'
              : activeTab === 'imoveis'
              ? 'Gestão de Imóveis & Sedes'
              : 'Obras, Reformas & Nova Sede'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Acompanhamento de infraestrutura predial, controle de tombamento e projetos corporativos
          </p>
        </div>

        <button
          onClick={() =>
            openNewTicketWithPrefill({
              category: activeTab === 'patrimonio' ? 'patrimonio' : activeTab === 'imoveis' ? 'imoveis' : 'obras',
              serviceName:
                activeTab === 'patrimonio'
                  ? 'Transferência / Tombamento'
                  : activeTab === 'imoveis'
                  ? 'Vistoria Predial'
                  : 'Reforma / Obras',
            })
          }
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>
            {activeTab === 'patrimonio'
              ? 'Registrar Demanda de Patrimônio'
              : activeTab === 'imoveis'
              ? 'Solicitar Manutenção de Imóvel'
              : 'Nova Demanda de Obra'}
          </span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('patrimonio')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'patrimonio'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Bens Patrimoniais ({assets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('imoveis')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'imoveis'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Imóveis & Sedes ({realEstate.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('obras')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'obras'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HardHat className="w-4 h-4" />
          <span>Obras & Nova Sede ({works.length})</span>
        </button>
      </div>

      {/* PATRIMÔNIO TAB */}
      {activeTab === 'patrimonio' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Plaqueta / Tombamento</th>
                  <th className="py-3 px-4">Item & Modelo</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Localização</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4">Valor Aquisição</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600 whitespace-nowrap">
                      {item.tagNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.brandModel}</div>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600">{item.category}</td>
                    <td className="py-3 px-4 text-slate-700">{item.location}</td>
                    <td className="py-3 px-4 text-slate-600">{item.responsibleName}</td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      R$ {item.acquisitionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          item.status === 'em_uso'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'em_manutencao'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* IMÓVEIS TAB */}
      {activeTab === 'imoveis' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {realEstate.map((r) => (
            <div key={r.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{r.name}</h4>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {r.type === 'proprio' ? 'Prédio Próprio' : 'Imóvel Alugado'}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    r.occupancyStatus === 'ocupado'
                      ? 'bg-emerald-100 text-emerald-800'
                      : r.occupancyStatus === 'parcial'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {r.occupancyStatus}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{r.address} ({r.city})</span>
                </div>
                <div>Área construída: <strong className="font-mono">{r.areaM2.toLocaleString('pt-BR')} m²</strong></div>
                <div>Titular/Locador: <span className="text-slate-800 font-medium">{r.tenantOrOwner}</span></div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Custo Mensal / Aluguel</span>
                  <span className="font-mono font-bold text-slate-900">
                    R$ {r.monthlyRentOrCost.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Seguro Vence</span>
                  <span className="font-mono text-slate-600 text-[11px]">{r.insuranceExpires}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OBRAS TAB */}
      {activeTab === 'obras' && (
        <div className="space-y-4">
          {works.map((w) => (
            <div key={w.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 text-base">{w.title}</h3>
                    <span className="text-[10px] font-mono uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">
                      {w.type.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    Construtora / Empreiteira: <strong>{w.contractor}</strong>
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-mono">
                    Período: {w.startDate} até {w.targetEndDate}
                  </span>
                  <span className="text-xs font-bold text-blue-600 font-mono">
                    Progresso Geral: {w.progressPercent}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${w.progressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Etapa em Andamento</span>
                  <span className="font-medium text-slate-800">{w.currentStage}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Orçamento Total Previsto</span>
                  <span className="font-mono font-bold text-slate-900">
                    R$ {w.budget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Medições Pagas / Realizadas</span>
                  <span className="font-mono font-bold text-emerald-700">
                    R$ {w.spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
