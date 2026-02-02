import {create} from 'zustand'

interface Size {
	width: number
	height: number
}

interface LayoutState {
	header: Size
	layout: Size
	isSidebarOpen: boolean
	setHeaderSize: (size: Size) => void
	setLayoutSize: (size: Size) => void
	toggleSidebar: () => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
	header: {width: 0, height: 0},
	layout: {width: 0, height: 0},
	isSidebarOpen: true,
	setHeaderSize: (size) => set({header: size}),
	setLayoutSize: (size) => set({layout: size}),
	toggleSidebar: () => set((state) => ({isSidebarOpen: !state.isSidebarOpen})),
}))
