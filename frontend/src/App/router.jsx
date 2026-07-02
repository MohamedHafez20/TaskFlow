import { Navigate, RouterProvider } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "../components/Ui/Loader";
import Profile from "../pages/Profile";

// Lazy load the components
const NotFound = lazy(() => import("../pages/NotFound"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const History = lazy(() => import("../pages/History"));
const Analytics = lazy(() => import("../pages/Analytics"));
const CalendarView = lazy(() => import("../pages/CalendarView"));
const Settings = lazy(() => import("../pages/Settings"));
const ProductivityLevel = lazy(() => import("../pages/ProductivityLevel"));
const Pomodoro = lazy(() => import("../pages/Pomodoro"));
const GamesPage = lazy(() => import("../pages/GamesPage"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const Layout = lazy(() => import("../components/layout/Layout"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/home",
    element: <Navigate to="/login" replace />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/app",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />
      },
      {
         path : "user-profile",
         element : <Profile /> 
      },
      {
        path: "games",
        element: <GamesPage />
      },
      {
        path: "productivity",
        element: <ProductivityLevel />
      },
      {
        path: "pomodoro",
        element: <Pomodoro />
      },
      {
        path: "history",
        element: <History />
      },
      {
        path: "analytics",
        element: <Analytics />
      },
      {
        path: "calendar",
        element: <CalendarView />
      },
      {
        path: "settings",
        element: <Settings />
      }
    ]
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

const AppRouter = () => {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default AppRouter;