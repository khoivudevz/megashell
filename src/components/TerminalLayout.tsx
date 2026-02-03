import React, {useEffect} from 'react'
import TerminalComponent from './Terminal'
import useElementSize from '../hooks/use-element-size'
import {cn} from '../utils/cn'
import {PanelLeft} from 'lucide-react'
import Sidebar from './Sidebar'
import {useLayoutStore} from '../store/useLayoutStore'
import {useTerminalStore} from '../store/useTerminalStore'
import {useLayoutShortcuts} from '../hooks/use-layout-shortcuts'

export interface Tab {
	id: string
	title: string
}

const TerminalLayout: React.FC = () => {
	const [layoutRef, layoutSize] = useElementSize()
	const setLayoutSize = useLayoutStore((state) => state.setLayoutSize)
	const headerHeight = useLayoutStore((state) => state.header.height)
	const sidebarWidth = useLayoutStore((state) => state.sidebarWidth)
	const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen)

	useEffect(() => {
		setLayoutSize(layoutSize)
	}, [layoutSize])

	useLayoutShortcuts()

	const {tabs, activeTabId, updateTabTitle} = useTerminalStore()

	return (
		<div
			ref={layoutRef}
			className='flex flex-row min-h-dvh h-full overflow-hidden bg-transparent text-gray-300'
		>
			<Sidebar />

			<div
				className={cn('relative order-2')}
				style={{
					width:
						isSidebarOpen && sidebarWidth > 0
							? `calc(100dvw - ${sidebarWidth}px)`
							: '100%',
				}}
			>
				{/* Drag region for top area of terminal if needed, or just let sidebar handle it */}
				{[...tabs]
					.sort((a, b) => a.id.localeCompare(b.id))
					.map((tab) => (
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
								onTitleChange={(title) => updateTabTitle(tab.id, title)}
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
