'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ResourceType, ResourceSchedule } from '@/types';
import { CalendarDays, Plus, Clock, MapPin, Users, AlertTriangle, CheckCircle2, X, Truck, Car, ChevronLeft, ChevronRight } from 'lucide-react';

type CalendarMode = 'dia' | 'semana' | 'mes' | 'lista';
const pad = (value: number) => String(value).padStart(2, '0');
const dateKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const localDateTime = (date: string, time: string) => new Date(`${date}T${time}:00`);
const plusMinutes = (date: Date, minutes: number) => new Date(date.getTime() + minutes * 60000);
const formatTime = (value?: string) => value ? new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

export const SchedulingModule: React.FC = () => {
  const { schedules, drivers, vehicles, waiters, createSchedule, cancelSchedule, currentUser } = useApp();
  const [viewMode, setViewMode] = useState<CalendarMode>('mes');
  const [activeTab, setActiveTab] = useState<'motorista' | 'outros'>('motorista');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resourceType, setResourceType] = useState<ResourceType>('motorista');
  const [driverId, setDriverId] = useState(drivers[0]?.id || '');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [otherResourceId, setOtherResourceId] = useState('');
  const [title, setTitle] = useState('');
  const [tripRequesterName, setTripRequesterName] = useState(currentUser.name);
  const [costCenter, setCostCenter] = useState(currentUser.department || '');
  const [passengerName, setPassengerName] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(dateKey(new Date()));
  const [startTime, setStartTime] = useState('08:00');
  const [dropoffDate, setDropoffDate] = useState(dateKey(new Date()));
  const [dropoffTime, setDropoffTime] = useState('09:00');
  const [tripMode, setTripMode] = useState<'aguardar' | 'somente_levar'>('somente_levar');
  const [waitingUntil, setWaitingUntil] = useState('10:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [formConflictWarning, setFormConflictWarning] = useState<string | null>(null);

  const driver = drivers.find(item => item.id === driverId);
  const vehicle = vehicles.find(item => item.id === vehicleId);
  const bookingEnd = useMemo(() => {
    const dropoff = localDateTime(dropoffDate, dropoffTime);
    return tripMode === 'aguardar' ? localDateTime(dropoffDate, waitingUntil) : plusMinutes(dropoff, 40);
  }, [dropoffDate, dropoffTime, tripMode, waitingUntil]);

  const driverSchedules = schedules.filter(s => s.resourceType === 'motorista' || !!s.driverId);
  const otherSchedules = schedules.filter(s => s.resourceType !== 'motorista' && !s.driverId);
  const visibleSchedules = activeTab === 'motorista' ? driverSchedules : otherSchedules;

  const openModal = (type: ResourceType = 'motorista') => {
    setResourceType(type);
    setTitle('');
    setTripRequesterName(currentUser.name);
    setCostCenter(currentUser.department || '');
    setPassengerName('');
    setOrigin('');
    setDestination('');
    setStartDate(dateKey(currentDate));
    setDropoffDate(dateKey(currentDate));
    setStartTime('08:00');
    setDropoffTime('09:00');
    setTripMode('somente_levar');
    setWaitingUntil('10:00');
    setLocation('');
    setNotes('');
    setFormConflictWarning(null);
    if (type === 'motorista') {
      setDriverId(drivers[0]?.id || '');
      const assigned = vehicles.find(v => v.model === drivers[0]?.assignedVehicle);
      setVehicleId(assigned?.id || vehicles[0]?.id || '');
    } else if (type === 'garcom') {
      setOtherResourceId(waiters[0]?.id || '');
    } else {
      setOtherResourceId('sala-1');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const start = localDateTime(startDate, startTime);
    const end = resourceType === 'motorista' ? bookingEnd : localDateTime(dropoffDate, dropoffTime);
    if (end <= start) {
      setFormConflictWarning('O horário de término deve ser posterior ao horário de início.');
      return;
    }
    const selectedDriver = drivers.find(item => item.id === driverId);
    const selectedVehicle = vehicles.find(item => item.id === vehicleId);
    const selectedWaiter = waiters.find(item => item.id === otherResourceId);
    const isDriverBooking = resourceType === 'motorista';
    const resourceId = isDriverBooking ? driverId : otherResourceId;
    const resourceName = isDriverBooking
      ? (selectedDriver?.name || 'Motorista') 
      : resourceType === 'garcom' ? (selectedWaiter?.name || 'Garçom') : 'Sala / Auditório';
    const result = createSchedule({
      title: title || (isDriverBooking ? `Corrida - ${passengerName || 'Passageiro'}` : `Reserva - ${resourceName}`),
      resourceType,
      resourceId,
      resourceName,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      department: currentUser.department,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      location: isDriverBooking ? `${origin} → ${destination}` : (location || 'A definir'),
      passengersOrGuests: isDriverBooking ? 1 : undefined,
      notes,
      status: 'confirmado',
      ...(isDriverBooking ? {
        driverId,
        driverName: selectedDriver?.name,
        vehicleId,
        vehicleName: selectedVehicle ? `${selectedVehicle.model} - ${selectedVehicle.plate}` : '',
        tripRequesterName,
        costCenter,
        passengerName,
        origin,
        destination,
        tripMode,
        passengerDropoffDateTime: localDateTime(dropoffDate, dropoffTime).toISOString(),
        waitingUntil: tripMode === 'aguardar' ? end.toISOString() : undefined,
      } : {}),
    });
    if (result.success) setIsModalOpen(false);
    else setFormConflictWarning(result.conflict || 'Conflito detectado.');
  };

  const moveCalendar = (direction: number) => {
    const next = new Date(currentDate);
    if (viewMode === 'dia') next.setDate(next.getDate() + direction);
    else if (viewMode === 'semana') next.setDate(next.getDate() + direction * 7);
    else next.setMonth(next.getMonth() + direction);
    setCurrentDate(next);
  };

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [currentDate]);

  const weekDays = useMemo(() => {
    const day = new Date(currentDate);
    day.setDate(day.getDate() - day.getDay());
    return Array.from({ length: 7 }, (_, index) => {
      const item = new Date(day);
      item.setDate(day.getDate() + index);
      return item;
    });
  }, [currentDate]);

  const dayList = viewMode === 'dia' ? [currentDate] : viewMode === 'semana' ? weekDays : calendarDays;
  const getSchedulesForDay = (day: Date) => visibleSchedules.filter(schedule => dateKey(new Date(schedule.startDateTime)) === dateKey(day));
  const sortedSchedules = [...visibleSchedules].sort((a, b) => a.startDateTime.localeCompare(b.startDateTime));

  const renderSchedule = (schedule: ResourceSchedule, compact = false) => {
    const cancelled = schedule.status === 'cancelado';
    return (
      <div key={schedule.id} className={`rounded-md border px-2 py-1.5 text-[11px] ${cancelled ? 'border-slate-200 bg-slate-100 opacity-60' : 'border-blue-200 bg-blue-50 text-blue-900'}`}>
        <div className="font-semibold truncate">{formatTime(schedule.startDateTime)} · {schedule.title}</div>
        {!compact && <div className="mt-0.5 truncate">{schedule.driverName || schedule.resourceName}{schedule.vehicleName ? ` | ${schedule.vehicleName}` : ''}</div>}
        {!compact && schedule.passengerName && <div className="truncate">Passageiro: {schedule.passengerName}</div>}
        {!compact && schedule.tripMode && <div>{schedule.tripMode === 'aguardar' ? `Aguardar até ${formatTime(schedule.waitingUntil)}` : 'Somente levar · +40 min de retorno'}</div>}
        {!cancelled && <button type="button" onClick={() => cancelSchedule(schedule.id)} className="mt-1 text-rose-700 hover:underline">Cancelar</button>}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Agendamentos de Recursos</h1>
          <p className="mt-1 text-sm text-slate-500">Agenda integrada de motoristas e veículos da frota, além dos demais recursos.</p>
        </div>
        <button onClick={() => openModal(activeTab === 'motorista' ? 'motorista' : 'garcom')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Novo agendamento
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button onClick={() => setActiveTab('motorista')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === 'motorista' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Truck className="mr-1 inline h-4 w-4" /> Agendamento Motorista
        </button>
        <button onClick={() => setActiveTab('outros')} className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeTab === 'outros' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>
          Outros recursos
        </button>
        {activeTab === 'outros' && (
          <div className="ml-auto flex gap-2">
            <button onClick={() => openModal('garcom')} className="rounded-md border px-3 py-1.5 text-xs">Agendar garçom</button>
            <button onClick={() => openModal('sala')} className="rounded-md border px-3 py-1.5 text-xs">Agendar sala</button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => moveCalendar(-1)} className="rounded-md border p-2 hover:bg-slate-50" aria-label="Período anterior"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setCurrentDate(new Date())} className="rounded-md border px-3 py-2 text-xs font-medium">Hoje</button>
          <button onClick={() => moveCalendar(1)} className="rounded-md border p-2 hover:bg-slate-50" aria-label="Próximo período"><ChevronRight className="h-4 w-4" /></button>
          <strong className="ml-2 text-sm capitalize text-slate-800">{viewMode === 'dia' ? currentDate.toLocaleDateString('pt-BR', { dateStyle: 'full' }) : currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</strong>
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {(['dia', 'semana', 'mes', 'lista'] as CalendarMode[]).map(mode => (
            <button key={mode} onClick={() => setViewMode(mode)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${viewMode === mode ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}>{mode === 'mes' ? 'Mês' : mode[0].toUpperCase() + mode.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="mb-3 flex items-center gap-2 text-xs text-slate-600"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Conflitos são verificados para motorista e veículo durante todo o período de bloqueio.</div>
        {viewMode === 'lista' ? (
          <div className="space-y-2">{sortedSchedules.length ? sortedSchedules.map(item => renderSchedule(item)) : <p className="py-10 text-center text-sm text-slate-500">Nenhum agendamento neste filtro.</p>}</div>
        ) : viewMode === 'mes' ? (
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-600">{day}</div>)}
            {calendarDays.map(day => {
              const items = getSchedulesForDay(day);
              const inMonth = day.getMonth() === currentDate.getMonth();
              return <div key={dateKey(day)} className={`min-h-28 bg-white p-1.5 ${inMonth ? '' : 'opacity-40'}`}>
                <div className="mb-1 text-right text-xs font-medium text-slate-500">{day.getDate()}</div>
                <div className="space-y-1">{items.slice(0, 3).map(item => renderSchedule(item, true))}{items.length > 3 && <div className="px-1 text-[10px] text-slate-500">+{items.length - 3} mais</div>}</div>
              </div>;
            })}
          </div>
        ) : (
          <div className={`grid gap-2 ${viewMode === 'semana' ? 'grid-cols-1 md:grid-cols-7' : 'grid-cols-1'}`}>
            {dayList.map(day => <div key={dateKey(day)} className="min-h-36 rounded-lg border border-slate-200 p-2">
              <div className="mb-2 text-xs font-semibold text-slate-700">{day.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' })}</div>
              <div className="space-y-1">{getSchedulesForDay(day).map(item => renderSchedule(item))}</div>
            </div>)}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3">
          <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-4">
              <div><h2 className="font-semibold text-slate-900">{resourceType === 'motorista' ? 'Agendamento de Motorista' : 'Agendamento de Recurso'}</h2><p className="text-xs text-slate-500">Informe os dados da solicitação e os recursos necessários.</p></div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-md p-2 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto p-5">
              {formConflictWarning && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertTriangle className="h-4 w-4 shrink-0" />{formConflictWarning}</div>}
              {resourceType === 'motorista' ? <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-700">Solicitante da corrida *
                    <input required value={tripRequesterName} onChange={e => setTripRequesterName(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">Centro de custo *
                    <input required value={costCenter} onChange={e => setCostCenter(e.target.value)} placeholder="Ex.: Administrativo" className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">Nome do passageiro *
                    <input required value={passengerName} onChange={e => setPassengerName(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">Motivo / identificação da corrida
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Reunião externa" className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-700">Motorista *
                    <select required value={driverId} onChange={e => setDriverId(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal">{drivers.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
                  </label>
                  <label className="text-xs font-semibold text-slate-700">Veículo *
                    <select required value={vehicleId} onChange={e => setVehicleId(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal">{vehicles.map(item => <option key={item.id} value={item.id}>{item.model} - {item.plate}</option>)}</select>
                  </label>
                </div>
              </> : <>
                <label className="block text-xs font-semibold text-slate-700">Tipo de recurso
                  <select value={resourceType} onChange={e => setResourceType(e.target.value as ResourceType)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal"><option value="garcom">Garçom / Copa</option><option value="sala">Sala / Auditório</option></select>
                </label>
                <label className="block text-xs font-semibold text-slate-700">Título / Motivo
                  <input required value={title} onChange={e => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                </label>
                {resourceType === 'garcom' && <select value={otherResourceId} onChange={e => setOtherResourceId(e.target.value)} className="w-full rounded-lg border p-2.5 text-sm">{waiters.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}
                {resourceType === 'sala' && <select value={otherResourceId} onChange={e => setOtherResourceId(e.target.value)} className="w-full rounded-lg border p-2.5 text-sm"><option value="sala-1">Auditório Master</option><option value="sala-2">Sala de Conselho</option><option value="sala-3">Sala Multiuso</option></select>}
              </>}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-700">Data de saída *
                  <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                </label>
                <label className="text-xs font-semibold text-slate-700">Horário de saída *
                  <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                </label>
                <label className="text-xs font-semibold text-slate-700">Data prevista de desembarque *
                  <input type="date" required value={dropoffDate} onChange={e => setDropoffDate(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                </label>
                <label className="text-xs font-semibold text-slate-700">Horário previsto de desembarque *
                  <input type="time" required value={dropoffTime} onChange={e => setDropoffTime(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                </label>
              </div>
              {resourceType === 'motorista' && <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                <div className="text-xs font-semibold text-slate-700">Após o desembarque, o motorista deverá:</div>
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2"><input type="radio" checked={tripMode === 'somente_levar'} onChange={() => setTripMode('somente_levar')} /> Somente levar</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={tripMode === 'aguardar'} onChange={() => setTripMode('aguardar')} /> Aguardar o passageiro</label>
                </div>
                {tripMode === 'aguardar' ? <label className="block text-xs font-semibold text-slate-700">Previsão de encerramento da espera *
                  <input type="time" required value={waitingUntil} onChange={e => setWaitingUntil(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                </label> : <p className="text-xs text-slate-600">O motorista e o veículo ficarão bloqueados por mais 40 minutos após o desembarque, para permitir o retorno.</p>}
                <p className="text-xs font-medium text-slate-700">Disponibilidade prevista até: {bookingEnd.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</p>
              </div>}
              {resourceType === 'motorista' ? <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-700">Local de origem *
                  <input required value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Endereço de saída" className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                </label>
                <label className="text-xs font-semibold text-slate-700">Destino *
                  <input required value={destination} onChange={e => setDestination(e.target.value)} placeholder="Endereço de destino" className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
                </label>
              </div> : <label className="block text-xs font-semibold text-slate-700">Local *
                <input required value={location} onChange={e => setLocation(e.target.value)} placeholder="Local da reserva" className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
              </label>}
              <label className="block text-xs font-semibold text-slate-700">Observações
                <textarea rows={2} value={notes} onChange={e => setNotes(e.target.value)} className="mt-1 w-full rounded-lg border p-2.5 text-sm font-normal" />
              </label>
              <div className="flex justify-end gap-2 border-t pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border px-4 py-2 text-sm">Cancelar</button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Confirmar agendamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
