import App from "@/App";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import HomePage from "@/pages/home";
import NotfoundPage from "@/pages/notfound";
import {
  createBrowserRouter,
  RouteObject,
  RouterProvider as Provider,
} from "react-router-dom";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <App />,
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
  {
    path: "*",
    element: <NotfoundPage />,
  },
];

const router = createBrowserRouter(routes);

export const RouterProvider = () => {
  return <Provider router={router} />;
};
