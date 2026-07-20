import { Navigate, RouterProvider } from "react-router-dom";
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "../components/Ui/Loader";
import ErrorFallback from "../components/Ui/ErrorFallback";
import Profile from "../pages/Profile";
import BrainDump from "../pages/BrainDump";

// Lazy load the components
const NotFound = lazy(() => import("../pages/NotFound"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const History = lazy(() => import("../pages/History"));
const Analytics = lazy(() => import("../pages/Analytics"));
const CalendarView = lazy(() => import("../pages/CalendarView"));
const Settings = lazy(() => import("../pages/Settings"));
const ProductivityLevel = lazy(() => import("../pages/ProductivityLevel"));
const TaskActivity = lazy(() => import("../pages/TaskActivity")); 
const Pomodoro = lazy(() => import("../pages/Pomodoro"));
const GamesPage = lazy(() => import("../pages/GamesPage"));
const Chatbot = lazy(() => import("../pages/Chatbot"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const Home = lazy(() => import("../pages/Home"));
const ProtectedRoute = lazy(() => import("./ProtectedRoute"));
const Layout = lazy(() => import("../components/layout/Layout"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorFallback />
  },
  {
    path: "/home",
    element: <Home />,
    errorElement: <ErrorFallback />
  },
  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorFallback />
  },
  {
    path: "/register",
    element: <Register />,
    errorElement: <ErrorFallback />
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
    errorElement: <ErrorFallback />
  },
  {
    path: "/app",
    element: <ProtectedRoute><Layout /></ProtectedRoute>,
    errorElement: <ErrorFallback />,
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
        path: "task-activity",
        element: <TaskActivity />
      },
      {
        path: "games",
        element: <GamesPage />
      },
      {
        path: "chatbot",
        element: <Chatbot />
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
        path: "brain-dump",
        element: <BrainDump />
      },
      {
        path: "settings",
        element: <Settings />
      }
    ]
  },
  {
    path: "*",
    element: <NotFound />,
    errorElement: <ErrorFallback />
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