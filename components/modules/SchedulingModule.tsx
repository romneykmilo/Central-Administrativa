'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ResourceType, ResourceSchedule } from '@/types';
import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  CheckCircle2,
  X,
  Truck,
  Coffee,
  Building,
  Car,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const SchedulingModule: React.FC = () => {
  const {
    schedules,
    drivers,
    vehicles,
    waiters,
    createSchedule,
    cancelSchedule,
    currentUser,
  } = useApp();

  const [activeType, setActiveType] = useState<ResourceType | 'todos'>('todos');
  const [viewMode, setViewMode] = useState<'dia' | 'semana' | 'mes' | 'lista'>('lista');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for new booking
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState<ResourceType>('motorista');
  const [resourceId, setResourceId] = useState('');
  const [resourceName, setResourceName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState('14:00');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [endTime, setEndTime] = useState('16:00');
  const [location, setLocation] = useState('Sede Paulista');
  const [guestsCount, setGuestsCount] = useState('2');
  const [notes, setNotes] = useState('');
  const [formConflictWarning, setFormConflictWarning] = useState<string | null>(null);

  const filteredSchedules = schedules.filter((s) => {
    if (activeType !== 'todos' && s.resourceType !== activeType) return false;
    return true;
  });

  const handleOpenModal = (presetType?: ResourceType) => {
    const targetType = presetType || 'motorista';
    setResourceType(targetType);
    setTitle('');
    setLocation('Sede Paulista');
    setNotes('');
    setFormConflictWarning(null);

    // Default resource option
    if (targetType === 'motorista') {
      const d = drivers[0];
      setResourceId(d.id);
      setResourceName(`${d.name} (${d.assignedVehicle || 'Sem veículo'})`);
    } else if (targetType === 'garcom') {
      const w = waiters[0];
      setResourceId(w.id);
      setResourceName(w.name);
    } else if (targetType === 'veiculo') {
      const v = vehicles[0];
      setResourceId(v.id);
      setResourceName(`${v.model} (${v.plate})`);
    } else {
      setResourceId('sala-1');
      setResourceName('Auditório Master Paulista (45 pessoas)');
    }

    setIsModalOpen(true);
  };

  const handleResourceChange = (type: ResourceType, id: string) => {
    setResourceId(id);
    let name = '';
    if (type === 'motorista') {
      const d = drivers.find((x) => x.id === id);
      name = d ? `${d.name} (${d.assignedVehicle || 'Veículo a definir'})` : '';
    } else if (type === 'veiculo') {
      const v = vehicles.find((x) => x.id === id);
      name = v ? `${v.model} (${v.plate})` : '';
    } else if (type === 'garcom') {
      const w = waiters.find((x) => x.id === id);
      name = w ? w.name : '';
    } else {
      name = id === 'sala-1' ? 'Auditório Master Paulista' : 'Sala de Conselho 12º andar';
    }
    setResourceName(name);

    // Check conflict live
    checkConflictLive(id, `${startDate}T${startTime}:00.000Z`, `${endDate}T${endTime}:00.000Z`);
  };

  const checkConflictLive = (resId: string, startIso: string, endIso: string) => {
    const startA = new Date(startIso).getTime();
    const endA = new Date(endIso).getTime();

    const conflict = schedules.find((s) => {
      if (s.status === 'cancelado') return false;
      if (s.resourceId !== resId) return false;
      const startB = new Date(s.startDateTime).getTime();
      const endB = new Date(s.endDateTime).getTime();
      return startA < endB && endA > startB;
    });

    if (conflict) {
      setFormConflictWarning(
        `Atenção: Já existe o agendamento "${conflict.title}" para este recurso no mesmo horário!`
      );
    } else {
      setFormConflictWarning(null);
    }
  };

  const handleSubmitSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const startIso = `${startDate}T${startTime}:00.000Z`;
    const endIso = `${endDate}T${endTime}:00.000Z`;

    const res = createSchedule({
      title: title || `Agendamento ${resourceName}`,
      resourceType,
      resourceId,
      resourceName,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      department: currentUser.department,
      startDateTime: startIso,
      endDateTime: endIso,
      location,
      passengersOrGuests: parseInt(guestsCount) || 1,
      notes,
      status: 'confirmado',
    });

    if (res.success) {
      setIsModalOpen(false);
    } else {
      setFormConflictWarning(res.conflict || 'Conflito detectado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Agendamento de Recursos</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Coordenação e reserva de motoristas, veículos corporativos, garçons e salas de eventos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Resource Type Tabs & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'todos', label: 'Todos os Recursos', icon: CalendarDays },
            { id: 'motorista', label: 'Motoristas', icon: Truck },
            { id: 'veiculo', label: 'Veículos da Frota', icon: Car },
            { id: 'garcom', label: 'Garçons & Copa', icon: Coffee },
            { id: 'sala', label: 'Salas & Auditórios', icon: Building },
          ].map((item) => {
            const Icon = item.icon;
            const isSel = activeType === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveType(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  isSel
                    ? 'bg-slate-900 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs self-start md:self-auto">
          {[
            { id: 'dia', label: 'Dia' },
            { id: 'semana', label: 'Semana' },
            { id: 'mes', label: 'Mês' },
            { id: 'lista', label: 'Lista' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setViewMode(v.id as any)}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                viewMode === v.id ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conflict detection notice banner */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Sistema Anti-Conflito Ativo:</strong> O sistema bloqueia automaticamente reservas simultâneas para o mesmo motorista, carro ou garçom.
          </span>
        </div>
        <span className="font-mono text-[11px] text-blue-700 font-semibold hidden sm:inline">
          {schedules.filter((s) => s.status === 'confirmado').length} reservas ativas
        </span>
      </div>

      {/* Schedules List or Calendar View */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-semibold text-slate-800">Nenhum agendamento encontrado</h4>
            <p className="text-xs text-slate-500 mt-1">Utilize o botão acima para reservar um recurso.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredSchedules.map((sch) => {
              const start = new Date(sch.startDateTime);
              const end = new Date(sch.endDateTime);
              const isCancelled = sch.status === 'cancelado';

              return (
                <div
                  key={sch.id}
                  className={`p-4 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs ${
                    isCancelled ? 'opacity-50 bg-slate-50' : ''
                  }`}
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">{sch.title}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                        {sch.resourceType}
                      </span>
                      {isCancelled && (
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                          Cancelado
                        </span>
                      )}
                    </div>

                    <div className="text-slate-700 font-medium flex items-center gap-2">
                      <span>Recurso alocado: <strong>{sch.resourceName}</strong></span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-mono" suppressHydrationWarning>
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span suppressHydrationWarning>{start.toLocaleDateString('pt-BR')} ({start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} às {end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {sch.location}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        Solicitante: {sch.requesterName} ({sch.department})
                      </span>
                      {sch.passengersOrGuests && (
                        <>
                          <span>·</span>
                          <span>Capacidade/Convidados: {sch.passengersOrGuests} pessoas</span>
                        </>
                      )}
                    </div>

                    {sch.notes && (
                      <p className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded border border-slate-100 italic">
                        &ldquo;{sch.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    {!isCancelled && (
                      <button
                        onClick={() => cancelSchedule(sch.id)}
                        className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-rose-200 rounded-md transition-colors"
                      >
                        Cancelar Reserva
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: New Booking */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Novo Agendamento de Recurso</h3>
                <p className="text-xs text-slate-500">Reserva com verificação automática de conflito de agenda</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSchedule} className="p-6 overflow-y-auto space-y-4">
              {/* Conflict Alert in Modal */}
              {formConflictWarning && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-900 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <p>{formConflictWarning}</p>
                </div>
              )}

              {/* Type and Resource */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Recurso *</label>
                  <select
                    value={resourceType}
                    onChange={(e) => {
                      const newType = e.target.value as ResourceType;
                      setResourceType(newType);
                      handleResourceChange(
                        newType,
                        newType === 'motorista' ? drivers[0].id : newType === 'garcom' ? waiters[0].id : newType === 'veiculo' ? vehicles[0].id : 'sala-1'
                      );
                    }}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    <option value="motorista">🚗 Motorista Executivo</option>
                    <option value="veiculo">🚘 Veículo da Frota</option>
                    <option value="garcom">☕ Garçom / Copa</option>
                    <option value="sala">🏢 Sala / Auditório</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selecionar Recurso *</label>
                  <select
                    value={resourceId}
                    onChange={(e) => handleResourceChange(resourceType, e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  >
                    {resourceType === 'motorista' &&
                      drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.assignedVehicle || 'Sem carro'})
                        </option>
                      ))}

                    {resourceType === 'veiculo' &&
                      vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.model} ({v.plate})
                        </option>
                      ))}

                    {resourceType === 'garcom' &&
                      waiters.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} (Turno: {w.shift})
                        </option>
                      ))}

                    {resourceType === 'sala' && (
                      <>
                        <option value="sala-1">Auditório Master Paulista (45 pessoas)</option>
                        <option value="sala-2">Sala de Conselho da Presidência 12º andar</option>
                        <option value="sala-3">Sala Multiuso de Treinamento 3º andar</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Evento / Motivo *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Desembarque Diretor Congonhas / Café com Acionistas"
                  className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                />
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      checkConflictLive(resourceId, `${e.target.value}T${startTime}:00.000Z`, `${endDate}T${endTime}:00.000Z`);
                    }}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário Início</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      checkConflictLive(resourceId, `${startDate}T${e.target.value}:00.000Z`, `${endDate}T${endTime}:00.000Z`);
                    }}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Data Término</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      checkConflictLive(resourceId, `${startDate}T${startTime}:00.000Z`, `${e.target.value}T${endTime}:00.000Z`);
                    }}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horário Término</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      checkConflictLive(resourceId, `${startDate}T${startTime}:00.000Z`, `${endDate}T${e.target.value}:00.000Z`);
                    }}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                  />
                </div>
              </div>

              {/* Location & Guests */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Local / Trajeto *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ex: Sede Paulista → Aeroporto Congonhas"
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Passageiros / Convidados</label>
                  <input
                    type="number"
                    min="1"
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instruções / Observações</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Traje social completo; cliente estrangeiro; necessita de café sem açúcar..."
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              {/* Footer */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
