import { createRootRoute, createRoute, createRouter, Route } from "@tanstack/react-router";
import RootLayout from "./RootLayout";
import App from "../App";
import Configuracion from "../components/Configuracion";

const rootRoute = createRootRoute({
  component: RootLayout,
});

export const tableroRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tablero/$tableroId",
  component: App,
});

export const configRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/configuracion",
  component: Configuracion,
});

export const routeTree = rootRoute.addChildren([tableroRoute, configRoute]);

export const router = createRouter({ routeTree });
