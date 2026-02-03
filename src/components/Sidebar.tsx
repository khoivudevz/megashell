import {useEffect, useRef, useState} from 'react'
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core'
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {CSS} from '@dnd-kit/utilities'
import {useTerminalStore} from '../store/useTerminalStore'
import {useLayoutStore} from '../store/useLayoutStore'
import {PanelLeftClose} from 'lucide-react'

// Sortable Tab Item Component
interface SortableTabItemProps {
	id: string
	title: string
	isActive: boolean
	onClick: () => void
	onRemove: (e: React.MouseEvent) => void
	onRename: (newTitle: string) => void
}

const SortableTabItem = ({
	id,
	title,
	isActive,
	onClick,
	onRemove,
	onRename,
}: SortableTabItemProps) => {
	const {attributes, listeners, setNodeRef, transform, transition} =
		useSortable({id})

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	}

	const [isEditing, setIsEditing] = useState(false)
	const [editValue, setEditValue] = useState(title)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (isEditing && inputRef.current) {
			inputRef.current.focus()
			inputRef.current.select()
		}
	}, [isEditing])

	const handleDoubleClock = (e: React.MouseEvent) => {
		e.stopPropagation()
		setIsEditing(true)
		setEditValue(title)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			onRename(editValue)
			setIsEditing(false)
		} else if (e.key === 'Escape') {
			setIsEditing(false)
		}
	}

	const handleBlur = () => {
		onRename(editValue)
		setIsEditing(false)
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			onClick={onClick}
			onDoubleClick={handleDoubleClock}
			className={`
                group flex items-center h-9 px-3 cursor-pointer text-sm border-l-2 rounded-md
                ${
									isActive
										? 'bg-black/50 text-white border-blue-500'
										: 'border-transparent text-gray-400 hover:bg-black/30 hover:text-gray-300'
								}
            `}
		>
			<span className='mr-2 opacity-80'>
				<svg width='14' height='14' viewBox='0 0 16 16' fill='currentColor'>
					<path d='M15.5 1H0.5v14h15v-14z m-2 12H2.5v-10h11v10z M4 5l3 3-3 3h2l3-3-3-3z m4 10h6v-2h-6z' />
				</svg>
			</span>
			{isEditing ? (
				<input
					ref={inputRef}
					type='text'
					value={editValue}
					onChange={(e) => setEditValue(e.target.value)}
					onKeyDown={handleKeyDown}
					onBlur={handleBlur}
					className='flex-1 bg-transparent border-none outline-none text-white min-w-0'
					onClick={(e) => e.stopPropagation()}
					onMouseDown={(e) => e.stopPropagation()} // Prevent drag start input
				/>
			) : (
				<span className='truncate flex-1'>{title}</span>
			)}

			<button
				onClick={onRemove}
				className='opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#404040]'
			>
				<svg width='12' height='12' viewBox='0 0 12 12' fill='currentColor'>
					<path
						d='M9.5 2.5L2.5 9.5M2.5 2.5l7 7'
						stroke='currentColor'
						strokeWidth='1.2'
						strokeLinecap='round'
					/>
				</svg>
			</button>
		</div>
	)
}

const Sidebar = () => {
	const layoutHeight = useLayoutStore((state) => state.layout.height)
	const headerHeight = useLayoutStore((state) => state.header.height)
	const isSidebarOpen = useLayoutStore((state) => state.isSidebarOpen)
	const sidebarWidth = useLayoutStore((state) => state.sidebarWidth)
	const setSidebarWidth = useLayoutStore((state) => state.setSidebarWidth)

	const {tabs, activeTabId, addTab, removeTab, setActiveTabId, reorderTabs} =
		useTerminalStore()

	// DnD Sensors
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 5,
			},
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	)

	const handleDragEnd = (event: DragEndEvent) => {
		const {active, over} = event
		if (over && active.id !== over.id) {
			const oldIndex = tabs.findIndex((t) => t.id === active.id)
			const newIndex = tabs.findIndex((t) => t.id === over.id)
			reorderTabs(oldIndex, newIndex)
		}
	}

	// Resizing Logic
	const isResizingRef = useRef(false)

	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isResizingRef.current) return
			const newWidth = Math.max(150, Math.min(600, e.clientX))
			setSidebarWidth(newWidth)
		}

		const handleMouseUp = () => {
			isResizingRef.current = false
			document.body.style.cursor = 'default'
			document.body.style.userSelect = 'auto'
		}

		document.addEventListener('mousemove', handleMouseMove)
		document.addEventListener('mouseup', handleMouseUp)

		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [setSidebarWidth])

	if (!isSidebarOpen) return <div className='hidden' />

	return (
		<div
			style={{
				height: `calc(${layoutHeight}px - ${headerHeight}px)`,
				width: sidebarWidth,
			}}
			className='flex flex-col background-blur border-r border-black/20 order-1 relative'
		>
			<div className='p-2 border-t border-black/20 flex gap-2'>
				<button
					onClick={addTab}
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
			<div className='flex-1 overflow-y-auto overflow-x-hidden'>
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={tabs.map((t) => t.id)}
						strategy={verticalListSortingStrategy}
					>
						{tabs.map((tab) => (
							<SortableTabItem
								key={tab.id}
								id={tab.id}
								title={tab.customTitle || tab.title}
								isActive={activeTabId === tab.id}
								onClick={() => setActiveTabId(tab.id)}
								onRemove={(e) => {
									e.stopPropagation()
									removeTab(tab.id)
								}}
								onRename={(newTitle) =>
									useTerminalStore
										.getState()
										.setCustomTabTitle(tab.id, newTitle)
								}
							/>
						))}
					</SortableContext>
				</DndContext>
			</div>

			{/* Resize Handle */}
			<div
				className='absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-500/50 transition-colors z-50'
				onMouseDown={(e) => {
					e.preventDefault()
					isResizingRef.current = true
					document.body.style.cursor = 'col-resize'
					document.body.style.userSelect = 'none'
				}}
			/>
		</div>
	)
}

export default Sidebar
