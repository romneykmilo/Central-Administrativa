'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TicketStatus, TicketPriority } from '@/types';
import { getBusinessMinutesBetween } from '@/lib/mock-data';
import {
  X,
  Clock,
  User,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Paperclip,
  Send,
  MessageSquare,
  History,
  Shield,
  Tag,
  ArrowRight,
} from 'lucide-react';

export const TicketDetailModal: React.FC = () => {
  const {
    selectedTicket,
    setSelectedTicketId,
    updateTicketStatus,
    addTicketComment,
    assignTicket,
    currentUser,
    availableUsers,
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [nowTimestamp] = useState(() => Date.now());

  if (!selectedTicket) return null;

  // Para chamados novos, o acompanhamento considera apenas o horário útil.
  const now = new Date(nowTimestamp);
  const createdAt = new Date(selectedTicket.createdAt);
  const deadlineAt = selectedTicket.slaDeadline ? new Date(selectedTicket.slaDeadline) : new Date(Number.NaN);
  const usesBusinessCalendar = Boolean(selectedTicket.slaBusinessDays);
  const totalDuration = usesBusinessCalendar ? (selectedTicket.slaBusinessDays || 0) * 600 : (deadlineAt.getTime()-createdAt.getTime())/60000;
  const elapsed = usesBusinessCalendar ? getBusinessMinutesBetween(createdAt,now) : (now.getTime()-createdAt.getTime())/60000;
  const remaining = usesBusinessCalendar ? getBusinessMinutesBetween(now,deadlineAt) : (deadlineAt.getTime()-now.getTime())/60000;
  let slaStatus: 'ok' | 'warning' | 'breached' | 'completed' = 'ok';
  let slaRemainingLabel = '';
  let slaPercent = 0;
  if (selectedTicket.status === 'concluido') {
    slaStatus = 'completed'; slaRemainingLabel = 'Concluído no prazo'; slaPercent = 100;
  } else if (selectedTicket.status === 'cancelado') {
    slaStatus = 'completed'; slaRemainingLabel = 'Chamado cancelado'; slaPercent = 0;
  } else if (!selectedTicket.slaDeadline) {
    slaStatus = 'ok'; slaRemainingLabel = 'SLA não cadastrado'; slaPercent = 0;
  } else if (remaining < 0) {
    slaStatus = 'breached';
    slaRemainingLabel = `SLA vencido há ${Math.ceil(Math.abs(remaining)/60)}h úteis`;
    slaPercent = 100;
  } else {
    const hoursLeft = Math.ceil(remaining/60);
    slaPercent = totalDuration > 0 ? Math.min(100,Math.round((elapsed/totalDuration)*100)) : 0;
    if (hoursLeft <= 3) {
      slaStatus = 'warning'; slaRemainingLabel = `Crítico: restam ${hoursLeft}h úteis`;
    } else {
      slaStatus = 'ok'; slaRemainingLabel = `Dentro do prazo: restam ${hoursLeft}h úteis`;
    }
  }

  const handleStatusChange = (newStatus: TicketStatus) => {
    updateTicketStatus(selectedTicket.id, newStatus);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addTicketComment(selectedTicket.id, commentText, isInternalComment);
    setCommentText('');
  };

  const statusOptions: { id: TicketStatus; label: string; color: string }[] = [
    { id: 'novo', label: 'Novo', color: 'bg-slate-100 text-slate-800' },
    { id: 'em_analise', label: 'Em Análise', color: 'bg-blue-100 text-blue-800' },
    { id: 'aguardando_info', label: 'Aguardando Informação', color: 'bg-amber-100 text-amber-800' },
    { id: 'aguardando_aprovacao', label: 'Aguardando Aprovação', color: 'bg-purple-100 text-purple-800' },
    { id: 'agendado', label: 'Agendado', color: 'bg-cyan-100 text-cyan-800' },
    { id: 'em_andamento', label: 'Em Andamento', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'concluido', label: 'Concluído', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'cancelado', label: 'Cancelado', color: 'bg-rose-100 text-rose-800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-sm bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md border border-blue-200">
              {selectedTicket.ticketNumber}
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900 line-clamp-1">{selectedTicket.title}</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5" suppressHydrationWarning>
                <span>{selectedTicket.serviceName}</span>
                <span>·</span>
                <span suppressHydrationWarning>Aberto em {new Date(selectedTicket.createdAt).toLocaleDateString('pt-BR')} às {new Date(selectedTicket.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedTicketId(null)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SLA Progress Bar Banner */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-700 font-semibold">Monitoramento de SLA:</span>
              <span
                className={`font-semibold ${
                  slaStatus === 'breached'
                    ? 'text-red-700'
                    : slaStatus === 'warning'
                    ? 'text-amber-700'
                    : slaStatus === 'completed'
                    ? 'text-emerald-700'
                    : 'text-emerald-700'
                }`}
              >
                {slaRemainingLabel}
              </span>
            </div>
            <div className="text-slate-500 text-[11px] font-mono" suppressHydrationWarning>
              Prazo limite: {selectedTicket.slaDeadline ? new Date(selectedTicket.slaDeadline).toLocaleString('pt-BR') : 'Não definido'} ({selectedTicket.slaBusinessDays ? `${selectedTicket.slaBusinessDays} dias úteis` : `SLA total ${selectedTicket.slaTotalHours}h`})
            </div>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                slaStatus === 'breached'
                  ? 'bg-red-600'
                  : slaStatus === 'warning'
                  ? 'bg-amber-500'
                  : slaStatus === 'completed'
                  ? 'bg-emerald-600'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, slaPercent)}%` }}
            />
          </div>
        </div>

        {/* Content Body (2 Columns) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Details & Discussion (2 spans) */}
          <div className="lg:col-span-2 p-6 space-y-6">
            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Descrição da Demanda</h4>
              <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-lg border border-slate-100 whitespace-pre-wrap leading-relaxed">
                {selectedTicket.description}
              </p>
            </div>

            {/* Attachments */}
            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Anexos ({selectedTicket.attachments.length})</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedTicket.attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="truncate flex-1">
                        <div className="font-medium text-slate-800 truncate">{att.name}</div>
                        <div className="text-[10px] text-slate-400">{att.size} · {att.type}</div>
                      </div>
                      <span className="text-[10px] text-blue-600 font-semibold cursor-pointer hover:underline">Baixar</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Comments & Conversation */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Histórico de Atendimento & Comentários ({selectedTicket.comments.length})
                </h4>
              </div>

              {/* Comments list */}
              <div className="space-y-3">
                {selectedTicket.comments.length === 0 ? (
                  <div className="text-xs text-slate-400 italic py-2">Nenhum comentário registrado ainda. Seja o primeiro a responder.</div>
                ) : (
                  selectedTicket.comments.map((c) => (
                    <div
                      key={c.id}
                      className={`p-3.5 rounded-lg text-xs border ${
                        c.isInternal
                          ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="font-semibold text-slate-900">{c.authorName}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({c.authorRole})</span>
                          {c.isInternal && (
                            <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-800 font-bold">
                              Nota Interna
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono" suppressHydrationWarning>
                          {new Date(c.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment box */}
              <form onSubmit={handleSendComment} className="pt-2">
                <div className="border border-slate-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
                  <textarea
                    rows={2}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Adicionar atualização ou resposta para o chamado..."
                    className="w-full text-xs p-3 text-slate-800 focus:outline-hidden resize-none"
                  />
                  <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    {(currentUser.role === 'admin' || currentUser.role === 'attendant') && (
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternalComment}
                          onChange={(e) => setIsInternalComment(e.target.checked)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span>Nota interna (visível apenas para administração)</span>
                      </label>
                    )}
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Enviar</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Metadata & Controls (1 span) */}
          <div className="p-6 bg-slate-50/50 space-y-6">
            {/* Status change selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Alterar Status do Chamado
              </label>
              <div className="space-y-1">
                {statusOptions.map((st) => {
                  const isCurrent = selectedTicket.status === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => handleStatusChange(st.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                        isCurrent
                          ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{st.label}</span>
                      {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assignee selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Responsável pelo Atendimento
              </label>
              <select
                value={selectedTicket.assignedToId || ''}
                onChange={(e) => {
                  const targetUser = availableUsers.find((u) => u.id === e.target.value);
                  if (targetUser) {
                    assignTicket(selectedTicket.id, targetUser.id, targetUser.name);
                  }
                }}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
              >
                <option value="">Não atribuído</option>
                {availableUsers
                  .filter((u) => u.role === 'admin' || u.role === 'attendant' || u.role === 'manager')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.roleLabel})
                    </option>
                  ))}
              </select>
            </div>

            {/* Information Grid */}
            <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Solicitante</span>
                <span className="font-semibold text-slate-800 block">{selectedTicket.requesterName}</span>
                <span className="text-slate-500 text-[11px]">{selectedTicket.requesterDepartment}</span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Prioridade</span>
                <span className="font-semibold text-slate-800 uppercase font-mono text-[11px]">
                  {selectedTicket.priority} (SLA {selectedTicket.slaTotalHours}h)
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Localização</span>
                <span className="font-medium text-slate-700">{selectedTicket.location || 'Não especificada'}</span>
              </div>

              {selectedTicket.costEstimate && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Custo Estimado</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    R$ {selectedTicket.costEstimate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Audit / Timeline History */}
            <div className="pt-2 border-t border-slate-200">
              <h5 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <History className="w-3 h-3" />
                Trilha de Auditoria
              </h5>
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedTicket.history.map((h) => (
                  <div key={h.id} className="text-[11px] border-l-2 border-slate-300 pl-2 py-0.5">
                    <div className="text-slate-800 font-medium">{h.action}</div>
                    <div className="text-slate-400 text-[10px]" suppressHydrationWarning>
                      {h.performedBy} · {new Date(h.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
