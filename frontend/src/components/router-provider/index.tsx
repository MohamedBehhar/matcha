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
import ForgotPasswordPage from "@/pages/forgotPassword";
import ProfilePage from "@/pages/profile";
import MyProfile from "@/pages/myProfile";
import WelecomePage from "@/pages/welcome";
import {
  createBrowserRouter,
  RouteObject,
  RouterProvider as Provider,
} from "react-router-dom";
import CompleteProfile from "@/pages/completeProfile";

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
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/welcome",
    element: <WelecomePage />,
  },
  {
    path: "complete-profile",
    element: <CompleteProfile />,
  },
  {
    element: <App />,
    children: [
      {
        path: "/",
        element: <ProtectedRoutes />,
        children: [
          {
            path: "/",
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
          },
          {
            path: "profile/:user_id",
            element: <ProfilePage />,
          },
          {
            path: "my-profile",
            element: <MyProfile />,
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
