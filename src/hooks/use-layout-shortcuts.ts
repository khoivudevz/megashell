import {useEffect} from 'react'
import {invoke} from '@tauri-apps/api/core'
import {useLayoutStore} from '../store/useLayoutStore'
import {useTerminalStore} from '../store/useTerminalStore'

export const useLayoutShortcuts = () => {
	const {addTab, removeTab, removeAllTabs, removeOtherTabs, activeTabId} =
		useTerminalStore()

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey || e.metaKey) {
				const key = e.key.toLowerCase()
				const shift = e.shiftKey

				// Sidebar Toggle: Ctrl + B
				if (key === 'b') {
					e.preventDefault()
					e.stopPropagation()
					useLayoutStore.getState().toggleSidebar()
				}

				// New Terminal: Ctrl + N
				if (key === 'n') {
					e.preventDefault()
					e.stopPropagation()
					addTab()
				}

				// Run antigravity: Ctrl + Shift + G
				if (key === 'g' && shift) {
					e.preventDefault()
					e.stopPropagation()
					invoke('pty_write', {
						id: activeTabId,
						data: 'antigravity .\r',
					}).catch(console.error)
				}

				// Close Tabs
				if (key === 'q') {
					e.preventDefault()
					e.stopPropagation()
					if (shift) {
						// Ctrl + Shift + Q: Close All
						// (Wait, user asked for Ctrl + Shift + O for close others, but Q for all?)
						// "Ctrl + Shift + Q: Close all Tab"
						removeAllTabs()
					} else {
						// Ctrl + Q: Close Current
						removeTab(activeTabId)
					}
				}

				// Close Other Tabs: Ctrl + Shift + O
				if (key === 'o' && shift) {
					e.preventDefault()
					e.stopPropagation()
					removeOtherTabs(activeTabId)
				}

				// Toggle Shortcuts Modal: Ctrl + Shift + / (which is ?)
				if ((key === '/' || key === '?') && shift) {
					e.preventDefault()
					e.stopPropagation()
					useLayoutStore.getState().toggleShortcutsModal()
				}

				// Toggle Fullscreen: Ctrl + Shift + F
				if (key === 'f' && shift) {
					e.preventDefault()
					e.stopPropagation()
					import('@tauri-apps/api/window').then(async (module) => {
						const win = module.getCurrentWindow()
						const isFS = await win.isFullscreen()
						await win.setFullscreen(!isFS)
					})
				}
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [addTab, removeTab, removeAllTabs, removeOtherTabs, activeTabId])
}
