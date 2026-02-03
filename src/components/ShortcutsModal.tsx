import {X} from 'lucide-react'
import {useEffect, useRef} from 'react'
import {useLayoutStore} from '../store/useLayoutStore'

const shortcuts = [
	{key: 'Ctrl + N', description: 'New Terminal'},
	{key: 'Ctrl + Q', description: 'Close Current Tab'},
	{key: 'Ctrl + Shift + Q', description: 'Close All Tabs'},
	{key: 'Ctrl + Shift + O', description: 'Close Other Tabs'},
	{key: 'Ctrl + B', description: 'Toggle Sidebar'},
	{key: 'Ctrl + F', description: 'Find / Search'},
	{key: 'Ctrl + Shift + F', description: 'Toggle Fullscreen'},
	{key: 'Ctrl + Shift + G', description: 'Run Antigravity'},
	{key: 'Ctrl + Shift + /', description: 'Toggle Shortcuts Modal'},
]

const ShortcutsModal = () => {
	const isOpen = useLayoutStore((state) => state.isShortcutsModalOpen)
	const toggleShortcutsModal = useLayoutStore(
		(state) => state.toggleShortcutsModal
	)
	const modalRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				toggleShortcutsModal()
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isOpen, toggleShortcutsModal])

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm'>
			<div
				ref={modalRef}
				className='w-[400px] bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden'
			>
				<div className='flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#252525]'>
					<h2 className='text-sm font-semibold text-gray-200'>
						Keyboard Shortcuts
					</h2>
					<button
						onClick={toggleShortcutsModal}
						className='text-gray-400 hover:text-white transition-colors'
					>
						<X className='w-4 h-4' />
					</button>
				</div>
				<div className='p-4 space-y-3'>
					{shortcuts.map((shortcut) => (
						<div
							key={shortcut.key}
							className='flex items-center justify-between text-sm'
						>
							<span className='text-gray-400'>{shortcut.description}</span>
							<kbd className='px-2 py-1 bg-[#333] border border-white/10 rounded text-gray-200 font-mono text-xs'>
								{shortcut.key}
							</kbd>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

export default ShortcutsModal
