import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Everything lives on the front page; any other path is a 404. Netlify rewrites
// unknown paths to index.html (public/_redirects) so this runs for all of them.
const App = () => (window.location.pathname === "/" ? <Index /> : <NotFound />);

export default App;
