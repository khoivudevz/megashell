import {Tab} from './TerminalLayout'
import {useLayoutStore} from '../store/useLayoutStore'
import {PanelLeftClose} from 'lucide-react'

type Props = {
	tabs: Tab[]
	activeTabId: string
	setActiveTabId: (id: string) => void
	handleNewTab: () => void
	handleCloseTab: (e: React.MouseEvent, id: string) => void
	ref: React.RefObject<HTMLDivElement | null>
}

const Sidebar = ({
	tabs,
	activeTabId,
	setActiveTabId,
	handleNewTab,
	handleCloseTab,
	ref,
}: Props) => {
	const layoutHeight = useLayoutStore((state) => state.layout.height)
	const headerHeight = useLayoutStore((state) => state.header.height)
	const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen)

	if (!isSidebarOpen) return <div ref={ref} className='hidden' />

	return (
		<div
			ref={ref}
			style={{height: `calc(${layoutHeight}px - ${headerHeight}px)`}}
			className='w-64 flex flex-col background-blur border-r border-black/20 order-1 overflow-auto'
		>
			<div className='p-2 border-t border-black/20 flex gap-2'>
				<button
					onClick={handleNewTab}
					className='flex-1 h-8 flex items-center justify-center rounded bg-black/60 hover:bg-black/80 text-white text-sm transition-colors'
				>
					<span>New Terminal</span>
				</button>
				<button
					onClick={() => useLayoutStore.getState().toggleSidebar()}
					className='h-8 w-8 flex items-center justify-center rounded bg-black/60 hover:bg-black/80 text-white transition-colors'
					title='Close Sidebar (Ctrl+B)'
				>
					<PanelLeftClose className='w-4 h-4' />
				</button>
			</div>
			{/* Tab List */}
			<div className='flex-1 overflow-y-auto'>
				{tabs.map((tab) => (
					<div
						key={tab.id}
						onClick={() => setActiveTabId(tab.id)}
						className={`
                                group flex items-center h-9 px-3 cursor-pointer text-sm border-l-2 rounded-md
                                ${
																	activeTabId === tab.id
																		? 'bg-black/50 text-white border-blue-500'
																		: 'border-transparent text-gray-400 hover:bg-black/30 hover:text-gray-300'
																}
                            `}
					>
						{/* Icon placeholder (PowerShell icon) */}
						<span className='mr-2 opacity-80'>
							<svg
								width='14'
								height='14'
								viewBox='0 0 16 16'
								fill='currentColor'
							>
								<path d='M15.5 1H0.5v14h15v-14z m-2 12H2.5v-10h11v10z M4 5l3 3-3 3h2l3-3-3-3z m4 10h6v-2h-6z' />
							</svg>
						</span>
						<span className='truncate flex-1'>{tab.title}</span>
						<button
							onClick={(e) => handleCloseTab(e, tab.id)}
							className='opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#404040]'
						>
							<svg
								width='12'
								height='12'
								viewBox='0 0 12 12'
								fill='currentColor'
							>
								<path
									d='M9.5 2.5L2.5 9.5M2.5 2.5l7 7'
									stroke='currentColor'
									strokeWidth='1.2'
									strokeLinecap='round'
								/>
							</svg>
						</button>
					</div>
				))}
			</div>
		</div>
	)
}

export default Sidebar
