'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { GlobalSearchModal } from '@/components/modals/GlobalSearchModal';
import { NewTicketModal } from '@/components/modals/NewTicketModal';
import { TicketDetailModal } from '@/components/modals/TicketDetailModal';

// Modules
import { HomePortal } from '@/components/modules/HomePortal';
import { ServiceCenter } from '@/components/modules/ServiceCenter';
import { DashboardView } from '@/components/modules/DashboardView';
import { SchedulingModule } from '@/components/modules/SchedulingModule';
import { LogisticsModule } from '@/components/modules/LogisticsModule';
import { GEDAndContractsModule } from '@/components/modules/GEDAndContractsModule';
import { PurchasesAndInventoryModule } from '@/components/modules/PurchasesAndInventoryModule';
import { FacilitiesAndAssetsModule } from '@/components/modules/FacilitiesAndAssetsModule';
import { OperationsAndFacilitiesModule } from '@/components/modules/OperationsAndFacilitiesModule';
import { AdministrationModule } from '@/components/modules/AdministrationModule';

export function MainApp() {
  const { activeTab, toastMessage, currentUser } = useApp();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  const renderActiveModule = () => {
    const restrictedTabs = ['documentos', 'pagamentos', 'admin', 'patrimonio', 'imoveis', 'obras', 'contratos'];
    const canAccessManagement = currentUser.role === 'admin' || currentUser.role === 'manager';
    if (restrictedTabs.includes(activeTab) && !canAccessManagement) {
      return <HomePortal />;
    }

    switch (activeTab) {
      case 'home':
        return <HomePortal />;
      case 'central':
        return <ServiceCenter />;
      case 'dashboard':
        return <DashboardView />;
      case 'agendamentos':
        return <SchedulingModule />;
      case 'logistica':
        return <LogisticsModule />;
      case 'contratos':
        return <GEDAndContractsModule initialTab="contratos" />;
      case 'documentos':
        return <GEDAndContractsModule initialTab="documentos" />;
      case 'compras':
        return <PurchasesAndInventoryModule initialTab="compras" />;
      case 'patrimonio':
        return <FacilitiesAndAssetsModule initialTab="patrimonio" />;
      case 'imoveis':
        return <FacilitiesAndAssetsModule initialTab="imoveis" />;
      case 'obras':
        return <FacilitiesAndAssetsModule initialTab="obras" />;
      case 'atendimento':
        return <OperationsAndFacilitiesModule initialType="atendimento" />;
      case 'manutencao':
        return <OperationsAndFacilitiesModule initialType="manutencao" />;
      case 'telefonia':
        return <OperationsAndFacilitiesModule initialType="telefonia" />;
      case 'viagens':
        return <OperationsAndFacilitiesModule initialType="viagens" />;
      case 'pagamentos':
        return <OperationsAndFacilitiesModule initialType="pagamentos" />;
      case 'admin':
        return <AdministrationModule />;
      default:
        return <HomePortal />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar */}
      <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Header */}
        <Header onToggleMobile={() => setIsOpenMobile(true)} />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveModule()}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <GlobalSearchModal />
      <NewTicketModal />
      <TicketDetailModal />

      {/* Transient Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-800 animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
