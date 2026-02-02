import {invoke} from '@tauri-apps/api/core'
import {listen} from '@tauri-apps/api/event'
import {ClipboardAddon} from '@xterm/addon-clipboard'
import {FitAddon} from '@xterm/addon-fit'
import {LigaturesAddon} from '@xterm/addon-ligatures'
import {SearchAddon} from '@xterm/addon-search'
import {WebLinksAddon} from '@xterm/addon-web-links'
import {Terminal} from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'
import React, {useEffect, useRef, useState} from 'react'
import SearchWidget from './SearchWidget'
import {useLayoutStore} from '../store/useLayoutStore'

interface TerminalProps {
	sessionId: string
	onTitleChange?: (title: string) => void
}

const TerminalComponent: React.FC<TerminalProps> = ({
	sessionId,
	onTitleChange,
}) => {
	const terminalRef = useRef<HTMLDivElement>(null)
	const xtermRef = useRef<Terminal | null>(null)
	const fitAddonRef = useRef<FitAddon | null>(null)
	const searchAddonRef = useRef<SearchAddon | null>(null)
	const [isSearchOpen, setIsSearchOpen] = useState(false)

	useEffect(() => {
		if (!terminalRef.current) return

		let isMounted = true
		let unlisten: (() => void) | undefined

		// Custom Resize Logic for PTY
		const resizeObserver = new ResizeObserver(() => {
			if (fitAddonRef.current && xtermRef.current) {
				try {
					fitAddonRef.current.fit()
					// Sync size with PTY backend
					const {cols, rows} = xtermRef.current
					invoke('pty_resize', {id: sessionId, cols, rows})
				} catch (e) {
					console.warn('Fit addon failed to resize:', e)
				}
			}
		})

		const initTerminal = async () => {
			// 1. Load Font
			try {
				const fontName = 'FiraCodeNerdFont'
				if (!document.fonts.check(`12px ${fontName}`)) {
					const font = new FontFace(
						fontName,
						'url(/fonts/FiraCodeNerdFontMono-Regular.ttf)'
					)
					await font.load()
					document.fonts.add(font)
				}
			} catch (e) {
				console.warn('Font fallback:', e)
			}

			if (!isMounted) return

			// 2. Initialize Terminal
			const term = new Terminal({
				cursorBlink: true,
				fontFamily:
					'FiraCodeNerdFont, "FiraCode Nerd Font", "FiraCode NF", "Cascadia Code", Consolas, monospace',
				fontSize: 14,
				theme: {
					background: '#00000000', // Transparent
					foreground: '#f0f0f0',
				},
				allowTransparency: true,
				allowProposedApi: true,
				customGlyphs: true,
				drawBoldTextInBrightColors: true,
			})

			// 3. Initialize Addons
			const fitAddon = new FitAddon()
			const ligaturesAddon = new LigaturesAddon()
			const clipboardAddon = new ClipboardAddon()
			const webLinksAddon = new WebLinksAddon()
			const searchAddon = new SearchAddon()

			fitAddonRef.current = fitAddon
			searchAddonRef.current = searchAddon

			term.loadAddon(fitAddon)
			term.loadAddon(clipboardAddon)
			term.loadAddon(webLinksAddon)
			term.loadAddon(searchAddon)

			if (terminalRef.current) {
				term.open(terminalRef.current)

				// WebGL Addon
				// try {
				// 	const webglAddon = new WebglAddon()
				// 	webglAddon.onContextLoss(() => webglAddon.dispose())
				// 	term.loadAddon(webglAddon)
				// } catch (e) {
				// 	console.warn('WebGL fallback:', e)
				// }

				fitAddon.fit()
				resizeObserver.observe(terminalRef.current)

				// Title Change Listener
				term.onTitleChange((title) => {
					if (onTitleChange) onTitleChange(title)
				})
			}

			xtermRef.current = term

			// 4. Input Handling (Send to PTY)
			term.onData((data) => {
				invoke('pty_write', {id: sessionId, data})
			})

			// 5. Output Handling (Receive from PTY)
			// Listen to sessionId specific event or generic one if filtered by payload
			// In lib.rs we implemented: app_handle.emit(&format!("term-data:{}", id_clone), ...
			unlisten = await listen<string>(`term-data:${sessionId}`, (event) => {
				const payload = event.payload as any
				if (typeof payload === 'string') {
					term.write(payload)
				} else if (payload.data) {
					term.write(payload.data)
				}
			})

			// 6. Spawn PTY Shell
			try {
				// Initial resize sync
				await invoke('pty_spawn', {
					id: sessionId,
					cols: term.cols,
					rows: term.rows,
				})

				// Enable Ligatures (User Activation Workaround)
				const enableLigatures = () => {
					try {
						term.loadAddon(ligaturesAddon)
					} catch {}
					window.removeEventListener('click', enableLigatures)
					window.removeEventListener('keydown', enableLigatures)
				}
				window.addEventListener('click', enableLigatures)
				window.addEventListener('keydown', enableLigatures)
			} catch (error) {
				term.write(`\r\nFailed to start PTY: ${error}\r\n`)
			}

			// Custom Key Handler (Ctrl+F, Ctrl+B)
			term.attachCustomKeyEventHandler((arg) => {
				if (arg.type === 'keydown' && (arg.ctrlKey || arg.metaKey)) {
					if (arg.key.toLowerCase() === 'f') {
						arg.preventDefault()
						setIsSearchOpen((prev) => !prev)
						return false
					}
					if (arg.key.toLowerCase() === 'b') {
						arg.preventDefault()
						arg.stopPropagation()
						useLayoutStore.getState().toggleSidebar()
						return false
					}
				}
				return true
			})
		}

		initTerminal()

		return () => {
			isMounted = false
			resizeObserver.disconnect()
			if (unlisten) unlisten()
			if (xtermRef.current) xtermRef.current.dispose()
			// Kill PTY on unmount
			invoke('pty_kill', {id: sessionId}).catch(console.error)
		}
	}, [sessionId])

	const handleFindNext = (term: string, options?: {wholeWord: boolean}) => {
		searchAddonRef.current?.findNext(term, {
			incremental: true,
			wholeWord: options?.wholeWord,
			decorations: {
				activeMatchColorOverviewRuler: '#007acc',
				matchOverviewRuler: '#404040',
				activeMatchBackground: '#007acc',
				matchBackground: '#404040',
			},
		})
	}

	const handleFindPrevious = (term: string, options?: {wholeWord: boolean}) => {
		searchAddonRef.current?.findPrevious(term, {
			wholeWord: options?.wholeWord,
			decorations: {
				activeMatchColorOverviewRuler: '#007acc',
				matchOverviewRuler: '#404040',
				activeMatchBackground: '#007acc',
				matchBackground: '#404040',
			},
		})
	}

	return (
		<div className='relative h-full w-full background-blur p-2 overflow-auto'>
			{isSearchOpen && (
				<div className='absolute top-0 left-0 w-full z-10'>
					<SearchWidget
						onClose={() => {
							setIsSearchOpen(false)
							searchAddonRef.current?.clearDecorations()
							searchAddonRef.current?.clearActiveDecoration()
							xtermRef.current?.focus()
						}}
						onFindNext={handleFindNext}
						onFindPrevious={handleFindPrevious}
					/>
				</div>
			)}
			<div ref={terminalRef} className='h-full w-full overflow-auto' />
		</div>
	)
}

export default TerminalComponent
