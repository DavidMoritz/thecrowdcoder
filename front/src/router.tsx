import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import Root from './pages/Root';
import Home from './pages/Home';
import Login from './pages/Login';
import CreateIdea from './pages/CreateIdea';
import IdeaDetail from './pages/IdeaDetail';
import Profile from './pages/Profile';
import BuyTokens from './pages/BuyTokens';

const rootRoute = createRootRoute({
  component: Root,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: Login,
});

const createIdeaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create-idea',
  component: CreateIdea,
});

const ideaDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/idea/$ideaId',
  component: IdeaDetail,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
});

const buyTokensRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/buy-tokens',
  component: BuyTokens,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  createIdeaRoute,
  ideaDetailRoute,
  profileRoute,
  buyTokensRoute,
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
