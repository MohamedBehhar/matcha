import App from "@/App";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import HomePage from "@/pages/home";
import NotfoundPage from "@/pages/notfound";
import SignUpPage from "@/pages/signup";
import ProtectedRoutes from "../protectedRoutes";
import SignInPage from "@/pages/signin";
import VerifyEmailPage from "@/pages/verifyEmail";
import VerifyEmailRedirectPage from "@/pages/VerifyEmailRedirectPage";
import {
  createBrowserRouter,
  RouteObject,
  RouterProvider as Provider,
} from "react-router-dom";

const routes: RouteObject[] = [
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/signin",
    element: <SignInPage />,
  },
  {
    path: "/verify",
    element : <VerifyEmailPage />
  },
  {
    path: "/verify/:token?",
    element : <VerifyEmailRedirectPage />
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <ProtectedRoutes />,
        children: [
          {
            path: "",
            element: <HomePage />,
          },
          {
            path: "about",
            element: <AboutPage />,
          },
          {
            path: "contact",
            element: <ContactPage />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotfoundPage />,
  },
];


const router = createBrowserRouter(routes);

export const RouterProvider = () => {
  return <Provider router={router} />;
};
