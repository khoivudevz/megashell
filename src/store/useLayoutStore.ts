import {create} from 'zustand'

interface Size {
	width: number
	height: number
}

interface LayoutState {
	header: Size
	layout: Size
	isSidebarOpen: boolean
	isShortcutsModalOpen: boolean
	setHeaderSize: (size: Size) => void
	setLayoutSize: (size: Size) => void
	toggleSidebar: () => void
	toggleShortcutsModal: () => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
	header: {width: 0, height: 0},
	layout: {width: 0, height: 0},
	isSidebarOpen: true,
	isShortcutsModalOpen: false,
	setHeaderSize: (size) => set({header: size}),
	setLayoutSize: (size) => set({layout: size}),
	toggleSidebar: () => set((state) => ({isSidebarOpen: !state.isSidebarOpen})),
	toggleShortcutsModal: () =>
		set((state) => ({isShortcutsModalOpen: !state.isShortcutsModalOpen})),
}))
