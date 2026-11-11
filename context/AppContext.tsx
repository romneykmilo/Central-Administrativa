'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Ticket,
  TicketStatus,
  TicketPriority,
  ServiceCategory,
  ResourceSchedule,
  Contract,
  InventoryItem,
  PurchaseRequest,
  DocumentGED,
  Asset,
  RealEstate,
  WorkProject,
  NotificationItem,
  Driver,
  Vehicle,
  Waiter,
  Supplier,
  ServiceSlaPolicy,
  ServiceSlaChange,
  MeetingRoom,
  ServiceLocation,
  CleaningTeam,
  ServiceWorkflowPolicy,
  ServiceWorkflowType,
} from '@/types';
import { addBusinessSlaDeadline } from '@/lib/mock-data';
import {
  MOCK_USERS,
  MOCK_TICKETS,
  MOCK_DRIVERS,
  MOCK_VEHICLES,
  MOCK_WAITERS,
  MOCK_SUPPLIERS,
  MOCK_SCHEDULES,
  MOCK_CONTRACTS,
  MOCK_ASSETS,
  MOCK_INVENTORY,
  MOCK_GED_DOCUMENTS,
  MOCK_REAL_ESTATE,
  MOCK_WORKS,
  MOCK_PURCHASE_REQUESTS,
  MOCK_NOTIFICATIONS,
  SERVICE_SLA_POLICIES,
  SERVICE_WORKFLOW_POLICIES,
} from '@/lib/mock-data';

interface AppContextType {
  // Current user & Auth simulation
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  switchUserRole: (userId: string) => void;

  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  subTab?: string;
  setSubTab: (subTab?: string) => void;

  // Tickets & Services
  tickets: Ticket[];
  serviceSlaPolicies: ServiceSlaPolicy[];
  serviceWorkflowPolicies: ServiceWorkflowPolicy[];
  updateServiceWorkflowPolicy: (serviceName: string, workflowType: ServiceWorkflowType) => void;
  approveManagerWorkflow: (ticketId: string) => void;
  submitTicketForRequesterApproval: (ticketId: string) => void;
  respondToRequesterApproval: (ticketId: string, approved: boolean, note: string) => void;
  serviceSlaHistory: ServiceSlaChange[];
  updateServiceSlaPolicy: (serviceName: string, changes: { businessDays?: number; active?: boolean }) => void;
  selectedTicket: Ticket | null;
  setSelectedTicketId: (id: string | null) => void;
  createTicket: (data: Partial<Ticket>) => Ticket;
  updateTicketStatus: (ticketId: string, status: TicketStatus, note?: string) => void;
  addTicketComment: (ticketId: string, content: string, isInternal?: boolean) => void;
  assignTicket: (ticketId: string, assignedToId: string, assignedToName: string) => void;

  // Schedules
  schedules: ResourceSchedule[];
  drivers: Driver[];
  vehicles: Vehicle[];
  waiters: Waiter[];
  meetingRooms: MeetingRoom[];
  serviceLocations: ServiceLocation[];
  cleaningTeams: CleaningTeam[];
  saveDriver: (item: Driver) => void;
  removeDriver: (id: string) => void;
  saveVehicle: (item: Vehicle) => void;
  removeVehicle: (id: string) => void;
  saveWaiter: (item: Waiter) => void;
  removeWaiter: (id: string) => void;
  saveMeetingRoom: (item: MeetingRoom) => void;
  removeMeetingRoom: (id: string) => void;
  saveServiceLocation: (item: ServiceLocation) => void;
  removeServiceLocation: (id: string) => void;
  saveCleaningTeam: (item: CleaningTeam) => void;
  removeCleaningTeam: (id: string) => void;
  approveSchedule: (id: string) => void;
  rejectSchedule: (id: string, reason?: string) => void;
  createSchedule: (schedule: Omit<ResourceSchedule, 'id'>) => { success: boolean; schedule?: ResourceSchedule; conflict?: string };
  cancelSchedule: (id: string) => void;

  // Other modules
  contracts: Contract[];
  inventory: InventoryItem[];
  purchaseRequests: PurchaseRequest[];
  gedDocuments: DocumentGED[];
  assets: Asset[];
  realEstate: RealEstate[];
  works: WorkProject[];
  suppliers: Supplier[];

  // Actions
  updateInventoryStock: (itemId: string, delta: number, actionType: 'entrada' | 'saida') => void;
  approvePurchaseRequest: (requestId: string) => void;
  rejectPurchaseRequest: (requestId: string) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  unreadNotificationsCount: number;

  // Modals & UI helpers
  isNewTicketOpen: boolean;
  setIsNewTicketOpen: (open: boolean) => void;
  ticketPrefill: Partial<Ticket> | null;
  openNewTicketWithPrefill: (prefill?: Partial<Ticket>) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Reset
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'central_administrativa_store_v1';

function getStoredData() {
  if (typeof window === 'undefined') return null;
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Lazy state initializers so no setState in effect!
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const stored = getStoredData();
    if (stored?.userId) {
      const found = MOCK_USERS.find((u) => u.id === stored.userId);
      if (found) return found;
    }
    return MOCK_USERS[0];
  });

  const [activeTab, setActiveTab] = useState<string>('home');
  const [subTab, setSubTab] = useState<string | undefined>(undefined);

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const stored = getStoredData();
    return stored?.tickets || MOCK_TICKETS;
  });

  const [serviceSlaPolicies, setServiceSlaPolicies] = useState<ServiceSlaPolicy[]>(() => {
    const stored = getStoredData();
    return stored?.serviceSlaPolicies || SERVICE_SLA_POLICIES.map((policy) => ({ ...policy, active: true }));
  });
  const [serviceWorkflowPolicies, setServiceWorkflowPolicies] = useState<ServiceWorkflowPolicy[]>(() => getStoredData()?.serviceWorkflowPolicies || [...SERVICE_WORKFLOW_POLICIES]);
  const [serviceSlaHistory, setServiceSlaHistory] = useState<ServiceSlaChange[]>(() => getStoredData()?.serviceSlaHistory || []);

  const [selectedTicketId, setSelectedTicketIdState] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<ResourceSchedule[]>(() => {
    const stored = getStoredData();
    return stored?.schedules || MOCK_SCHEDULES;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => getStoredData()?.drivers || MOCK_DRIVERS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getStoredData()?.vehicles || MOCK_VEHICLES);
  const [waiters, setWaiters] = useState<Waiter[]>(() => getStoredData()?.waiters || MOCK_WAITERS);
  const [meetingRooms, setMeetingRooms] = useState<MeetingRoom[]>(() => getStoredData()?.meetingRooms || [
    { id: 'room-1', name: 'Auditório Master', capacity: 120, location: 'Sede Administrativa', active: true },
    { id: 'room-2', name: 'Sala de Conselho', capacity: 24, location: 'Sede Administrativa', active: true },
    { id: 'room-3', name: 'Sala Multiuso', capacity: 30, location: 'Sede Administrativa', active: true },
  ]);
  const [serviceLocations, setServiceLocations] = useState<ServiceLocation[]>(() => getStoredData()?.serviceLocations || [
    { id: 'loc-1', name: 'Sede Administrativa', active: true },
    { id: 'loc-2', name: 'Auditório Master', active: true },
    { id: 'loc-3', name: 'Copa', active: true },
  ]);
  const [cleaningTeams, setCleaningTeams] = useState<CleaningTeam[]>(() => getStoredData()?.cleaningTeams || [
    { id: 'clean-1', name: 'Equipe de Limpeza 1', members: 4, active: true },
    { id: 'clean-2', name: 'Equipe de Limpeza 2', members: 4, active: true },
  ]);
  const [suppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);

  const [contracts, setContracts] = useState<Contract[]>(() => {
    const stored = getStoredData();
    return stored?.contracts || MOCK_CONTRACTS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const stored = getStoredData();
    return stored?.inventory || MOCK_INVENTORY;
  });

  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(() => {
    const stored = getStoredData();
    return stored?.purchaseRequests || MOCK_PURCHASE_REQUESTS;
  });

  const [gedDocuments, setGedDocuments] = useState<DocumentGED[]>(MOCK_GED_DOCUMENTS);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [realEstate, setRealEstate] = useState<RealEstate[]>(MOCK_REAL_ESTATE);
  const [works, setWorks] = useState<WorkProject[]>(MOCK_WORKS);

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const stored = getStoredData();
    return stored?.notifications || MOCK_NOTIFICATIONS;
  });

  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [ticketPrefill, setTicketPrefill] = useState<Partial<Ticket> | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to LocalStorage on critical state changes
  useEffect(() => {
    try {
      const payload = {
        tickets,
        serviceSlaPolicies,
        serviceWorkflowPolicies,
        serviceSlaHistory,
        schedules,
        drivers,
        vehicles,
        waiters,
        meetingRooms,
        serviceLocations,
        cleaningTeams,
        contracts,
        inventory,
        purchaseRequests,
        notifications,
        userId: currentUser.id,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore
    }
  }, [tickets, serviceSlaPolicies, serviceWorkflowPolicies, serviceSlaHistory, schedules, drivers, vehicles, waiters, meetingRooms, serviceLocations, cleaningTeams, contracts, inventory, purchaseRequests, notifications, currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const switchUserRole = (userId: string) => {
    const target = MOCK_USERS.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      showToast(`Perfil alterado para: ${target.name} (${target.roleLabel})`);
    }
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || null;

  const setSelectedTicketId = (id: string | null) => {
    setSelectedTicketIdState(id);
  };

  const openNewTicketWithPrefill = (prefill?: Partial<Ticket>) => {
    setTicketPrefill(prefill || null);
    setIsNewTicketOpen(true);
  };

  const updateServiceSlaPolicy = (serviceName: string, changes: { businessDays?: number; active?: boolean }) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') {
      showToast('Apenas gestores podem alterar os prazos de SLA.');
      return;
    }
    const current = serviceSlaPolicies.find((policy) => policy.serviceName === serviceName);
    if (!current) return;
    const nextBusinessDays = changes.businessDays ?? current.businessDays;
    if (!Number.isInteger(nextBusinessDays) || nextBusinessDays < 1 || nextBusinessDays > 365) {
      showToast('Informe um prazo entre 1 e 365 dias úteis.');
      return;
    }
    const nextActive = changes.active ?? current.active;
    if (nextBusinessDays === current.businessDays && nextActive === current.active) return;
    const change: ServiceSlaChange = {
      id: `sla-${Date.now()}`,
      serviceName,
      previousBusinessDays: current.businessDays,
      newBusinessDays: nextBusinessDays,
      previousActive: current.active,
      newActive: nextActive,
      changedAt: new Date().toISOString(),
      changedBy: currentUser.name,
    };
    setServiceSlaPolicies((prev) => prev.map((policy) => policy.serviceName === serviceName
      ? { ...policy, businessDays: nextBusinessDays, active: nextActive }
      : policy));
    setServiceSlaHistory((prev) => [change, ...prev]);
    showToast(`Configuração de SLA atualizada: ${serviceName}. Chamados existentes mantêm o prazo original.`);
  };

  const updateServiceWorkflowPolicy = (serviceName: string, workflowType: ServiceWorkflowType) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') { showToast('Apenas gestores podem alterar os fluxos.'); return; }
    setServiceWorkflowPolicies((prev) => prev.map((policy) => policy.serviceName === serviceName ? { ...policy, workflowType } : policy));
    showToast(`Fluxo do serviço ${serviceName} atualizado. A alteração vale para novos chamados.`);
  };

  const approveManagerWorkflow = (ticketId: string) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') { showToast('Apenas gestores podem aprovar esta solicitação.'); return; }
    const nowIso = new Date().toISOString();
    setTickets((prev) => prev.map((ticket) => {
      if (ticket.id !== ticketId || (ticket.workflowType || 1) !== 2 || ticket.status !== 'aguardando_aprovacao') return ticket;
      return { ...ticket, status: 'concluido', completedAt: nowIso, history: [...ticket.history, { id: `h-${Date.now()}`, timestamp: nowIso, action: 'Solicitação aprovada pelo gestor e concluída', performedBy: currentUser.name }] };
    }));
    showToast('Solicitação aprovada e concluída.');
  };

  const submitTicketForRequesterApproval = (ticketId: string) => {
    if (!['admin', 'manager', 'attendant'].includes(currentUser.role)) { showToast('Apenas a equipe responsável pode encaminhar para aprovação.'); return; }
    const nowIso = new Date().toISOString();
    setTickets((prev) => prev.map((ticket) => {
      if (ticket.id !== ticketId || (ticket.workflowType || 1) !== 3 || !['em_analise', 'em_andamento'].includes(ticket.status)) return ticket;
      return { ...ticket, status: 'aguardando_aprovacao_solicitante', history: [...ticket.history, { id: `h-${Date.now()}`, timestamp: nowIso, action: 'Atendimento encaminhado ao solicitante para aprovação', performedBy: currentUser.name }] };
    }));
    showToast('Resultado encaminhado ao solicitante para aprovação.');
  };

  const respondToRequesterApproval = (ticketId: string, approved: boolean, note: string) => {
    const ticket = tickets.find((item) => item.id === ticketId);
    if (!ticket || ticket.workflowType !== 3 || ticket.status !== 'aguardando_aprovacao_solicitante') return;
    if (ticket.requesterId !== currentUser.id) { showToast('Somente o solicitante pode responder a esta aprovação.'); return; }
    if (!approved && !note.trim()) { showToast('Informe o que precisa ser revisto para solicitar nova análise.'); return; }
    const nowIso = new Date().toISOString();
    const action = approved ? 'Resultado aprovado pelo solicitante e chamado concluído' : 'Solicitante pediu ajustes; chamado retornou para nova análise';
    setTickets((prev) => prev.map((item) => item.id !== ticketId ? item : {
      ...item,
      status: approved ? 'concluido' : 'em_analise',
      completedAt: approved ? nowIso : undefined,
      comments: note.trim() ? [...item.comments, { id: `c-${Date.now()}`, authorId: currentUser.id, authorName: currentUser.name, authorRole: currentUser.roleLabel, content: note.trim(), createdAt: nowIso, isInternal: false }] : item.comments,
      history: [...item.history, { id: `h-${Date.now()}`, timestamp: nowIso, action, performedBy: currentUser.name, details: note.trim() || undefined }],
    }));
    showToast(approved ? 'Aprovação registrada e chamado concluído.' : 'Solicitação devolvida à equipe para nova análise.');
  };

  const createTicket = (data: Partial<Ticket>): Ticket => {
    const nextNumber = tickets.length + 1025;
    const now = new Date();
    const nowIso = now.toISOString();
    const priority = data.priority || 'media';
    const serviceName = data.serviceName || 'Solicitação Geral';
    const workflowType = serviceWorkflowPolicies.find((policy) => policy.serviceName === serviceName)?.workflowType || 1;
    const initialStatus: TicketStatus = workflowType === 2 ? 'aguardando_aprovacao' : workflowType === 3 ? 'em_analise' : 'novo';
    const slaPolicy = serviceSlaPolicies.find((policy) => policy.serviceName === serviceName && policy.active);
    const slaBusinessDays = slaPolicy?.businessDays;
    const hours = slaBusinessDays ? slaBusinessDays * 10 : 0;
    const deadline = slaBusinessDays ? addBusinessSlaDeadline(now, slaBusinessDays).toISOString() : '';

    const newTicket: Ticket = {
      id: `t-${nextNumber}`,
      ticketNumber: `#ADM-${nextNumber}`,
      title: data.title || 'Chamado Administrativo',
      description: data.description || '',
      category: data.category || 'atendimento',
      serviceName,
      workflowType,
      priority,
      status: initialStatus,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterDepartment: currentUser.department,
      createdAt: nowIso,
      slaDeadline: deadline,
      slaTotalHours: hours,
      slaBusinessDays,
      location: data.location || 'Sede Administrativa',
      costEstimate: data.costEstimate,
      comments: [],
      history: [
        {
          id: `h-${Date.now()}`,
          timestamp: nowIso,
          action: 'Chamado Criado',
          performedBy: currentUser.name,
        },
      ],
      attachments: data.attachments || [],
    };

    setTickets((prev) => [newTicket, ...prev]);

    // Create system notification
    const newNotif: NotificationItem = {
      id: `not-${Date.now()}`,
      title: 'Chamado Aberto com Sucesso',
      message: `${newTicket.ticketNumber} - ${newTicket.title}`,
      timestamp: 'Agora',
      read: false,
      type: 'success',
      linkTarget: { tab: 'central', ticketId: newTicket.id },
    };
    setNotifications((prev) => [newNotif, ...prev]);

    showToast(`Chamado ${newTicket.ticketNumber} aberto com sucesso!`);
    setIsNewTicketOpen(false);
    setTicketPrefill(null);
    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, status: TicketStatus, note?: string) => {
    const target = tickets.find((ticket) => ticket.id === ticketId);
    if (target && (target.workflowType || 1) !== 1) { showToast('Este chamado deve seguir as etapas de aprovação definidas para seu serviço.'); return; }
    const nowIso = new Date().toISOString();
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const newHistory = [
          ...t.history,
          {
            id: `h-${Date.now()}`,
            timestamp: nowIso,
            action: `Status alterado para "${status.replace('_', ' ').toUpperCase()}"`,
            performedBy: currentUser.name,
            details: note,
          },
        ];
        return {
          ...t,
          status,
          completedAt: status === 'concluido' ? nowIso : t.completedAt,
          history: newHistory,
        };
      })
    );
    showToast(`Status do chamado atualizado.`);
  };

  const addTicketComment = (ticketId: string, content: string, isInternal: boolean = false) => {
    const newComment = {
      id: `c-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorRole: currentUser.roleLabel,
      content,
      createdAt: new Date().toISOString(),
      isInternal,
    };

    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          comments: [...t.comments, newComment],
        };
      })
    );
    showToast('Comentário registrado.');
  };

  const assignTicket = (ticketId: string, assignedToId: string, assignedToName: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          assignedToId,
          assignedToName,
          status: t.status === 'novo' ? 'em_analise' : t.status,
          history: [
            ...t.history,
            {
              id: `h-${Date.now()}`,
              timestamp: new Date().toISOString(),
              action: `Chamado atribuído a ${assignedToName}`,
              performedBy: currentUser.name,
            },
          ],
        };
      })
    );
    showToast(`Chamado atribuído a ${assignedToName}`);
  };

  const saveDriver = (item: Driver) => setDrivers(prev => prev.some(x => x.id === item.id) ? prev.map(x => x.id === item.id ? item : x) : [...prev, item]);
  const removeDriver = (id: string) => setDrivers(prev => prev.filter(x => x.id !== id));
  const saveVehicle = (item: Vehicle) => setVehicles(prev => prev.some(x => x.id === item.id) ? prev.map(x => x.id === item.id ? item : x) : [...prev, item]);
  const removeVehicle = (id: string) => setVehicles(prev => prev.filter(x => x.id !== id));
  const saveWaiter = (item: Waiter) => setWaiters(prev => prev.some(x => x.id === item.id) ? prev.map(x => x.id === item.id ? item : x) : [...prev, item]);
  const removeWaiter = (id: string) => setWaiters(prev => prev.filter(x => x.id !== id));
  const saveMeetingRoom = (item: MeetingRoom) => setMeetingRooms(prev => prev.some(x => x.id === item.id) ? prev.map(x => x.id === item.id ? item : x) : [...prev, item]);
  const removeMeetingRoom = (id: string) => setMeetingRooms(prev => prev.filter(x => x.id !== id));
  const saveServiceLocation = (item: ServiceLocation) => setServiceLocations(prev => prev.some(x => x.id === item.id) ? prev.map(x => x.id === item.id ? item : x) : [...prev, item]);
  const removeServiceLocation = (id: string) => setServiceLocations(prev => prev.filter(x => x.id !== id));
  const saveCleaningTeam = (item: CleaningTeam) => setCleaningTeams(prev => prev.some(x => x.id === item.id) ? prev.map(x => x.id === item.id ? item : x) : [...prev, item]);
  const removeCleaningTeam = (id: string) => setCleaningTeams(prev => prev.filter(x => x.id !== id));

  const createSchedule = (scheduleData: Omit<ResourceSchedule, 'id'>) => {
    const startA = new Date(scheduleData.startDateTime).getTime();
    const endA = new Date(scheduleData.endDateTime).getTime();
    const requestedResourceIds = [scheduleData.resourceId, scheduleData.driverId, scheduleData.vehicleId, scheduleData.roomId, scheduleData.cleaningTeamId].filter(Boolean) as string[];

    const conflict = schedules.find((s) => {
      if (s.status === 'cancelado' || s.status === 'rejeitado') return false;
      const existingResourceIds = [s.resourceId, s.driverId, s.vehicleId, s.roomId, s.cleaningTeamId].filter(Boolean) as string[];
      if (!requestedResourceIds.some((id) => existingResourceIds.includes(id))) return false;
      const startB = new Date(s.startDateTime).getTime();
      const endB = new Date(s.endDateTime).getTime();
      return startA < endB && endA > startB;
    });

    if (conflict) {
      return {
        success: false,
        conflict: `Conflito de horário: recurso, equipe ou veículo já está reservado no agendamento "${conflict.title}".`,
      };
    }

    const newSchedule: ResourceSchedule = {
      ...scheduleData,
      id: `sch-${Date.now()}`,
      status: 'pendente',
    };

    setSchedules((prev) => [newSchedule, ...prev]);
    showToast(`Solicitação de agendamento "${newSchedule.title}" enviada para aprovação.`);
    return { success: true, schedule: newSchedule };
  };

  const approveSchedule = (id: string) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') { showToast('Apenas gestores podem aprovar agendamentos.'); return; }
    setSchedules(prev => prev.map(s => s.id === id && s.status === 'pendente' ? { ...s, status: 'confirmado', approvedBy: currentUser.name, approvedAt: new Date().toISOString() } : s));
    showToast('Agendamento aprovado e confirmado.');
  };

  const rejectSchedule = (id: string, reason?: string) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'manager') { showToast('Apenas gestores podem rejeitar agendamentos.'); return; }
    setSchedules(prev => prev.map(s => s.id === id && s.status === 'pendente' ? { ...s, status: 'rejeitado', approvedBy: currentUser.name, approvedAt: new Date().toISOString(), rejectionReason: reason } : s));
    showToast('Solicitação de agendamento rejeitada.');
  };

  const cancelSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'cancelado' } : s))
    );
    showToast('Agendamento cancelado.');
  };

  const updateInventoryStock = (itemId: string, delta: number, actionType: 'entrada' | 'saida') => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newStock = Math.max(0, item.currentStock + (actionType === 'entrada' ? delta : -delta));
        return {
          ...item,
          currentStock: newStock,
          lastUpdated: 'Agora',
        };
      })
    );
    showToast(`Estoque atualizado com sucesso (${actionType === 'entrada' ? '+' : '-'}${delta}).`);
  };

  const approvePurchaseRequest = (requestId: string) => {
    setPurchaseRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'aprovado' } : req))
    );
    showToast(`Solicitação de compra ${requestId} aprovada com sucesso.`);
  };

  const rejectPurchaseRequest = (requestId: string) => {
    setPurchaseRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: 'rejeitado' } : req))
    );
    showToast(`Solicitação de compra rejeitada.`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Todas as notificações marcadas como lidas.');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const resetAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setTickets(MOCK_TICKETS);
    setServiceWorkflowPolicies([...SERVICE_WORKFLOW_POLICIES]);
    setServiceSlaPolicies(SERVICE_SLA_POLICIES.map((policy) => ({ ...policy, active: true })));
    setServiceSlaHistory([]);
    setSchedules(MOCK_SCHEDULES);
    setDrivers(MOCK_DRIVERS);
    setVehicles(MOCK_VEHICLES);
    setWaiters(MOCK_WAITERS);
    setMeetingRooms([{ id: 'room-1', name: 'Auditório Master', capacity: 120, location: 'Sede Administrativa', active: true }, { id: 'room-2', name: 'Sala de Conselho', capacity: 24, location: 'Sede Administrativa', active: true }, { id: 'room-3', name: 'Sala Multiuso', capacity: 30, location: 'Sede Administrativa', active: true }]);
    setServiceLocations([{ id: 'loc-1', name: 'Sede Administrativa', active: true }, { id: 'loc-2', name: 'Auditório Master', active: true }, { id: 'loc-3', name: 'Copa', active: true }]);
    setCleaningTeams([{ id: 'clean-1', name: 'Equipe de Limpeza 1', members: 4, active: true }, { id: 'clean-2', name: 'Equipe de Limpeza 2', members: 4, active: true }]);
    setContracts(MOCK_CONTRACTS);
    setInventory(MOCK_INVENTORY);
    setPurchaseRequests(MOCK_PURCHASE_REQUESTS);
    setGedDocuments(MOCK_GED_DOCUMENTS);
    setAssets(MOCK_ASSETS);
    setRealEstate(MOCK_REAL_ESTATE);
    setWorks(MOCK_WORKS);
    setNotifications(MOCK_NOTIFICATIONS);
    setCurrentUser(MOCK_USERS[0]);
    showToast('Dados restaurados para o padrão de demonstração.');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: MOCK_USERS,
        switchUserRole,
        activeTab,
        setActiveTab,
        subTab,
        setSubTab,
        tickets,
        serviceSlaPolicies,
        serviceWorkflowPolicies,
        updateServiceWorkflowPolicy,
        approveManagerWorkflow,
        submitTicketForRequesterApproval,
        respondToRequesterApproval,
        serviceSlaHistory,
        updateServiceSlaPolicy,
        selectedTicket,
        setSelectedTicketId,
        createTicket,
        updateTicketStatus,
        addTicketComment,
        assignTicket,
        schedules,
        drivers,
        vehicles,
        waiters,
        meetingRooms,
        serviceLocations,
        cleaningTeams,
        saveDriver,
        removeDriver,
        saveVehicle,
        removeVehicle,
        saveWaiter,
        removeWaiter,
        saveMeetingRoom,
        removeMeetingRoom,
        saveServiceLocation,
        removeServiceLocation,
        saveCleaningTeam,
        removeCleaningTeam,
        approveSchedule,
        rejectSchedule,
        createSchedule,
        cancelSchedule,
        contracts,
        inventory,
        purchaseRequests,
        gedDocuments,
        assets,
        realEstate,
        works,
        suppliers,
        updateInventoryStock,
        approvePurchaseRequest,
        rejectPurchaseRequest,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        isNewTicketOpen,
        setIsNewTicketOpen,
        ticketPrefill,
        openNewTicketWithPrefill,
        isSearchOpen,
        setIsSearchOpen,
        toastMessage,
        showToast,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
