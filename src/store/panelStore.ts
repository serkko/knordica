import { create } from 'zustand';
import type { PanelRole, AutoSaveStatus } from '@/types/panel';

interface PanelStore {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Usuario actual
  userRole: PanelRole | null;
  userId: string | null;
  setUser: (id: string, role: PanelRole) => void;

  // Form multi-step de propiedad
  propertyFormStep: number;
  propertyFormData: Record<string, unknown>;
  setPropertyFormStep: (step: number) => void;
  setPropertyFormData: (data: Record<string, unknown>) => void;
  resetPropertyForm: () => void;

  // AutoSave
  autoSaveStatus: AutoSaveStatus;
  autoSaveLastAt: Date | null;
  setAutoSaveStatus: (s: AutoSaveStatus) => void;

  // Modal nueva propiedad
  propertyModalOpen: boolean;
  propertyModalPropertyId: string | null;
  openPropertyModal: (id?: string) => void;
  closePropertyModal: () => void;

  // Notificaciones
  notificationCount: number;
  setNotificationCount: (n: number) => void;
}

export const usePanelStore = create<PanelStore>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  userRole: null,
  userId: null,
  setUser: (id, role) => set({ userId: id, userRole: role }),

  propertyFormStep: 1,
  propertyFormData: {},
  setPropertyFormStep: (step) => set({ propertyFormStep: step }),
  setPropertyFormData: (data) =>
    set((s) => ({ propertyFormData: { ...s.propertyFormData, ...data } })),
  resetPropertyForm: () => set({ propertyFormStep: 1, propertyFormData: {} }),

  autoSaveStatus: 'idle',
  autoSaveLastAt: null,
  setAutoSaveStatus: (s) =>
    set({
      autoSaveStatus: s,
      autoSaveLastAt: s === 'saved' ? new Date() : null,
    }),

  propertyModalOpen: false,
  propertyModalPropertyId: null,
  openPropertyModal: (id) =>
    set({ propertyModalOpen: true, propertyModalPropertyId: id ?? null }),
  closePropertyModal: () =>
    set({ propertyModalOpen: false, propertyModalPropertyId: null }),

  notificationCount: 0,
  setNotificationCount: (n) => set({ notificationCount: n }),
}));
