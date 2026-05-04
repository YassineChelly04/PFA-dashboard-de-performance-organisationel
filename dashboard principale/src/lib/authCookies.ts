const useSecureCookies = process.env.NODE_ENV === "production";
const cookiePrefix = useSecureCookies ? "__Secure-dashboard-principale" : "dashboard-principale";

export const authCookieNames = {
  sessionToken: `${cookiePrefix}.session-token`,
  callbackUrl: `${cookiePrefix}.callback-url`,
  csrfToken: `${cookiePrefix}.csrf-token`,
};

export const authCookieOptions = {
  sameSite: "lax" as const,
  path: "/",
  secure: useSecureCookies,
};

export const authHttpOnlyCookieOptions = {
  ...authCookieOptions,
  httpOnly: true,
};
