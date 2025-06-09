// Use observability package for client instrumentation
export { 
  initializeClient as default,
  onRouterTransitionStart 
} from "@repo/observability/client/next";
