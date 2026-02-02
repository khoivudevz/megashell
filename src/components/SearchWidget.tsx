import React, {useEffect, useRef, useState} from 'react'

interface SearchWidgetProps {
	onClose: () => void
	onFindNext: (term: string, options?: {wholeWord: boolean}) => void
	onFindPrevious: (term: string, options?: {wholeWord: boolean}) => void
}

const SearchWidget: React.FC<SearchWidgetProps> = ({
	onClose,
	onFindNext,
	onFindPrevious,
}) => {
	const [searchTerm, setSearchTerm] = useState('')
	const [isWholeWord, setIsWholeWord] = useState(false)
	const inputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Escape') {
			onClose()
		} else if (e.key === 'Enter') {
			if (e.shiftKey) {
				onFindPrevious(searchTerm, {wholeWord: isWholeWord})
			} else {
				onFindNext(searchTerm, {wholeWord: isWholeWord})
			}
		} else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
			e.preventDefault()
			// Optional: Select all text or just ensure focus stays
			inputRef.current?.select()
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value
		setSearchTerm(value)
		// Live search as you type (optional, but feels responsive)
		if (value) {
			onFindNext(value, {wholeWord: isWholeWord})
		}
	}

	const [formattedTime, setFormattedTime] = useState('')

	useEffect(() => {
		const updateTime = () => {
			const now = new Date()
			let hours = now.getHours()
			const minutes = now.getMinutes()
			const ampm = hours >= 12 ? 'PM' : 'AM'
			hours = hours % 12
			hours = hours ? hours : 12
			const minutesStr = minutes < 10 ? '0' + minutes : minutes
			setFormattedTime(`${hours}:${minutesStr} ${ampm}`)
		}

		updateTime()
		const interval = setInterval(updateTime, 1000)
		return () => clearInterval(interval)
	}, [])

	const toggleWholeWord = () => {
		const newValue = !isWholeWord
		setIsWholeWord(newValue)
		if (searchTerm) {
			onFindNext(searchTerm, {wholeWord: newValue})
		}
	}

	return (
		<div className='absolute top-4 left-1/2 transform -translate-x-1/2 w-[80%] lg:w-[40%] bg-[#202020]/95 backdrop-blur-md text-white rounded-lg shadow-2xl p-0 overflow-hidden border border-[#333] z-50 animate-in fade-in slide-in-from-top-4 duration-200'>
			<div className='flex items-center px-4 py-3 gap-2'>
				<input
					ref={inputRef}
					type='text'
					value={searchTerm}
					onChange={handleChange}
					onKeyDown={handleKeyDown}
					placeholder='Type here to search'
					className='flex-1 bg-transparent border-none outline-none text-lg text-[#e0e0e0] placeholder-[#808080] font-sans'
					autoFocus
				/>
				<div className='flex items-center gap-2 text-[#808080]'>
					<button
						onClick={toggleWholeWord}
						className={`p-1 rounded hover:bg-[#333] transition-colors ${isWholeWord ? 'text-white bg-[#333]' : 'text-[#808080]'}`}
						title='Match Whole Word'
					>
						<svg
							xmlns='http://www.w3.org/2000/svg'
							width='20'
							height='20'
							viewBox='0 0 24 24'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						>
							<rect x='2' y='5' width='20' height='14' rx='2' />
							<path d='M7 15V9' />
							<path d='M17 15V9' />
							<path d='M12 15V9' />
						</svg>
					</button>
					<span className='text-sm font-medium border-l border-[#404040] pl-2'>
						{formattedTime}
					</span>
					{/* Search Icon */}
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
					>
						<circle cx='11' cy='11' r='8'></circle>
						<line x1='21' y1='21' x2='16.65' y2='16.65'></line>
					</svg>
				</div>
			</div>

			{/* Optional Help Hint matching the screenshot style */}
			{/* {searchTerm === '' && (
                 <div className="border-t border-[#333] px-4 py-2 bg-[#1e1e1e]">
                    <div className="flex items-center gap-3 py-2 opacity-70">
                         <div className="text-yellow-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                         </div>
                         <div className="flex-1">
                             <div className="text-sm font-medium">b</div>
                             <div className="text-xs text-[#808080]">Activate Browser Bookmarks plugin action keyword</div>
                         </div>
                         <div className="text-xs text-[#606060] border border-[#404040] rounded px-1.5 py-0.5">Alt+1</div>
                    </div>
                 </div>
            )} */}
		</div>
	)
}

export default SearchWidget
