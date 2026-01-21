import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoadingPage } from "@/components/loading";
import MessagesPage from "../private/messages";
import { updateUserLocation } from "@/api/methods/user";
import useUserStore from "@/store/userStore";
import toast from "react-hot-toast";
import axios from "axios";
import ProtectedRoutes from "@/components/protectedRoutes";
import PublicRoutes from "@/components/publicRoutes";

const GlobalLayout = lazy(() => import("../layout"));
const LoginPage = lazy(() => import("../public/sign-in"));
const SignUpPage = lazy(() => import("../public/sign-up"));
const PrivateLayout = lazy(() => import("../private/layout"));
const HomePage = lazy(() => import("../private/home"));
const ContactPage = lazy(() => import("../private/contact"));
const NotFoundPage = lazy(() => import("../public/not-found"));
const AboutPage = lazy(() => import("../private/about"));
const ProfileSettings = lazy(() => import("../private/profile-settings"));
const MatchMaking = lazy(() => import("../private/match-making"));
const ProfilePage = lazy(() => import("../private/profile"));
const NotificationsPage = lazy(() => import("../private/notifications"));
const WelcomePage = lazy(() => import("../public/welcome"));
const VerifyEmailPage = lazy(() => import("../public/verify-email"));
const ResetPasswordPage = lazy(() => import("../public/reset-password"));
const ForGotPasswordPage = lazy(() => import("../public/forgot-password"));
const VerifyEmailRedirectPage = lazy(
  () => import("../verify-email-redirect-page")
);
const CompleteProfile = lazy(() => import("../private/complete-profile"));
export default function Router() {
  const { user, setUser } = useUserStore();
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    // Only fetch location if user doesn't already have location data
    // or if location is stale (older than 1 hour)
    const hasStaleLocation =
      !user.latitude ||
      !user.longitude ||
      (user.latitude === 0 && user.longitude === 0);

    if (!hasStaleLocation) return;

    const fetchLocation = () => {
      const updateLocation = (latitude: number, longitude: number) => {
        setUser({
          ...user,
          latitude,
          longitude,
        });

        updateUserLocation(user.id, {
          latitude,
          longitude,
          userId: user.id,
        }).catch((err) => {
          console.error("Failed to update location:", err);
          // Don't show error toast for location failures
        });
      };

      // Try IP-based location first (doesn't require user gesture)
      const fetchIPLocation = async () => {
        try {
          const { data } = await axios.get(
            "https://ipinfo.io/json?access_key=d528a69471b1f2a9ce4d239c07857f2f"
          );
          if (data.loc) {
            const [latitude, longitude] = data.loc.split(",");
            updateLocation(parseFloat(latitude), parseFloat(longitude));
            setError(null);
          }
        } catch (err) {
          console.error("Failed to fetch location from IP API:", err);
          // Silently fail - location is optional
        }
      };

      // Prefer IP-based location (no user gesture required)
      fetchIPLocation();

      // Try geolocation only if user has interacted with the page
      // This will be triggered when user clicks/interacts with the app
      const handleUserInteraction = () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              updateLocation(latitude, longitude);
              setError(null);
            },
            () => {
              // Silently fail - IP location is fallback
            },
            { timeout: 5000 }
          );
        }
        // Remove listener after first interaction
        document.removeEventListener("click", handleUserInteraction);
        document.removeEventListener("touchstart", handleUserInteraction);
      };

      // Only request precise geolocation after user interaction
      document.addEventListener("click", handleUserInteraction, { once: true });
      document.addEventListener("touchstart", handleUserInteraction, {
        once: true,
      });
    };

    fetchLocation();
  }, [user?.id, user?.latitude, user?.longitude]);
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Suspense fallback={<LoadingPage />}>
        <Routes>
          <Route element={<GlobalLayout />}>
            {/* 🔒 PRIVATE ROUTES */}
            <Route element={<ProtectedRoutes />}>
              <Route element={<PrivateLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/profile-settings" element={<ProfileSettings />} />
                <Route path="/match-making" element={<MatchMaking />} />
                <Route path="/profile/:userid" element={<ProfilePage />} />
                <Route path="/complete-profile" element={<CompleteProfile />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            {/* 🚫 AUTH ROUTES (blocked if logged in) */}
            <Route element={<PublicRoutes />}>
              <Route path="/signin" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForGotPasswordPage />} />
              <Route path="/reset/:token" element={<ResetPasswordPage />} />
              <Route
                path="/verify/:token"
                element={<VerifyEmailRedirectPage />}
              />
              <Route path="/verify" element={<VerifyEmailPage />} />
              <Route path="/welcome" element={<WelcomePage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
