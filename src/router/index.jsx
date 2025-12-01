import { createBrowserRouter } from "react-router-dom";
import React, { Suspense, lazy } from "react";
import { getRouteConfig } from "@/router/route.utils";
import Layout from "@/components/organisms/Layout";
import Root from "@/layouts/Root";

// Lazy load components
const Dashboard = lazy(() => import('@/components/pages/Dashboard'));
const Farms = lazy(() => import('@/components/pages/Farms'));
const Tasks = lazy(() => import('@/components/pages/Tasks'));
const Weather = lazy(() => import("@/components/pages/Weather"));
const Finance = lazy(() => import("@/components/pages/Finance"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

// Authentication pages
const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const ErrorPage = lazy(() => import("@/components/pages/ErrorPage"));
const ResetPassword = lazy(() => import("@/components/pages/ResetPassword"));
const PromptPassword = lazy(() => import("@/components/pages/PromptPassword"));
const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  // Get config for this route
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path;
  }
  
  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;
  
  const route = {
    path,
    index,
    element: element ? <Suspense fallback={<div>Loading...</div>}>{element}</Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

const mainRoutes = [
  createRoute({
    index: true,
    element: <Dashboard />,
  }),
createRoute({
    path: "farms",
    element: <Farms />,
  }),
  createRoute({
    path: "tasks",
    element: <Tasks />,
  }),
  createRoute({
    path: "weather",
    element: <Weather />,
  }),
  createRoute({
    path: "finance",
    element: <Finance />,
  }),
  createRoute({
    path: "*",
    element: <NotFound />,
  }),
];

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      // Authentication routes
      createRoute({
        path: "login",
        element: <Login />,
      }),
      createRoute({
        path: "signup", 
        element: <Signup />,
      }),
      createRoute({
        path: "callback",
        element: <Callback />,
      }),
      createRoute({
        path: "error",
        element: <ErrorPage />,
      }),
      createRoute({
        path: "reset-password/:appId/:fields",
        element: <ResetPassword />,
      }),
      createRoute({
        path: "prompt-password/:appId/:emailAddress/:provider",
        element: <PromptPassword />,
      }),
      // Main application routes
      {
        path: "/",
        element: <Layout />,
        children: [...mainRoutes],
      },
],
  },
]);