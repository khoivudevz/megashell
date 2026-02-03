import {create} from 'zustand'

interface Size {
	width: number
	height: number
}

interface LayoutState {
	header: Size
	layout: Size
	isSidebarOpen: boolean
	sidebarWidth: number
	isShortcutsModalOpen: boolean
	setHeaderSize: (size: Size) => void
	setSidebarWidth: (width: number) => void
	setLayoutSize: (size: Size) => void
	toggleSidebar: () => void
	toggleShortcutsModal: () => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
	header: {width: 0, height: 0},
	layout: {width: 0, height: 0},
	isSidebarOpen: true,
	sidebarWidth: 256,
	isShortcutsModalOpen: false,
	setHeaderSize: (size) => set({header: size}),
	setSidebarWidth: (width) => set({sidebarWidth: width}),
	setLayoutSize: (size) => set({layout: size}),
	toggleSidebar: () => set((state) => ({isSidebarOpen: !state.isSidebarOpen})),
	toggleShortcutsModal: () =>
		set((state) => ({isShortcutsModalOpen: !state.isShortcutsModalOpen})),
}))
