'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  Home,
  LifeBuoy,
  LayoutDashboard,
  CalendarDays,
  Truck,
  Users,
  Wrench,
  ShoppingBag,
  Plane,
  FileText,
  FileCheck2,
  Package,
  Building2,
  HardHat,
  PhoneCall,
  Boxes,
  CreditCard,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, setIsOpenMobile }) => {
  const { activeTab, setActiveTab, tickets, unreadNotificationsCount, resetAllData } = useApp();

  const openTicketsCount = tickets.filter((t) => t.status !== 'concluido' && t.status !== 'cancelado').length;

  const navSections = [
    {
      label: 'Visão Geral',
      items: [
        { id: 'home', label: 'Início', icon: Home },
        { id: 'central', label: 'Central de Serviços', icon: LifeBuoy, badge: openTicketsCount },
        { id: 'dashboard', label: 'Dashboard Executivo', icon: LayoutDashboard },
        { id: 'agendamentos', label: 'Agendamentos', icon: CalendarDays },
      ],
    },
    {
      label: 'Operações & Facilities',
      items: [
        { id: 'logistica', label: 'Logística & Frotas', icon: Truck },
        { id: 'atendimento', label: 'Atendimento & Copa', icon: Users },
        { id: 'manutencao', label: 'Manutenção Predial', icon: Wrench },
        { id: 'telefonia', label: 'Telefonia & Chips', icon: PhoneCall },
        { id: 'viagens', label: 'Viagens & Passagens', icon: Plane },
      ],
    },
    {
      label: 'Suprimentos & Contratos',
      items: [
        { id: 'compras', label: 'Compras Corporativas', icon: ShoppingBag },
        { id: 'estoque', label: 'Estoque & Almoxarifado', icon: Boxes },
        { id: 'contratos', label: 'Contratos Ativos', icon: FileCheck2 },
        { id: 'documentos', label: 'Documentos & GED', icon: FileText },
        { id: 'patrimonio', label: 'Patrimônio & Ativos', icon: Package },
      ],
    },
    {
      label: 'Infraestrutura & Finanças',
      items: [
        { id: 'imoveis', label: 'Imóveis & Aluguéis', icon: Building2 },
        { id: 'obras', label: 'Obras & Nova Sede', icon: HardHat },
        { id: 'pagamentos', label: 'Pagamentos & Contas', icon: CreditCard },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { id: 'admin', label: 'Administração & Perfis', icon: ShieldCheck },
      ],
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm text-base">
              CA
            </div>
            <div>
              <span className="font-semibold text-white tracking-tight text-base block leading-none">
                Central Adm
              </span>
              <span className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5 block">
                Gestão Corporativa
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">
            PROTÓTIPO
          </span>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5 text-sm custom-scrollbar">
          {navSections.map((section) => (
            <div key={section.label}>
              <div className="px-3 mb-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
                {section.label}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full tabular-nums ${
                            isActive
                              ? 'bg-white text-blue-700 font-bold'
                              : 'bg-blue-900 text-blue-200'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/80 shrink-0 space-y-2">
          <button
            onClick={resetAllData}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            title="Restaura os dados fictícios originais"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar dados demo</span>
          </button>
        </div>
      </aside>
    </>
  );
};
