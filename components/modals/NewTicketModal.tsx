'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ServiceCategory, TicketPriority, Ticket } from '@/types';
import { X, Clock, UploadCloud } from 'lucide-react';

const servicesByCategory: Partial<Record<ServiceCategory, string[]>> = {
  logistica: ['Motorista Executivo', 'Locação de Veículos', 'Correios & Motoboy', 'Transporte de Cargas', 'Malote Corporativo'],
  atendimento: ['Limpeza & Higienização', 'Copa & Garçom', 'Vigilância & Portaria', 'Serviços Externos', 'Atendimento de Eventos', 'Solicitações para Portaria'],
  manutencao: ['Climatização e Ar-Condicionado', 'Instalações Elétricas', 'Hidráulica Predial', 'Reparo Civil', 'Manutenção de Mobiliário', 'Manutenção Preventiva', 'Mudança de Layout'],
  viagens: ['Passagens Aéreas', 'Reserva de Hotel / Hospedagem', 'Locação de Veículo para Viagem', 'Seguro Viagem', 'Adiantamento de Diárias'],
  telefonia: ['Solicitação de Linha Nova', 'Substituição de Aparelho Smartphone', 'Roaming Internacional', 'Chip Corporativo', 'Ramal / PABX'],
  compras: ['Cotação Direta'],
};

interface FormContentProps {
  initialPrefill: Partial<Ticket> | null;
  onClose: () => void;
}

const NewTicketFormContent: React.FC<FormContentProps> = ({ initialPrefill, onClose }) => {
  const { createTicket, currentUser, serviceSlaPolicies } = useApp();

  const [category, setCategory] = useState<ServiceCategory>(initialPrefill?.category || 'manutencao');
  const [serviceName, setServiceName] = useState<string>(
    initialPrefill?.serviceName || servicesByCategory[initialPrefill?.category || 'manutencao']?.[0] || ''
  );
  const [title, setTitle] = useState(initialPrefill?.title || '');
  const [description, setDescription] = useState(initialPrefill?.description || '');
  const [priority, setPriority] = useState<TicketPriority>(initialPrefill?.priority || 'media');
  const [location, setLocation] = useState(initialPrefill?.location || 'Sede Paulista - 4º andar');
  const [costEstimate, setCostEstimate] = useState<string>('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: string }[]>([]);

  const handleCategoryChange = (newCat: ServiceCategory) => {
    setCategory(newCat);
    const available = servicesByCategory[newCat];
    if (available && available.length > 0) {
      setServiceName(available[0]);
    }
  };

  const handleSimulateUpload = () => {
    const mockFile = {
      name: `anexo_chamado_${Math.floor(Math.random() * 8999 + 1000)}.pdf`,
      size: `${(Math.random() * 2 + 0.4).toFixed(1)} MB`,
      type: 'PDF',
    };
    setAttachedFiles((prev) => [...prev, mockFile]);
  };

  const activeServices = (servicesByCategory[category] || []).filter((name) => serviceSlaPolicies.some((policy) => policy.serviceName === name && policy.active));
  const slaDays = serviceSlaPolicies.find((policy) => policy.serviceName === serviceName && policy.active)?.businessDays;

  React.useEffect(() => {
    if (activeServices.length > 0 && !activeServices.includes(serviceName)) setServiceName(activeServices[0]);
  }, [category, serviceSlaPolicies, serviceName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createTicket({
      title,
      description,
      category,
      serviceName,
      priority,
      location,
      costEstimate: costEstimate ? parseFloat(costEstimate) : undefined,
      attachments: attachedFiles,
    });
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
      {/* Modal Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Abertura de Chamado Administrativo</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Solicitante: <span className="font-medium text-slate-700">{currentUser.name}</span> ({currentUser.department})
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Modal Form */}
      <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
        {/* Category & Service */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Módulo / Categoria *</label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as ServiceCategory)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="logistica">Logística e Frotas</option>
              <option value="atendimento">Atendimento (Limpeza, copa e portaria)</option>
              <option value="manutencao">Manutenção Predial</option>
              <option value="viagens">Viagens e Passagens</option>
              <option value="telefonia">Telefonia e Celular</option>
              <option value="compras">Compras Corporativas</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Serviço *</label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {activeServices.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
              {activeServices.length === 0 && <option value="">Nenhum serviço ativo neste módulo</option>}
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Assunto / Título Resumido *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Manutenção do ar-condicionado na sala 03 do 4º andar"
            className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Detalhada *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva detalhadamente a necessidade, horários específicos, quantidades ou observações para a equipe de atendimento..."
            className="w-full text-xs font-normal bg-white border border-slate-300 rounded-lg p-3 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Priority & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Prioridade</label>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3 text-slate-400" />
                {slaDays ? `Prazo de atendimento: ${slaDays} ${slaDays === 1 ? 'dia útil' : 'dias úteis'}` : 'SLA não cadastrado'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'baixa', label: 'Baixa' },
                { id: 'media', label: 'Média' },
                { id: 'alta', label: 'Alta' },
                { id: 'critica', label: 'Crítica' },
              ].map((p) => {
                const isSelected = priority === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPriority(p.id as TicketPriority)}
                    className={`py-1.5 px-2 text-center rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    <div>{p.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Localização / Andar / Sala</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Sede Paulista - 4º andar (Sala 03)"
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Attachment Simulator */}
        <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-600 font-medium">Anexar Documento, Cotação ou Foto (Opcional)</span>
            </div>
            <button
              type="button"
              onClick={handleSimulateUpload}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs"
            >
              + Simular Anexo
            </button>
          </div>
          {attachedFiles.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs bg-white px-2 py-1 rounded border border-slate-200">
                  <span className="text-slate-700 truncate">{file.name} ({file.size})</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            Registrar Chamado
          </button>
        </div>
      </form>
    </div>
  );
};

export const NewTicketModal: React.FC = () => {
  const { isNewTicketOpen, setIsNewTicketOpen, ticketPrefill } = useApp();

  if (!isNewTicketOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <NewTicketFormContent
        key={ticketPrefill ? JSON.stringify(ticketPrefill) : 'default'}
        initialPrefill={ticketPrefill}
        onClose={() => setIsNewTicketOpen(false)}
      />
    </div>
  );
};
