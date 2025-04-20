// This file defines all the pages that should be preloaded
export const staticPages = ["/", "/history", "/analytics", "/reports", "/expenses", "/admin"]

// This function helps with preloading
export function getPreloadablePages() {
  return staticPages
}
