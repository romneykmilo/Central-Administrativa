'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Contract, DocumentGED } from '@/types';
import {
  FileText,
  FileCheck2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  Search,
  Filter,
  Paperclip,
  Building,
  Tag,
  X,
  Plus,
} from 'lucide-react';

interface Props {
  initialTab?: 'contratos' | 'documentos';
}

export const GEDAndContractsModule: React.FC<Props> = ({ initialTab = 'contratos' }) => {
  const { contracts, gedDocuments, openNewTicketWithPrefill } = useApp();

  const [activeTab, setActiveTab] = useState<'contratos' | 'documentos'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<DocumentGED | null>(null);

  const filteredContracts = contracts.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.contractNumber.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.supplierName.toLowerCase().includes(q)
    );
  });

  const filteredDocs = gedDocuments.filter((d) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.type.toLowerCase().includes(q) ||
      d.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {activeTab === 'contratos' ? 'Gestão de Contratos Corporativos' : 'GED - Gestão Eletrônica de Documentos'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Repositório institucional de contratos vigentes, licenças, alvarás regulatórios e seguros
          </p>
        </div>

        <button
          onClick={() =>
            openNewTicketWithPrefill({
              category: 'documentos',
              serviceName: activeTab === 'contratos' ? 'Novo Contrato de Fornecedor' : 'Renovação de Alvará / Licença',
            })
          }
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'contratos' ? 'Cadastrar Demanda Contratual' : 'Enviar Novo Documento'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-1">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('contratos')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'contratos'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Contratos Ativos ({contracts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('documentos')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors ${
              activeTab === 'documentos'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>GED: Alvarás, Licenças & Apólices ({gedDocuments.length})</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-xs hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800"
          />
        </div>
      </div>

      {/* CONTRACTS VIEW */}
      {activeTab === 'contratos' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                  <th className="py-3 px-4">Contrato</th>
                  <th className="py-3 px-4">Objeto & Fornecedor</th>
                  <th className="py-3 px-4">Valor Mensal</th>
                  <th className="py-3 px-4">Vigência</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Anexos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContracts.map((c) => {
                  const isExpiring = c.status === 'vencendo';
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {c.contractNumber}
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <div className="font-semibold text-slate-900 line-clamp-1">{c.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {c.supplierName} · <span className="capitalize">{c.category}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-800 whitespace-nowrap">
                        R$ {c.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        {c.startDate} até {c.endDate}
                      </td>
                      <td className="py-3 px-4 text-slate-700 whitespace-nowrap">{c.responsibleName}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                            isExpiring
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isExpiring ? 'Vencendo em breve' : 'Vigente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap text-blue-600 font-semibold cursor-pointer hover:underline">
                        {c.attachmentsCount} PDFs
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GED VIEW */}
      {activeTab === 'documentos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="p-4 bg-white border border-slate-200 hover:border-blue-400 rounded-xl shadow-2xs space-y-3 cursor-pointer transition-all hover:shadow-xs"
            >
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    doc.status === 'valido'
                      ? 'bg-emerald-100 text-emerald-800'
                      : doc.status === 'a_vencer'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {doc.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 text-xs sm:text-sm line-clamp-2">{doc.title}</h4>
                <div className="text-[11px] text-slate-500 mt-1">
                  Tipo: <strong className="text-slate-700">{doc.type}</strong> · {doc.category}
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {doc.tags.map((t) => (
                  <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                    #{t}
                  </span>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>Vencimento: {doc.expiryDate || 'Indeterminado'}</span>
                <span>{doc.fileSize}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Document Simulator Viewer Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{selectedDoc.title}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    GED-ID: {selectedDoc.id} · {selectedDoc.fileSize}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tipo de Documento</span>
                  <span className="font-semibold text-slate-800">{selectedDoc.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Categoria</span>
                  <span className="font-semibold text-slate-800">{selectedDoc.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Data de Upload</span>
                  <span className="font-mono text-slate-800">{selectedDoc.uploadDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Data de Vencimento</span>
                  <span className="font-mono text-slate-800 font-semibold">{selectedDoc.expiryDate || 'Sem expiração'}</span>
                </div>
              </div>

              {/* Mock PDF Content Preview */}
              <div className="border border-slate-200 rounded-lg p-8 bg-slate-100/50 text-center space-y-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xs mx-auto text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Visualização Digital Simulada</div>
                  <div className="text-[11px] text-slate-500">Documento homologado eletronicamente com carimbo de tempo ICP-Brasil.</div>
                </div>
                <button
                  onClick={() => alert('Download do documento PDF simulado iniciado!')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Arquivo PDF ({selectedDoc.fileSize})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
