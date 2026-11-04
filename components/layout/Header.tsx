'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Menu,
  Search,
  Bell,
  Plus,
  UserCheck,
  ChevronDown,
  Check,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobile }) => {
  const {
    activeTab,
    setActiveTab,
    currentUser,
    availableUsers,
    switchUserRole,
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    openNewTicketWithPrefill,
    setIsSearchOpen,
    setSelectedTicketId,
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabLabels: Record<string, string> = {
    home: 'Página Inicial',
    central: 'Central de Serviços',
    dashboard: 'Dashboard Executivo',
    agendamentos: 'Agendamento de Recursos',
    logistica: 'Logística & Mobilidade',
    atendimento: 'Atendimento & Facilities',
    manutencao: 'Manutenção Predial',
    telefonia: 'Telefonia & Conectividade',
    viagens: 'Viagens & Deslocamentos',
    compras: 'Compras & Suprimentos',
    estoque: 'Estoque & Almoxarifado',
    contratos: 'Gestão de Contratos',
    documentos: 'Documentos & GED',
    patrimonio: 'Patrimônio & Imobilizado',
    imoveis: 'Gestão de Imóveis',
    obras: 'Obras & Nova Sede',
    pagamentos: 'Pagamentos & Contas',
    admin: 'Administração & Permissões',
  };

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.linkTarget) {
      setActiveTab(notif.linkTarget.tab);
      if (notif.linkTarget.ticketId) {
        setSelectedTicketId(notif.linkTarget.ticketId);
      }
      setIsNotifOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between gap-4">
      {/* Zone 1: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
          aria-label="Abrir Menu Lateral"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs md:text-sm">
          <span className="text-slate-400 hidden sm:inline">Central Adm</span>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-semibold text-slate-800">{tabLabels[activeTab] || 'Visão'}</span>
        </div>
      </div>

      {/* Zone 2: Smart Search Input / Intent trigger */}
      <div className="flex-1 max-w-md hidden md:block">
        <button
          onClick={() => setIsSearchOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 bg-slate-100/80 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs rounded-lg border border-slate-200 transition-colors group cursor-text"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            <span className="text-slate-500 font-normal">Digite o que precisa ou busque (ex: motorista, ar-condicionado)...</span>
          </div>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Zone 3: Actions, Notifications, Role Switcher */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile search icon */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden"
          aria-label="Buscar"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 ring-2 ring-white" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">Notificações</span>
                  {unreadNotificationsCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 font-medium">
                      {unreadNotificationsCount} novas
                    </span>
                  )}
                </div>
                {unreadNotificationsCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Marcar todas lidas
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">Nenhuma notificação no momento.</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                        !n.read ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className={`font-medium ${!n.read ? 'text-slate-900' : 'text-slate-700'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 rounded-lg transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-800 font-semibold text-xs flex items-center justify-center">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 leading-tight">{currentUser.roleLabel}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Simular Perfil de Acesso
                </span>
                <span className="text-xs text-slate-600 block mt-0.5">
                  Troque instantaneamente para testar a experiência de cada tipo de colaborador:
                </span>
              </div>
              <div className="mt-1 space-y-1">
                {availableUsers.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUserRole(u.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 p-2 rounded-md text-left text-xs transition-colors ${
                        isSelected ? 'bg-blue-50 text-blue-900 font-medium' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-500">{u.roleLabel}</div>
                        <div className="text-[10px] text-slate-400 truncate">{u.department}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA: + Novo Chamado */}
        <button
          onClick={() => openNewTicketWithPrefill()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-2xs whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Chamado</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>
    </header>
  );
};
