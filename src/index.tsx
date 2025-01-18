import "bulma/css/bulma.min.css";
import "./index.css";
import { createRoot } from "react-dom/client";
import { RouterProvider } from 'react-router-dom';
import { AuthContextProvider, router } from './pages';
import { LoadSpinner } from './components';


const App = () => {
    return (
        <section className="root">
            {/* <p>{ window.navigator.userAgent }</p> */ }

            <AuthContextProvider>
                <RouterProvider router={ router } fallbackElement={ <LoadSpinner loading={ true } /> } />
            </AuthContextProvider>
            <p style={ { padding: "1rem" } }>&nbsp;</p>
        </section>
    );
};

const rootNode = document.getElementById("root");
if (rootNode) {
    const root = createRoot(rootNode);
    root.render(<App />);
}
