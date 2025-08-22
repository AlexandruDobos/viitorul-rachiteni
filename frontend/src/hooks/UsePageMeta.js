import { useEffect } from 'react';
import { setDocumentTitle, setFavicon } from '../utils/meta';

export default function UsePageMeta({ title, icon }) {
    useEffect(() => {
        if (title) setDocumentTitle(title);
        if (icon) setFavicon(icon);
    }, [title, icon]);
}
