import {useState, useEffect, useRef} from 'react'

const useElementSize = () => {
	const [size, setSize] = useState({width: 0, height: 0})
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const element = ref.current
		if (!element) return

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				setSize({
					width: entry.contentRect.width,
					height: entry.contentRect.height,
				})
			}
		})

		observer.observe(element)

		// Set initial size if available
		setSize({
			width: element.offsetWidth,
			height: element.offsetHeight,
		})

		return () => {
			observer.disconnect()
		}
	}, [])

	return [ref, size] as const
}

export default useElementSize
