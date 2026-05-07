export const APP_CONFIG = {
  name: "Ciycle",
  description: "Motosiklet & bisiklet sosyal ağı",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  version: "1.0.0",
  locale: "tr-TR",

  limits: {
    postMaxLength: 2000,
    commentMaxLength: 500,
    bioMaxLength: 300,
    usernameMin: 3,
    usernameMax: 30,
    maxImagesPerPost: 10,
    maxVideoSizeMb: 100,
    maxImageSizeMb: 10,
  },

  pagination: {
    feedPageSize: 20,
    commentsPageSize: 30,
    notificationsPageSize: 50,
    searchResultsPageSize: 24,
  },

  cache: {
    feedStaleTime: 30_000,
    profileStaleTime: 60_000,
    routesStaleTime: 300_000,
  },
} as const;

export const ROUTES = {
  home: "/",
  feed: "/feed",
  explore: "/explore",
  map: "/map",
  messages: "/messages",
  notifications: "/notifications",
  leaderboard: "/leaderboard",
  garage: "/garage",
  settings: "/settings",

  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
  },

  routes: {
    list: "/routes",
    new: "/routes/new",
    detail: (id: string) => `/routes/${id}`,
  },

  events: {
    list: "/events",
    new: "/events/new",
    detail: (id: string) => `/events/${id}`,
  },

  clubs: {
    list: "/clubs",
    new: "/clubs/new",
    detail: (slug: string) => `/clubs/${slug}`,
  },

  profile: (username: string) => `/profile/${username}`,
} as const;
