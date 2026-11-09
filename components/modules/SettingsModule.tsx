'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Clock, Save, ToggleLeft, ToggleRight, History, ShieldAlert } from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const { currentUser, serviceSlaPolicies, serviceSlaHistory, updateServiceSlaPolicy } = useApp();
  const [draftDays, setDraftDays] = useState<Record<string, string>>({});
  const canManage = currentUser.role === 'admin' || currentUser.role === 'manager';

  if (!canManage) {
    return <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Acesso restrito a gestores.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Configurações</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">Cadastro e controle dos prazos de atendimento por serviço.</p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900">
        <div className="flex items-center gap-2 font-semibold"><Clock className="h-4 w-4" /> Regra de contagem do SLA</div>
        <p className="mt-1">Dias úteis, de segunda a sexta-feira, das 08h às 18h, excluindo feriados nacionais e municipais de Belo Horizonte. Cada dia útil equivale a 10 horas de expediente.</p>
        <p className="mt-2 font-semibold">Alterações valem somente para novos chamados. Chamados já abertos mantêm o prazo registrado na abertura.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Prazos por serviço</h2>
          <p className="mt-0.5 text-xs text-slate-500">Edite o prazo em dias úteis ou desative serviços temporariamente para novas solicitações.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead><tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <th className="px-4 py-3">Módulo</th><th className="px-4 py-3">Serviço</th><th className="px-4 py-3 text-center">Prazo (dias úteis)</th><th className="px-4 py-3 text-center">Disponibilidade</th><th className="px-4 py-3 text-right">Ação</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {serviceSlaPolicies.map((policy) => {
                const draft = draftDays[policy.serviceName] ?? String(policy.businessDays);
                const changed = Number(draft) !== policy.businessDays;
                return (
                  <tr key={policy.serviceName} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-slate-500">{policy.category}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{policy.serviceName}</td>
                    <td className="px-4 py-3 text-center">
                      <input
                        aria-label={`Prazo em dias úteis para ${policy.serviceName}`}
                        type="number" min="1" max="365" step="1"
                        value={draft}
                        onChange={(event) => setDraftDays((prev) => ({ ...prev, [policy.serviceName]: event.target.value }))}
                        className="w-24 rounded-md border border-slate-300 px-2 py-1.5 text-center text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${policy.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{policy.active ? 'Ativo' : 'Inativo'}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateServiceSlaPolicy(policy.serviceName, { active: !policy.active })}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                          title={policy.active ? 'Desativar serviço' : 'Ativar serviço'}
                        >
                          {policy.active ? <ToggleRight className="h-4 w-4 text-emerald-600" /> : <ToggleLeft className="h-4 w-4" />}
                          {policy.active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          disabled={!changed || !Number.isInteger(Number(draft)) || Number(draft) < 1 || Number(draft) > 365}
                          onClick={() => {
                            updateServiceSlaPolicy(policy.serviceName, { businessDays: Number(draft) });
                            setDraftDays((prev) => ({ ...prev, [policy.serviceName]: String(Number(draft)) }));
                          }}
                          className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          <Save className="h-3 w-3" /> Salvar
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <History className="h-4 w-4 text-slate-500" />
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Histórico de alterações</h2>
            <p className="text-xs text-slate-500">Registro local das alterações feitas neste protótipo.</p>
          </div>
        </div>
        {serviceSlaHistory.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-slate-500">Nenhuma alteração registrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead><tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Data e hora</th><th className="px-4 py-3">Serviço</th><th className="px-4 py-3">Alteração</th><th className="px-4 py-3">Responsável</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-100">
                {serviceSlaHistory.slice(0, 30).map((change) => (
                  <tr key={change.id}>
                    <td className="whitespace-nowrap px-4 py-2.5 text-slate-500">{new Date(change.changedAt).toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-800">{change.serviceName}</td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {change.previousBusinessDays} → {change.newBusinessDays} dias úteis
                      {change.previousActive !== change.newActive && <span className="ml-1">· {change.newActive ? 'Ativado' : 'Desativado'}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">{change.changedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Como a aplicação ainda utiliza perfis simulados e armazenamento no navegador, este histórico é local e demonstrativo. Para auditoria corporativa e controle entre usuários, será necessário migrar essas informações para o banco de dados com autenticação real.</p>
      </div>
    </div>
  );
};
