import { useState, useEffect } from 'react';

export default function useMediaQuery(query = '(max-width: 768px)') {
    const [match, setMatch] = useState(() => window.matchMedia(query).matches);
    useEffect(() => {
        const m = window.matchMedia(query);
        const fn = () => setMatch(m.matches);
        m.addEventListener('change', fn);
        return () => m.removeEventListener('change', fn);
    }, [query]);
    return match;
}