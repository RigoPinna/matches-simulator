import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomaPage, SeasonPage } from '../pages';
import { useContext, useEffect } from 'react';
import { SeassonContext } from '../store';

export const MainRouter = () => {
	const { dispatch } = useContext(SeassonContext);
	useEffect(() => {
		const seassons = JSON.parse(localStorage.getItem('seassons') || '[]');
		dispatch({
			type: '[SEASSON] - SET SEASSONS',
			payload: seassons,
		});
	}, []);

	return (
		<BrowserRouter>
			<Routes>
				<Route index element={<HomaPage />} />
				<Route path='seasson/:sid' element={<SeasonPage />} />
			</Routes>
		</BrowserRouter>
	);
};
