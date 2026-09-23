import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Everything lives on the front page; any other path is a 404. Netlify serves dist/404.html for
// unknown paths, and `vite preview` falls back to index.html, so this covers both.
const App = () => (window.location.pathname === "/" ? <Index /> : <NotFound />);

export default App;
