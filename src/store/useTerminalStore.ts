import {create} from 'zustand'

export interface Tab {
	id: string
	title: string
	customTitle?: string
}

interface TerminalState {
	tabs: Tab[]
	activeTabId: string
	addTab: () => void
	removeTab: (id: string) => void
	removeAllTabs: () => void
	removeOtherTabs: (id: string) => void
	setActiveTabId: (id: string) => void
	updateTabTitle: (id: string, title: string) => void
	setCustomTabTitle: (id: string, title: string) => void
	reorderTabs: (oldIndex: number, newIndex: number) => void
}

export const useTerminalStore = create<TerminalState>((set) => ({
	tabs: [{id: 'start-session', title: 'PowerShell'}],
	activeTabId: 'start-session',
	addTab: () =>
		set((state) => {
			const newId = `session-${Date.now()}`
			return {
				tabs: [...state.tabs, {id: newId, title: 'PowerShell'}],
				activeTabId: newId,
			}
		}),
	removeTab: (id) =>
		set((state) => {
			const newTabs = state.tabs.filter((t) => t.id !== id)
			// If all tabs closed, create a new one
			if (newTabs.length === 0) {
				const newId = `session-${Date.now()}`
				return {
					tabs: [{id: newId, title: 'PowerShell'}],
					activeTabId: newId,
				}
			}
			// If active tab closed, switch to the last one
			let newActiveId = state.activeTabId
			if (state.activeTabId === id) {
				newActiveId = newTabs[newTabs.length - 1].id
			}
			return {
				tabs: newTabs,
				activeTabId: newActiveId,
			}
		}),
	removeAllTabs: () => {
		// "Close all" usually effectively means reset to fresh state or close app.
		// Here we'll reset to a single fresh tab for user convenience.
		const newId = `session-${Date.now()}`
		set({
			tabs: [{id: newId, title: 'PowerShell'}],
			activeTabId: newId,
		})
	},
	removeOtherTabs: (id) =>
		set((state) => {
			const targetTab = state.tabs.find((t) => t.id === id)
			if (!targetTab) return state
			return {
				tabs: [targetTab],
				activeTabId: targetTab.id,
			}
		}),
	setActiveTabId: (id) => set({activeTabId: id}),
	updateTabTitle: (id, title) =>
		set((state) => ({
			tabs: state.tabs.map((tab) => {
				if (tab.id === id) {
					// Only update the shell title.
					// Using trimmed title and fallback similar to before, but we don't assume this is the ONLY title.
					let newTitle = title.trim()
					return {...tab, title: newTitle || 'PowerShell'}
				}
				return tab
			}),
		})),
	setCustomTabTitle: (id, title) =>
		set((state) => ({
			tabs: state.tabs.map((tab) => {
				if (tab.id === id) {
					return {...tab, customTitle: title.trim()}
				}
				return tab
			}),
		})),
	reorderTabs: (oldIndex, newIndex) =>
		set((state) => {
			const newTabs = [...state.tabs]
			const [movedTab] = newTabs.splice(oldIndex, 1)
			newTabs.splice(newIndex, 0, movedTab)
			return {tabs: newTabs}
		}),
}))
