import React, {useEffect, useState} from 'react'
import TerminalComponent from './Terminal'
import useElementSize from '../hooks/use-element-size'
import {cn} from '../utils/cn'
import {PanelLeft} from 'lucide-react'
import Sidebar from './Sidebar'
import {useLayoutStore} from '../store/useLayoutStore'
import {useLayoutShortcuts} from '../hooks/use-layout-shortcuts'

export interface Tab {
	id: string
	title: string
}

const TerminalLayout: React.FC = () => {
	const [sidebarRef, sidebarSize] = useElementSize()
	const [layoutRef, layoutSize] = useElementSize()
	const setLayoutSize = useLayoutStore((state) => state.setLayoutSize)
	const headerHeight = useLayoutStore((state) => state.header.height)

	useEffect(() => {
		setLayoutSize(layoutSize)
	}, [layoutSize])

	useLayoutShortcuts()

	const [tabs, setTabs] = useState<Tab[]>([
		{id: 'start-session', title: 'PowerShell'},
	])
	const [activeTabId, setActiveTabId] = useState('start-session')

	const handleNewTab = () => {
		const newId = `session-${Date.now()}`
		setTabs([...tabs, {id: newId, title: 'PowerShell'}])
		setActiveTabId(newId)
	}

	const handleCloseTab = (e: React.MouseEvent, id: string) => {
		e.stopPropagation()
		const newTabs = tabs.filter((t) => t.id !== id)
		if (newTabs.length === 0) {
			// If all tabs closed, maybe close window or reset?
			// For now, spawn a new one to keep app usable
			const newId = `session-${Date.now()}`
			setTabs([{id: newId, title: 'PowerShell'}])
			setActiveTabId(newId)
		} else {
			setTabs(newTabs)
			if (activeTabId === id) {
				setActiveTabId(newTabs[newTabs.length - 1].id)
			}
		}
	}

	const handleTitleChange = (id: string, title: string) => {
		setTabs((prevTabs) =>
			prevTabs.map((tab) => {
				if (tab.id === id) {
					// Clean up title if needed (e.g. remove "Administrator: ")
					let newTitle = title.trim()
					// If it's a path, maybe just show the folder name?
					// For now, let's just use what the shell sends.
					return {...tab, title: newTitle || 'PowerShell'}
				}
				return tab
			})
		)
	}

	return (
		<div
			ref={layoutRef}
			className='flex flex-row min-h-dvh h-full overflow-hidden bg-transparent text-gray-300'
		>
			<Sidebar
				ref={sidebarRef}
				tabs={tabs}
				activeTabId={activeTabId}
				setActiveTabId={setActiveTabId}
				handleNewTab={handleNewTab}
				handleCloseTab={handleCloseTab}
			/>

			<div
				className={cn('relative order-2')}
				style={{
					width:
						sidebarSize.width > 0
							? `calc(100dvw - ${sidebarSize.width}px)`
							: '100%',
				}}
			>
				{/* Drag region for top area of terminal if needed, or just let sidebar handle it */}
				{tabs.map((tab) => (
					<div
						key={tab.id}
						className={`absolute inset-0 w-full h-full ${activeTabId === tab.id ? 'z-10 visible' : 'z-0 invisible'}`}
						style={{
							height:
								layoutSize.height > 0
									? `calc(${layoutSize.height}px - ${headerHeight}px)`
									: '100%',
						}}
					>
						<TerminalComponent
							sessionId={tab.id}
							onTitleChange={(title) => handleTitleChange(tab.id, title)}
						/>
					</div>
				))}
			</div>
			{!useLayoutStore((state) => state.isSidebarOpen) && (
				<button
					onClick={() => useLayoutStore.getState().toggleSidebar()}
					className='absolute bottom-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-colors border border-white/10'
				>
					<PanelLeft className='w-5 h-5' />
				</button>
			)}
		</div>
	)
}

export default TerminalLayout
