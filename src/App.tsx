import { MainRouter } from './router';
import { SeasonProvider } from './store';

function App() {
	return (
		<>
			<SeasonProvider>
				<MainRouter />
			</SeasonProvider>
		</>
	);
}

export default App;
