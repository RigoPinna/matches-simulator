import { MainRouter } from './router';
import { SeasonProvide } from './store';

function App() {
	return (
		<>
			<SeasonProvide>
				<MainRouter />
			</SeasonProvide>
		</>
	);
}

export default App;
