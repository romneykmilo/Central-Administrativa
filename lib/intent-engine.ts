import { ServiceCategory, TicketPriority } from '@/types';

export interface IntentResult {
  matched: boolean;
  intentKey: string;
  title: string;
  category: ServiceCategory;
  serviceName: string;
  suggestedPriority: TicketPriority;
  suggestedActionLabel: string;
  navigationTarget: {
    tab: string;
    subTab?: string;
  };
  explanation: string;
  prefill?: {
    title: string;
    description: string;
    category: ServiceCategory;
    serviceName: string;
    priority: TicketPriority;
    location?: string;
  };
}

export function parseUserIntent(input: string): IntentResult | null {
  const normalized = input.toLowerCase().trim();
  if (!normalized) return null;

  // 1. Motorista / Transporte / Carro / Veículo
  if (
    normalized.includes('motorista') ||
    normalized.includes('carro') ||
    normalized.includes('transporte') ||
    normalized.includes('congonhas') ||
    normalized.includes('guarulhos') ||
    normalized.includes('aeroporto') ||
    normalized.includes('levar') ||
    normalized.includes('buscar') ||
    normalized.includes('translado') ||
    normalized.includes('van')
  ) {
    const isTomorrow = normalized.includes('amanhã') || normalized.includes('amanha');
    const isAirport = normalized.includes('aeroporto') || normalized.includes('congonhas') || normalized.includes('guarulhos');

    return {
      matched: true,
      intentKey: 'driver_logistics',
      title: 'Solicitar Motorista ou Veículo',
      category: 'logistica',
      serviceName: 'Motorista Executivo / Mobilidade',
      suggestedPriority: 'alta',
      suggestedActionLabel: 'Agendar Motorista',
      navigationTarget: { tab: 'logistica', subTab: 'motoristas' },
      explanation: 'Identificado pedido de transporte corporativo e mobilidade.',
      prefill: {
        title: isAirport ? 'Transporte Executivo para Aeroporto' : 'Agendamento de Motorista Corporativo',
        description: input,
        category: 'logistica',
        serviceName: 'Motorista Executivo',
        priority: 'alta',
        location: isAirport ? 'Aeroporto de Congonhas / Guarulhos' : 'Sede Corporativa',
      },
    };
  }

  // 2. Ar-condicionado / Climatização / Manutenção
  if (
    normalized.includes('ar condicionado') ||
    normalized.includes('ar-condicionado') ||
    normalized.includes('arcondicionado') ||
    normalized.includes('gelando') ||
    normalized.includes('climatiz') ||
    normalized.includes('quebrado') ||
    normalized.includes('vazamento') ||
    normalized.includes('manuten') ||
    normalized.includes('lampada') ||
    normalized.includes('lâmpada') ||
    normalized.includes('eletric') ||
    normalized.includes('hidraulic') ||
    normalized.includes('porta') ||
    normalized.includes('fechadura')
  ) {
    const isAC = normalized.includes('ar');
    return {
      matched: true,
      intentKey: 'maintenance',
      title: isAC ? 'Manutenção de Ar-Condicionado' : 'Chamado de Manutenção Predial',
      category: 'manutencao',
      serviceName: isAC ? 'Climatização e Ar-Condicionado' : 'Manutenção Geral e Elétrica',
      suggestedPriority: isAC || normalized.includes('vazamento') ? 'alta' : 'media',
      suggestedActionLabel: 'Abrir Chamado de Manutenção',
      navigationTarget: { tab: 'manutencao' },
      explanation: 'Identificada necessidade de suporte técnico predial ou reparo de instalações.',
      prefill: {
        title: isAC ? 'Reparo / Manutenção de Ar-Condicionado' : 'Reparo em Instalações Prediais',
        description: input,
        category: 'manutencao',
        serviceName: isAC ? 'Climatização e Ar-Condicionado' : 'Manutenção Geral',
        priority: 'alta',
      },
    };
  }

  // 3. Garçom / Copa / Café / Reunião
  if (
    normalized.includes('garçom') ||
    normalized.includes('garcom') ||
    normalized.includes('copa') ||
    normalized.includes('café') ||
    normalized.includes('cafe') ||
    normalized.includes('coquetel') ||
    normalized.includes('evento') ||
    normalized.includes('lanche')
  ) {
    return {
      matched: true,
      intentKey: 'waiter_catering',
      title: 'Agendar Garçom / Serviço de Copa',
      category: 'atendimento',
      serviceName: 'Copa & Garçom',
      suggestedPriority: 'media',
      suggestedActionLabel: 'Agendar Atendimento',
      navigationTarget: { tab: 'agendamentos', subTab: 'garcom' },
      explanation: 'Identificado pedido de atendimento com serviço de garçom ou coffee break.',
      prefill: {
        title: 'Serviço de Copa / Garçom para Reunião ou Evento',
        description: input,
        category: 'atendimento',
        serviceName: 'Copa & Garçom',
        priority: 'media',
      },
    };
  }

  // 4. Limpeza / Higienização
  if (
    normalized.includes('limpeza') ||
    normalized.includes('limpar') ||
    normalized.includes('faxina') ||
    normalized.includes('sujeira') ||
    normalized.includes('higien')
  ) {
    return {
      matched: true,
      intentKey: 'cleaning',
      title: 'Solicitar Limpeza de Ambiente',
      category: 'atendimento',
      serviceName: 'Limpeza e Facilities',
      suggestedPriority: 'media',
      suggestedActionLabel: 'Solicitar Limpeza',
      navigationTarget: { tab: 'atendimento' },
      explanation: 'Identificada demanda para a equipe de limpeza e higienização predial.',
      prefill: {
        title: 'Higienização e Limpeza de Sala / Ambiente',
        description: input,
        category: 'atendimento',
        serviceName: 'Limpeza e Facilities',
        priority: 'media',
      },
    };
  }

  // 5. Viagens / Passagens / Hotel / Hospedagem
  if (
    normalized.includes('viagem') ||
    normalized.includes('passagem') ||
    normalized.includes('aérea') ||
    normalized.includes('aerea') ||
    normalized.includes('hotel') ||
    normalized.includes('hospedagem') ||
    normalized.includes('voo')
  ) {
    return {
      matched: true,
      intentKey: 'travel',
      title: 'Solicitar Viagem, Passagem ou Hotel',
      category: 'viagens',
      serviceName: 'Passagens & Hospedagem',
      suggestedPriority: 'media',
      suggestedActionLabel: 'Solicitar Viagem',
      navigationTarget: { tab: 'viagens' },
      explanation: 'Identificado pedido de emissão de passagens ou reserva de hospedagem.',
      prefill: {
        title: 'Solicitação de Viagem Corporativa / Hospedagem',
        description: input,
        category: 'viagens',
        serviceName: 'Passagens & Hospedagem',
        priority: 'media',
      },
    };
  }

  // 6. Contrato / Documento / GED / Alvará / Seguro
  if (
    normalized.includes('contrato') ||
    normalized.includes('documento') ||
    normalized.includes('ged') ||
    normalized.includes('alvará') ||
    normalized.includes('alvara') ||
    normalized.includes('licença') ||
    normalized.includes('licenca') ||
    normalized.includes('apólice') ||
    normalized.includes('apolice') ||
    normalized.includes('seguro')
  ) {
    return {
      matched: true,
      intentKey: 'contracts_ged',
      title: 'Consultar Contratos ou Documentos (GED)',
      category: 'documentos',
      serviceName: 'Gestão de Contratos e Documentos',
      suggestedPriority: 'media',
      suggestedActionLabel: 'Acessar Módulo GED / Contratos',
      navigationTarget: { tab: 'contratos' },
      explanation: 'Identificada consulta a documentos jurídicos, certidões ou contratos.',
      prefill: {
        title: 'Consulta / Solicitação de Documento ou Contrato',
        description: input,
        category: 'documentos',
        serviceName: 'Gestão de Contratos',
        priority: 'media',
      },
    };
  }

  // 7. Correios / Encomenda / Motoboy / Malote
  if (
    normalized.includes('correio') ||
    normalized.includes('correspondência') ||
    normalized.includes('correspondencia') ||
    normalized.includes('encomenda') ||
    normalized.includes('motoboy') ||
    normalized.includes('malote') ||
    normalized.includes('sedex') ||
    normalized.includes('enviar')
  ) {
    return {
      matched: true,
      intentKey: 'mail_motoboy',
      title: 'Envio de Correspondência / Motoboy Express',
      category: 'logistica',
      serviceName: 'Correios e Motoboy',
      suggestedPriority: 'alta',
      suggestedActionLabel: 'Solicitar Envio',
      navigationTarget: { tab: 'logistica', subTab: 'correios' },
      explanation: 'Identificada solicitação de envio físico de correspondência ou malote.',
      prefill: {
        title: 'Envio de Documento / Correspondência via Motoboy ou Correios',
        description: input,
        category: 'logistica',
        serviceName: 'Correios e Motoboy',
        priority: 'alta',
      },
    };
  }

  // 8. Material de escritório / Estoque / Almoxarifado / Compras
  if (
    normalized.includes('material') ||
    normalized.includes('escritório') ||
    normalized.includes('escritorio') ||
    normalized.includes('papel') ||
    normalized.includes('caneta') ||
    normalized.includes('toner') ||
    normalized.includes('suprimento') ||
    normalized.includes('comprar') ||
    normalized.includes('compra') ||
    normalized.includes('almoxarifado')
  ) {
    return {
      matched: true,
      intentKey: 'stock_purchase',
      title: 'Solicitar Material de Escritório / Compra',
      category: 'estoque',
      serviceName: 'Almoxarifado & Suprimentos',
      suggestedPriority: 'media',
      suggestedActionLabel: 'Solicitar Material',
      navigationTarget: { tab: 'estoque' },
      explanation: 'Identificada requisição de materiais ou abertura de pedido de compra.',
      prefill: {
        title: 'Requisição de Material de Escritório e Suprimentos',
        description: input,
        category: 'estoque',
        serviceName: 'Almoxarifado & Suprimentos',
        priority: 'media',
      },
    };
  }

  // 9. Telefonia / Celular / Chip / Aparelho
  if (
    normalized.includes('telefone') ||
    normalized.includes('telefonia') ||
    normalized.includes('celular') ||
    normalized.includes('chip') ||
    normalized.includes('ramal') ||
    normalized.includes('roaming') ||
    normalized.includes('aparelho')
  ) {
    return {
      matched: true,
      intentKey: 'telephony',
      title: 'Suporte de Telefonia ou Celular Corporativo',
      category: 'telefonia',
      serviceName: 'Telefonia Fixa e Móvel',
      suggestedPriority: 'media',
      suggestedActionLabel: 'Abrir Chamado de Telefonia',
      navigationTarget: { tab: 'telefonia' },
      explanation: 'Identificado problema ou solicitação relacionada a linhas ou chips corporativos.',
      prefill: {
        title: 'Suporte / Solicitação de Telefonia Corporativa',
        description: input,
        category: 'telefonia',
        serviceName: 'Telefonia Fixa e Móvel',
        priority: 'media',
      },
    };
  }

  // 10. Imóvel / Aluguel / Obras / Nova sede
  if (
    normalized.includes('imóvel') ||
    normalized.includes('imovel') ||
    normalized.includes('aluguel') ||
    normalized.includes('inquilino') ||
    normalized.includes('obra') ||
    normalized.includes('reforma') ||
    normalized.includes('nova sede') ||
    normalized.includes('alphaville')
  ) {
    const isWork = normalized.includes('obra') || normalized.includes('reforma') || normalized.includes('nova sede');
    return {
      matched: true,
      intentKey: isWork ? 'works' : 'real_estate',
      title: isWork ? 'Módulo de Obras e Nova Sede' : 'Gestão de Imóveis e Aluguéis',
      category: isWork ? 'obras' : 'imoveis',
      serviceName: isWork ? 'Obras e Reformas' : 'Gestão Predial / Imóveis',
      suggestedPriority: 'media',
      suggestedActionLabel: isWork ? 'Ver Status da Obra' : 'Acessar Imóveis',
      navigationTarget: { tab: isWork ? 'obras' : 'imoveis' },
      explanation: 'Identificada consulta relacionada ao patrimônio imobiliário ou obras corporativas.',
      prefill: {
        title: isWork ? 'Demanda de Obra / Reforma' : 'Demanda de Gestão Imobiliária',
        description: input,
        category: isWork ? 'obras' : 'imoveis',
        serviceName: isWork ? 'Obras e Reformas' : 'Gestão Predial',
        priority: 'media',
      },
    };
  }

  // Fallback genérico para abertura de chamado
  return {
    matched: true,
    intentKey: 'generic_ticket',
    title: 'Abertura de Chamado Administrativo',
    category: 'atendimento',
    serviceName: 'Atendimento Geral',
    suggestedPriority: 'media',
    suggestedActionLabel: 'Abrir Chamado com esse texto',
    navigationTarget: { tab: 'central' },
    explanation: 'Sua solicitação será registrada e triada pela equipe da Central Administrativa.',
    prefill: {
      title: input.length > 50 ? input.slice(0, 50) + '...' : input,
      description: input,
      category: 'atendimento',
      serviceName: 'Atendimento Geral',
      priority: 'media',
    },
  };
}
