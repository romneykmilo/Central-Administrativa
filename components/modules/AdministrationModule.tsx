'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SERVICE_SLA_POLICIES } from '@/lib/mock-data';
import {
  ShieldCheck,
  Users,
  Settings,
  Clock,
  Layers,
  CheckCircle,
  KeyRound,
  RotateCcw,
  Sparkles,
  Lock,
} from 'lucide-react';

export const AdministrationModule: React.FC = () => {
  const { availableUsers, currentUser, switchUserRole, resetAllData } = useApp();

  const [activeTab, setActiveTab] = useState<'usuarios' | 'permissoes' | 'sla' | 'auth'>('usuarios');

  const permissionsMatrix = [
    { feature: 'Abrir Chamados e Solicitar Serviços', requester: true, attendant: true, manager: true, admin: true },
    { feature: 'Acompanhar Chamados Próprios', requester: true, attendant: true, manager: true, admin: true },
    { feature: 'Atender Chamados e Alterar Status', requester: false, attendant: true, manager: true, admin: true },
    { feature: 'Inserir Comentários Internos', requester: false, attendant: true, manager: true, admin: true },
    { feature: 'Aprovar Compras e Pagamentos', requester: false, attendant: false, manager: true, admin: true },
    { feature: 'Acessar Dashboard Executivo', requester: false, attendant: true, manager: true, admin: true },
    { feature: 'Cadastrar e Alterar Contratos / GED', requester: false, attendant: true, manager: true, admin: true },
    { feature: 'Configuração de Usuários e Permissões', requester: false, attendant: false, manager: false, admin: true },
    { feature: 'Parametrização de Políticas de SLA', requester: false, attendant: false, manager: false, admin: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Administração do Sistema & Perfis
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Controle de perfis de acesso (RBAC), matriz de permissões, políticas de SLA e simulação de autenticação
          </p>
        </div>

        <button
          onClick={resetAllData}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors shadow-2xs self-start"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Restaurar Mocks Originais</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 text-xs font-semibold">
        {[
          { id: 'usuarios', label: 'Usuários Cadastrados', icon: Users },
          { id: 'permissoes', label: 'Matriz de Permissões (RBAC)', icon: ShieldCheck },
          { id: 'sla', label: 'Políticas e Prazos de SLA', icon: Clock },
          { id: 'auth', label: 'Arquitetura de Autenticação', icon: KeyRound },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSel = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
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

      {/* USUÁRIOS TAB */}
      {activeTab === 'usuarios' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-between">
            <div>
              <strong>Demonstração de Perfis:</strong> Você pode alternar instantaneamente entre os 4 colaboradores para testar suas visões e permissões no sistema.
            </div>
            <span className="font-mono text-[11px] font-semibold text-blue-800">
              Usuário ativo: {currentUser.name}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {availableUsers.map((u) => {
              const isCurrent = u.id === currentUser.id;
              return (
                <div
                  key={u.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-50/40 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold text-sm flex items-center justify-center">
                      {u.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'manager'
                          ? 'bg-indigo-100 text-indigo-800'
                          : u.role === 'attendant'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  <h4 className="font-semibold text-slate-900 text-sm">{u.name}</h4>
                  <div className="text-xs text-blue-600 font-medium">{u.roleLabel}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{u.department}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">{u.email}</div>

                  <button
                    onClick={() => switchUserRole(u.id)}
                    className={`w-full mt-4 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-blue-600 text-white cursor-default'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isCurrent ? '✓ Perfil Ativo' : 'Mudar para este Perfil'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PERMISSÕES TAB */}
      {activeTab === 'permissoes' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Funcionalidade / Operação</th>
                  <th className="py-3 px-4 text-center">Solicitante (Colaborador)</th>
                  <th className="py-3 px-4 text-center">Atendente (Administrativo)</th>
                  <th className="py-3 px-4 text-center">Gestor de Área</th>
                  <th className="py-3 px-4 text-center">Administrador Geral</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionsMatrix.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-medium text-slate-800">{item.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {item.requester ? <CheckCircle className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.attendant ? <CheckCircle className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.manager ? <CheckCircle className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.admin ? <CheckCircle className="w-4 h-4 text-emerald-600 inline" /> : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SLA TAB */}
      {activeTab === 'sla' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900">
            <div className="font-semibold">Regra de contagem dos prazos</div>
            <p className="mt-1">Segunda a sexta-feira, das 08h às 18h, excluindo feriados nacionais e feriados municipais de Belo Horizonte. Cada dia útil corresponde a 10 horas de expediente.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Prazos de atendimento por serviço</h3>
              <p className="text-xs text-slate-500 mt-0.5">Prazos definidos para os 29 serviços disponíveis aos solicitantes.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead><tr className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="px-4 py-3">Módulo</th><th className="px-4 py-3">Serviço</th><th className="px-4 py-3 text-right">Prazo</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {SERVICE_SLA_POLICIES.map((policy) => (
                    <tr key={policy.serviceName}>
                      <td className="px-4 py-2.5 text-slate-500">{policy.category}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{policy.serviceName}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{policy.businessDays} {policy.businessDays === 1 ? 'dia útil' : 'dias úteis'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* AUTH ARCHITECTURE PREPARATION TAB */}
      {activeTab === 'auth' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Arquitetura de Autenticação Corporativa</h3>
            <p className="text-slate-500 mt-0.5">
              Pronta para futura ativação de SSO Google Workspace, SAML / Azure AD ou E-mail e Senha corporativos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-800 block text-sm">Google Workspace SSO</span>
              <p className="text-slate-600 text-xs">
                Login 1-click integrado ao domínio corporativo (@empresa.com.br) com permissão delegada.
              </p>
              <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold inline-block">
                Arquitetura Preparada
              </span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-800 block text-sm">E-mail e Senha + MFA</span>
              <p className="text-slate-600 text-xs">
                Cadastro manual com senha forte, recuperação segura de senha via token e autenticação de dois fatores.
              </p>
              <span className="text-[10px] font-mono uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold inline-block">
                Arquitetura Preparada
              </span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <span className="font-semibold text-slate-800 block text-sm">Matriz de Perfis (RBAC)</span>
              <p className="text-slate-600 text-xs">
                Controle granular de acesso por papel: Solicitante, Atendente, Gestor e Administrador Geral.
              </p>
              <span className="text-[10px] font-mono uppercase bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold inline-block">
                Operante no Protótipo
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
