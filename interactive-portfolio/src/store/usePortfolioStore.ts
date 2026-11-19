import { create } from 'zustand';

interface PortfolioState {
  hoveredBookIndex: number | null;
  mobilePreviewBookId: string | null;
  selectedBookId: string | null;
  activeSubCategory: string;
  selectedProjectId: string | null;

  setHoveredBookIndex: (index: number | null) => void;
  setMobilePreviewBookId: (bookId: string | null) => void;
  openBook: (bookId: string) => void;
  closeBook: () => void;
  setActiveSubCategory: (subCategory: string) => void;
  openProjectModal: (projectId: string) => void;
  closeProjectModal: () => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  hoveredBookIndex: null,
  mobilePreviewBookId: null,
  selectedBookId: null,
  activeSubCategory: 'All',
  selectedProjectId: null,

  setHoveredBookIndex: (index) => set({ hoveredBookIndex: index }),
  setMobilePreviewBookId: (bookId) => set({ mobilePreviewBookId: bookId }),
  openBook: (bookId) => set({ selectedBookId: bookId, activeSubCategory: 'All', mobilePreviewBookId: null }),
  closeBook: () => set({ selectedBookId: null, selectedProjectId: null, hoveredBookIndex: null }),
  setActiveSubCategory: (subCategory) => set({ activeSubCategory: subCategory }),
  openProjectModal: (projectId) => set({ selectedProjectId: projectId }),
  closeProjectModal: () => set({ selectedProjectId: null }),
}));