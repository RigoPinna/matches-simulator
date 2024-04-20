import { useState } from 'react';

export const useModal = (open = false) => {
	const [isOpen, setisOpen] = useState(open);

	const onOpen = () => setisOpen(true);
	const onClose = () => setisOpen(false);

	return {
		isOpen,
		onOpen,
		onClose,
	};
};
