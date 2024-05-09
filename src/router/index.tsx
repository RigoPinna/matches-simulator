import { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SeassonContext } from '../store';
import { ClubsListPage, HomaPage, SeasonPage, WinnersPage } from '../pages';

export const MainRouter = () => {
	const { dispatch } = useContext(SeassonContext);
	useEffect(() => {
		const seassons = JSON.parse(localStorage.getItem('seasons') || '[]');
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
				<Route path='winners' element={<WinnersPage />} />
				<Route path='clubs' element={<ClubsListPage />} />
			</Routes>
		</BrowserRouter>
	);
};
