import {useEffect} from 'react'
import {useLayoutStore} from '../store/useLayoutStore'

export const useLayoutShortcuts = () => {
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.code === 'KeyB') {
				e.preventDefault()
				e.stopPropagation()
				useLayoutStore.getState().toggleSidebar()
			}
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [])
}
