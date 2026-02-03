import {useCallback, useEffect, useRef, useState} from 'react'
import {getCurrentWindow} from '@tauri-apps/api/window'
import {Maximize, Minimize, Minus, X, CircleHelp} from 'lucide-react'
import {useLayoutStore} from '../store/useLayoutStore'

export default function TitleBar() {
	const [appWindow, setAppWindow] = useState<any>(null)
	const [isWindowMaximized, setIsWindowMaximized] = useState(false)
	const setHeaderSize = useLayoutStore((state) => state.setHeaderSize)
	const titleBarRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (titleBarRef.current) {
			setHeaderSize({
				width: titleBarRef.current.clientWidth,
				height: titleBarRef.current.clientHeight,
			})
		}
	}, [setHeaderSize])

	useEffect(() => {
		// Import dynamically or ensure it's available only in Tauri context if needed
		// But usually safe to call in component mount
		const win = getCurrentWindow()
		setAppWindow(win)
	}, [])

	const updateIsWindowMaximized = useCallback(async () => {
		const resolvedPromise = await appWindow.isMaximized()
		setIsWindowMaximized(resolvedPromise)
	}, [])

	useEffect(() => {
		updateIsWindowMaximized()

		let unlisten: any = undefined

		const listen = async () => {
			unlisten = await appWindow.onResized(() => {
				updateIsWindowMaximized()
			})
		}

		listen()

		return () => unlisten && unlisten()
	}, [updateIsWindowMaximized])

	const minimize = () => appWindow?.minimize()
	const toggleMaximize = () => appWindow?.toggleMaximize()
	const close = () => appWindow?.close()

	return (
		<div
			ref={titleBarRef}
			data-tauri-drag-region
			className='h-7.5 flex select-none bg-black/50 text-[#cccccc] fixed top-0 left-0 right-0 z-50 backdrop-blur-sm'
		>
			{/* Icon / Title Area - also draggable */}
			<div className='flex items-center px-3 text-xs flex-1 pointer-events-none'>
				<img src='/icon.png' alt='icon' className='w-4 h-4 mr-2' />
				<span>Megashell</span>
			</div>

			<div
				className='inline-flex justify-center items-center px-3 h-full hover:bg-[rgba(255,255,255,0.1)] cursor-pointer transition-colors text-gray-400 hover:text-white'
				onClick={() => useLayoutStore.getState().toggleShortcutsModal()}
				title='Shortcuts'
			>
				<CircleHelp className='size-4' />
			</div>

			{/* Window Controls */}
			<div className='flex'>
				<div
					className='inline-flex justify-center items-center px-3 h-full hover:bg-[rgba(255,255,255,0.1)] cursor-default transition-colors'
					onClick={minimize}
				>
					<Minus className='size-4' />
				</div>
				<div
					className='inline-flex justify-center items-center px-3 h-full hover:bg-[rgba(255,255,255,0.1)] cursor-default transition-colors'
					onClick={toggleMaximize}
				>
					{!isWindowMaximized ? (
						<Maximize className='size-4' />
					) : (
						<Minimize className='size-4' />
					)}
				</div>
				<div
					className='inline-flex justify-center items-center px-3  h-full hover:bg-[#e81123] hover:text-white cursor-default transition-colors'
					onClick={close}
				>
					<X className='size-4' />
				</div>
			</div>
		</div>
	)
}
