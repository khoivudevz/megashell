import TerminalLayout from './components/TerminalLayout'
import './styles/global.css'
import TitleBar from './components/TitleBar'

function App() {
	return (
		<div className='h-full w-full overflow-hidden pt-[30px]'>
			<TitleBar />
			<TerminalLayout />
		</div>
	)
}

export default App
