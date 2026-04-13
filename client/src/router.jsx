import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import { userVerify } from "./utilities";
import AuthPage from "./pages/AuthPage";


const router = createBrowserRouter([
  { 
        path: "/",
        element: <App/>,
        loader: userVerify,
        children:[
            {
                index: true,
                element: <HomePage />
            },
            {
                path: "auth",
                element: <AuthPage />
            },
        ]
    },
]);

export default router;

    