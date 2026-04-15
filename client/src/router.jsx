import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import { userVerify } from "./utilities";
import AuthPage from "./pages/AuthPage";
import UserLibrary from "./pages/UserLibrary";
import QuizPage from "./pages/QuizPage";
import UserProfile from "./pages/UserProfile";


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
            {
                path: "library",
                element: <UserLibrary />
            },
            {
                path: "quiz",
                element: <QuizPage />
            },
            {
                path: "profile",
                element: <UserProfile />
            }

        ]
    },
]);

export default router;

    