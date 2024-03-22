import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomaPage, SeasonPage } from '../pages';

export const MainRouter = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route index element={<HomaPage />} />
				<Route path='season' element={<SeasonPage />} />
			</Routes>
		</BrowserRouter>
	);
};
