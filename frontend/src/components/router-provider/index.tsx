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
import ProfileSettings from "@/pages/profileSettings";
import ResetPasswordPage from "@/pages/ResetPassword";
import MatchMaking from "@/pages/matchMaking";
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
    element: <VerifyEmailPage />,
  },
  {
    path: "/verify/:token?",
    element: <VerifyEmailRedirectPage />,
  },
  {
    path: "/reset/:token?",
    element: <ResetPasswordPage />,
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
          {
            path: "profile-settings",
            element: <ProfileSettings />,
          },
          {
            path: "match-making",
            element: <MatchMaking />,
          }
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
