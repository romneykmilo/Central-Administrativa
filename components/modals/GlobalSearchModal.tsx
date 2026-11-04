'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { parseUserIntent } from '@/lib/intent-engine';
import {
  Search,
  X,
  ArrowRight,
  LifeBuoy,
  FileText,
  Calendar,
  Truck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    openNewTicketWithPrefill,
    setActiveTab,
    tickets,
    contracts,
    suppliers,
    setSelectedTicketId,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  const handleClose = () => {
    setQuery('');
    setIsSearchOpen(false);
  };

  // Global hotkey Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const intent = parseUserIntent(query);

  const matchedTickets = query.trim().length > 1
    ? tickets.filter(
        (t) =>
          t.ticketNumber.toLowerCase().includes(query.toLowerCase()) ||
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          t.serviceName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 4)
    : [];

  const matchedContracts = query.trim().length > 1
    ? contracts.filter(
        (c) =>
          c.contractNumber.toLowerCase().includes(query.toLowerCase()) ||
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.supplierName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const handleApplyIntent = () => {
    if (!intent) return;
    setIsSearchOpen(false);
    if (intent.prefill) {
      openNewTicketWithPrefill(intent.prefill);
    } else {
      setActiveTab(intent.navigationTarget.tab);
    }
  };

  const handleNavigateDirect = (tab: string) => {
    setIsSearchOpen(false);
    setActiveTab(tab);
  };

  const examplePrompts = [
    'Preciso de um motorista amanhã às 14h',
    'Ar-condicionado parou de funcionar na sala 03',
    'Quero agendar um garçom para evento',
    'Solicitar material de escritório e café',
    'Consultar contrato da limpeza terceirizada',
    'Enviar malote com documentos via motoboy',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o que você precisa em linguagem natural..."
            className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Content Area */}
        <div className="max-h-[68vh] overflow-y-auto p-4 space-y-4">
          {/* Intent recognition box */}
          {intent && query.trim().length > 2 && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-lg">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Intenção Identificada</span>
                <span className="text-[10px] font-mono uppercase bg-blue-200 text-blue-800 px-1.5 py-0.2 rounded">
                  {intent.category}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1">{intent.explanation}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleApplyIntent}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  <span>{intent.suggestedActionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleNavigateDirect(intent.navigationTarget.tab)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium rounded-md transition-colors"
                >
                  Abrir Módulo de {intent.title}
                </button>
              </div>
            </div>
          )}

          {/* Matched Tickets */}
          {matchedTickets.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Chamados Encontrados ({matchedTickets.length})
              </div>
              <div className="space-y-1.5">
                {matchedTickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setActiveTab('central');
                      setSelectedTicketId(t.id);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600">{t.ticketNumber}</span>
                        <span className="font-medium text-slate-900 truncate">{t.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {t.serviceName} · Solicitante: {t.requesterName}
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {t.status.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Contracts */}
          {matchedContracts.length > 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Contratos Correspondentes ({matchedContracts.length})
              </div>
              <div className="space-y-1.5">
                {matchedContracts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setIsSearchOpen(false);
                      setActiveTab('contratos');
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-slate-700">{c.contractNumber}</span>
                        <span className="font-medium text-slate-900 truncate">{c.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {c.supplierName} · R$ {c.monthlyValue.toLocaleString('pt-BR')}/mês
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {c.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Examples list if query is empty */}
          {query.trim().length === 0 && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Exemplos de Busca e Comandos Naturais
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {examplePrompts.map((example) => (
                  <button
                    key={example}
                    onClick={() => setQuery(example)}
                    className="text-left p-2 rounded-lg hover:bg-slate-50 border border-slate-100 text-xs text-slate-700 hover:text-blue-600 transition-colors"
                  >
                    &ldquo;{example}&rdquo;
                  </button>
                ))}
              </div>

              {/* Quick links to primary modules */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Atalhos Rápidos de Acesso
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Meus Chamados', tab: 'central' },
                    { label: 'Dashboard de Indicadores', tab: 'dashboard' },
                    { label: 'Agendar Motorista', tab: 'logistica' },
                    { label: 'Agendar Garçom / Sala', tab: 'agendamentos' },
                    { label: 'Estoque & Almoxarifado', tab: 'estoque' },
                    { label: 'Contratos Vigentes', tab: 'contratos' },
                    { label: 'Obras & Nova Sede', tab: 'obras' },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleNavigateDirect(item.tab)}
                      className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
