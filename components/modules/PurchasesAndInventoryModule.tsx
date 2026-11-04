'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShoppingBag,
  Boxes,
  Plus,
  Minus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  Package,
} from 'lucide-react';

interface Props {
  initialTab?: 'compras' | 'estoque';
}

export const PurchasesAndInventoryModule: React.FC<Props> = ({ initialTab = 'compras' }) => {
  const {
    purchaseRequests,
    inventory,
    approvePurchaseRequest,
    rejectPurchaseRequest,
    updateInventoryStock,
    currentUser,
    openNewTicketWithPrefill,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'compras' | 'estoque'>(initialTab);
  const [stockDelta, setStockDelta] = useState<Record<string, number>>({});

  const canApprove = currentUser.role === 'admin' || currentUser.role === 'manager';

  const handleStockAction = (id: string, delta: number, type: 'entrada' | 'saida') => {
    updateInventoryStock(id, delta, type);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {activeTab === 'compras' ? 'Compras Corporativas & Suprimentos' : 'Estoque & Almoxarifado'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Fluxo de requisições, aprovações financeiras e controle de saldo com estoque mínimo
          </p>
        </div>

        <button
          onClick={() =>
            openNewTicketWithPrefill({
              category: activeTab === 'compras' ? 'compras' : 'estoque',
              serviceName: activeTab === 'compras' ? 'Compras Corporativas' : 'Reposição de Almoxarifado',
            })
          }
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'compras' ? 'Nova Solicitação de Compra' : 'Solicitar Material'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('compras')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'compras'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Solicitações de Compra ({purchaseRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('estoque')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
            activeTab === 'estoque'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Almoxarifado & Estoque ({inventory.length} itens)</span>
        </button>
      </div>

      {/* PURCHASES VIEW */}
      {activeTab === 'compras' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchaseRequests.map((req) => {
              const isPending = req.status === 'aguardando_aprovacao';
              const isApproved = req.status === 'aprovado';
              const isRejected = req.status === 'rejeitado';

              return (
                <div key={req.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600">{req.requestNumber}</span>
                      <h4 className="font-semibold text-slate-900 text-sm mt-0.5 line-clamp-1">{req.title}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {req.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{req.justification}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Valor Estimado</span>
                      <span className="font-mono font-bold text-slate-900">
                        R$ {req.estimatedValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Solicitante</span>
                      <span className="text-slate-700 font-medium">{req.requesterName}</span>
                    </div>
                  </div>

                  {/* Manager Approval Actions */}
                  {isPending && canApprove && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => approvePurchaseRequest(req.id)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md transition-colors flex items-center justify-center gap-1 shadow-2xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Aprovar Compra</span>
                      </button>
                      <button
                        onClick={() => rejectPurchaseRequest(req.id)}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 text-xs font-semibold rounded-md transition-colors"
                      >
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INVENTORY VIEW */}
      {activeTab === 'estoque' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Código SKU</th>
                  <th className="py-3 px-4">Item & Descrição</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Saldo Atual</th>
                  <th className="py-3 px-4">Estoque Mínimo</th>
                  <th className="py-3 px-4">Localização</th>
                  <th className="py-3 px-4 text-right">Movimentação Rápida</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventory.map((item) => {
                  const isBelowMin = item.currentStock <= item.minStock;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-600 whitespace-nowrap">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {item.name}
                        {isBelowMin && (
                          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-mono text-red-600 font-bold bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                            <AlertTriangle className="w-3 h-3" />
                            Abaixo do Mínimo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize text-slate-600">{item.category}</td>
                      <td className="py-3 px-4 font-mono font-bold text-sm">
                        <span className={isBelowMin ? 'text-red-600' : 'text-slate-900'}>
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{item.location}</td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleStockAction(item.id, 5, 'saida')}
                            disabled={item.currentStock <= 0}
                            title="Registrar saída (-5)"
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded disabled:opacity-30 border border-slate-200"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleStockAction(item.id, 10, 'entrada')}
                            title="Registrar reposição (+10)"
                            className="p-1 hover:bg-blue-100 text-blue-600 rounded border border-slate-200"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
