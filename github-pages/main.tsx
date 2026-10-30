import {createRoot} from 'react-dom/client';
import Archive from '../app/ui/Archive';
import {LanguageProvider} from '../app/ui/Language';
import '../app/globals.css';

createRoot(document.getElementById('root')!).render(<LanguageProvider><Archive/></LanguageProvider>);
