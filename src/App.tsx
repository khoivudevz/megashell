import TerminalLayout from './components/TerminalLayout'
import './styles/global.css'
import TitleBar from './components/TitleBar'

import ShortcutsModal from './components/ShortcutsModal'

function App() {
	return (
		<div className='h-full w-full overflow-hidden pt-[30px]'>
			<TitleBar />
			<TerminalLayout />
			<ShortcutsModal />
		</div>
	)
}

export default App
