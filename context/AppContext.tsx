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
  const [serviceSlaHistory, setServiceSlaHistory] = useState<ServiceSlaChange[]>(() => getStoredData()?.serviceSlaHistory || []);

  const [selectedTicketId, setSelectedTicketIdState] = useState<string | null>(null);

  const [schedules, setSchedules] = useState<ResourceSchedule[]>(() => {
    const stored = getStoredData();
    return stored?.schedules || MOCK_SCHEDULES;
  });

  const [drivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [vehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [waiters] = useState<Waiter[]>(MOCK_WAITERS);
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
        serviceSlaHistory,
        schedules,
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
  }, [tickets, serviceSlaPolicies, serviceSlaHistory, schedules, contracts, inventory, purchaseRequests, notifications, currentUser]);

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

  const createTicket = (data: Partial<Ticket>): Ticket => {
    const nextNumber = tickets.length + 1025;
    const now = new Date();
    const nowIso = now.toISOString();
    const priority = data.priority || 'media';
    const serviceName = data.serviceName || 'Solicitação Geral';
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
      priority,
      status: 'novo',
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

  const createSchedule = (scheduleData: Omit<ResourceSchedule, 'id'>) => {
    // Conflict check
    const startA = new Date(scheduleData.startDateTime).getTime();
    const endA = new Date(scheduleData.endDateTime).getTime();

    const conflict = schedules.find((s) => {
      if (s.status === 'cancelado') return false;
      if (s.resourceId !== scheduleData.resourceId) return false;
      const startB = new Date(s.startDateTime).getTime();
      const endB = new Date(s.endDateTime).getTime();
      // Overlap condition
      return startA < endB && endA > startB;
    });

    if (conflict) {
      return {
        success: false,
        conflict: `Conflito de horário detectado: O recurso "${scheduleData.resourceName}" já possui o agendamento "${conflict.title}" reservado no período selecionado.`,
      };
    }

    const newSchedule: ResourceSchedule = {
      ...scheduleData,
      id: `sch-${Date.now()}`,
    };

    setSchedules((prev) => [newSchedule, ...prev]);
    showToast(`Agendamento "${newSchedule.title}" criado com sucesso!`);
    return { success: true, schedule: newSchedule };
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
    setServiceSlaPolicies(SERVICE_SLA_POLICIES.map((policy) => ({ ...policy, active: true })));
    setServiceSlaHistory([]);
    setSchedules(MOCK_SCHEDULES);
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
