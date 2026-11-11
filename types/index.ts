export type UserRole = 'admin' | 'attendant' | 'manager' | 'requester';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  department: string;
  avatar?: string;
  phone?: string;
}

export type TicketPriority = 'baixa' | 'media' | 'alta' | 'critica';

export type TicketStatus =
  | 'novo'
  | 'em_analise'
  | 'aguardando_info'
  | 'aguardando_aprovacao'
  | 'aguardando_aprovacao_solicitante'
  | 'agendado'
  | 'em_andamento'
  | 'concluido'
  | 'cancelado';

export type ServiceCategory =
  | 'logistica'
  | 'atendimento'
  | 'manutencao'
  | 'documentos'
  | 'viagens'
  | 'telefonia'
  | 'compras'
  | 'pagamentos'
  | 'gestao'
  | 'patrimonio'
  | 'imoveis'
  | 'obras'
  | 'contratos'
  | 'estoque';

export interface TicketComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
  isInternal?: boolean;
}

export interface TicketHistoryEntry {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details?: string;
}

export type ServiceWorkflowType = 1 | 2 | 3;

export interface ServiceWorkflowPolicy {
  category: string;
  serviceName: string;
  workflowType: ServiceWorkflowType;
}

export interface Ticket {
  id: string;
  ticketNumber: string; // e.g. #ADM-1024
  title: string;
  description: string;
  category: ServiceCategory;
  serviceName: string;
  workflowType?: ServiceWorkflowType;
  priority: TicketPriority;
  status: TicketStatus;
  requesterId: string;
  requesterName: string;
  requesterDepartment: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt: string;
  slaDeadline: string; // ISO date string
  slaTotalHours: number;
  slaBusinessDays?: number;
  completedAt?: string;
  location?: string;
  costEstimate?: number;
  comments: TicketComment[];
  history: TicketHistoryEntry[];
  attachments?: { name: string; size: string; type: string }[];
}

export type ResourceType = 'motorista' | 'veiculo' | 'garcom' | 'sala' | 'limpeza' | 'equipamento';

export interface ResourceSchedule {
  id: string;
  title: string;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  requesterId: string;
  requesterName: string;
  department: string;
  startDateTime: string; // ISO string
  endDateTime: string;   // ISO string: fim do bloqueio do recurso
  location: string;
  passengersOrGuests?: number;
  notes?: string;
  status: 'confirmado' | 'pendente' | 'rejeitado' | 'cancelado';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  serviceMode?: 'montado' | 'volante';
  setupDateTime?: string;
  eventDateTime?: string;
  cleaningTeamId?: string;
  cleaningTeamName?: string;
  roomId?: string;
  roomName?: string;
  endTime?: string;
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehicleName?: string;
  tripRequesterName?: string;
  costCenter?: string;
  passengerName?: string;
  origin?: string;
  destination?: string;
  tripMode?: 'aguardar' | 'somente_levar';
  passengerDropoffDateTime?: string;
  waitingUntil?: string;
}

export interface Driver {
  id: string;
  name: string;
  cnh: string;
  phone: string;
  status: 'disponivel' | 'em_viagem' | 'folga';
  assignedVehicle?: string;
  rating: number;
}

export interface Vehicle {
  id: string;
  model: string;
  plate: string;
  year: number;
  status: 'disponivel' | 'em_uso' | 'manutencao';
  currentKm: number;
  fuelLevel: string;
  lastMaintenance: string;
  nextRevisionKm: number;
}

export interface Waiter {
  id: string;
  name: string;
  shift: 'manha' | 'tarde' | 'integral';
  status: 'disponivel' | 'alocado' | 'folga';
  specialties: string[];
}

export interface Supplier {
  id: string;
  companyName: string;
  tradeName: string;
  cnpj: string;
  category: string;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number;
  activeContractsCount: number;
}

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  supplierId: string;
  supplierName: string;
  category: ServiceCategory;
  monthlyValue: number;
  startDate: string;
  endDate: string;
  responsibleName: string;
  autoRenew: boolean;
  status: 'vigente' | 'vencendo' | 'renovado' | 'encerrado';
  attachmentsCount: number;
  notes?: string;
}

export interface Asset {
  id: string;
  tagNumber: string; // Plaqueta tombamento
  name: string;
  category: 'informatica' | 'mobiliario' | 'climatizacao' | 'maquinario' | 'veiculo';
  brandModel: string;
  acquisitionDate: string;
  acquisitionValue: number;
  location: string;
  responsibleName: string;
  status: 'em_uso' | 'em_manutencao' | 'reserva' | 'baixado';
}

export interface RealEstate {
  id: string;
  name: string;
  type: 'proprio' | 'alugado';
  address: string;
  city: string;
  areaM2: number;
  monthlyRentOrCost: number;
  contractExpires?: string;
  tenantOrOwner: string;
  occupancyStatus: 'ocupado' | 'parcial' | 'desocupado';
  insuranceExpires: string;
}

export interface WorkProject {
  id: string;
  title: string;
  type: 'nova_sede' | 'reforma' | 'adequacao';
  contractor: string;
  budget: number;
  spent: number;
  progressPercent: number;
  startDate: string;
  targetEndDate: string;
  status: 'em_planejamento' | 'em_andamento' | 'em_medicao' | 'concluida';
  currentStage: string;
  pendingIssuesCount: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: 'escritorio' | 'limpeza' | 'copa' | 'ti' | 'eletrica';
  currentStock: number;
  minStock: number;
  unit: string;
  lastUpdated: string;
  location: string;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  title: string;
  requesterName: string;
  department: string;
  estimatedValue: number;
  category: string;
  status: 'rascunho' | 'aguardando_aprovacao' | 'aprovado' | 'rejeitado' | 'cotacao' | 'pedido_emitido';
  createdAt: string;
  justification: string;
  supplierSuggestions?: string;
}

export interface DocumentGED {
  id: string;
  title: string;
  type: 'Contrato' | 'Licença' | 'Alvará' | 'Seguro' | 'Laudo' | 'Regulamento';
  category: string;
  responsibleName: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'valido' | 'a_vencer' | 'vencido' | 'permanente';
  tags: string[];
  fileSize: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'alert' | 'success';
  linkTarget?: { tab: string; subTab?: string; ticketId?: string };
}


export interface ServiceSlaPolicy {
  category: string;
  serviceName: string;
  businessDays: number;
  active: boolean;
}

export interface ServiceSlaChange {
  id: string;
  serviceName: string;
  previousBusinessDays: number;
  newBusinessDays: number;
  previousActive: boolean;
  newActive: boolean;
  changedAt: string;
  changedBy: string;
}


export interface MeetingRoom {
  id: string;
  name: string;
  capacity?: number;
  location?: string;
  active: boolean;
}

export interface ServiceLocation {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface CleaningTeam {
  id: string;
  name: string;
  members?: number;
  active: boolean;
}
