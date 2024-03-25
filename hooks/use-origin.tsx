import { useEffect, useState } from 'react';

export const useOrigin = (): string => {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const origin = typeof window !== 'undefined' ? window.location.origin : '';

	if (!isMounted) {
		return '';
	}

	return origin;
};
