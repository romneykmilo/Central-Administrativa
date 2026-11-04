'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ServiceCategory, TicketPriority, Ticket } from '@/types';
import { X, Clock, UploadCloud } from 'lucide-react';

const servicesByCategory: Record<ServiceCategory, string[]> = {
  logistica: ['Motorista Executivo', 'Locação de Veículos', 'Correios & Motoboy', 'Transporte de Cargas', 'Malote Corporativo'],
  atendimento: ['Limpeza & Higienização', 'Copa & Garçom', 'Vigilância & Portaria', 'Serviços Externos', 'Atendimento de Eventos'],
  manutencao: ['Climatização e Ar-Condicionado', 'Instalações Elétricas', 'Hidráulica Predial', 'Reparo Civil / Mobiliário', 'Manutenção Preventiva'],
  documentos: ['Solicitação de Contrato', 'Renovação de Alvará / Licença', 'Apólice de Seguro', 'Autenticação Cartorial', 'Digitalização GED'],
  viagens: ['Passagens Aéreas', 'Reserva de Hotel / Hospedagem', 'Locação de Veículo para Viagem', 'Seguro Viagem', 'Adiantamento de Diárias'],
  telefonia: ['Solicitação de Linha Nova', 'Substituição de Aparelho Smartphone', 'Roaming Internacional', 'Chip Corporativo', 'Ramal / PABX'],
  compras: ['Compra de Mobiliário', 'Materiais de Escritório', 'Equipamentos de Apoio', 'Suprimentos Especiais', 'Cotação Direta'],
  pagamentos: ['Pagamento de Concessionária', 'Boleto Fornecedor', 'Taxa Municipal / Alvará', 'Reembolso Despesas'],
  gestao: ['Atividade Administrativa', 'Auditoria Interna', 'Organização de Arquivo', 'Controle de Acesso'],
  patrimonio: ['Transferência de Ativo', 'Tombamento / Plaqueta', 'Termo de Cautela', 'Baixa de Equipamento'],
  imoveis: ['Vistoria de Imóvel', 'Contrato de Locação', 'Condomínio e IPTU', 'Manutenção Estrutural'],
  obras: ['Reforma de Sala', 'Nova Sede Alphaville', 'Pintura e Piso', 'Adequação Elétrica CPD'],
  contratos: ['Novo Contrato de Fornecedor', 'Renovação Contratual', 'Aditivo de Valor / Escopo', 'Rescisão Contratual'],
  estoque: ['Reposição Papel Sulfite A4', 'Café e Açúcar Copa', 'Insumos de Limpeza', 'Toner e Cartuchos'],
};

interface FormContentProps {
  initialPrefill: Partial<Ticket> | null;
  onClose: () => void;
}

const NewTicketFormContent: React.FC<FormContentProps> = ({ initialPrefill, onClose }) => {
  const { createTicket, currentUser } = useApp();

  const [category, setCategory] = useState<ServiceCategory>(initialPrefill?.category || 'manutencao');
  const [serviceName, setServiceName] = useState<string>(
    initialPrefill?.serviceName || 'Manutenção Geral'
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

  const slaHours = priority === 'critica' ? 4 : priority === 'alta' ? 12 : priority === 'media' ? 24 : 48;

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
              <option value="logistica">🚗 Logística & Frotas</option>
              <option value="atendimento">👥 Atendimento, Limpeza & Copa</option>
              <option value="manutencao">🔧 Manutenção Predial & Climatização</option>
              <option value="viagens">✈️ Viagens & Passagens</option>
              <option value="telefonia">📞 Telefonia & Celular</option>
              <option value="compras">🛒 Compras Corporativas</option>
              <option value="estoque">📦 Estoque & Almoxarifado</option>
              <option value="documentos">📄 Documentos & GED</option>
              <option value="contratos">📋 Contratos</option>
              <option value="patrimonio">🏷️ Patrimônio & Ativos</option>
              <option value="imoveis">🏢 Gestão de Imóveis</option>
              <option value="obras">🏗️ Obras & Reformas</option>
              <option value="pagamentos">💳 Pagamentos Administrativos</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Serviço *</label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {(servicesByCategory[category] || []).map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
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
                SLA Máximo: {slaHours}h
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'baixa', label: 'Baixa', hours: '48h' },
                { id: 'media', label: 'Média', hours: '24h' },
                { id: 'alta', label: 'Alta', hours: '12h' },
                { id: 'critica', label: 'Crítica', hours: '4h' },
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
                    <div className="text-[10px] font-normal opacity-80">{p.hours}</div>
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
