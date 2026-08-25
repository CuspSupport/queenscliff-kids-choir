// Password-protects /members.html with a shared username and password.
// Credentials are read from Cloudflare Pages environment variables
// (MEMBERS_USERNAME, MEMBERS_PASSWORD) — never hardcoded here, since
// this repo is public.

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // Only the members area is protected — every other page loads as normal
  if (url.pathname !== "/members.html") {
    return next();
  }

  const USERNAME = env.MEMBERS_USERNAME;
  const PASSWORD = env.MEMBERS_PASSWORD;

  const authHeader = request.headers.get("Authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const separatorIndex = decoded.indexOf(":");
      const user = decoded.substring(0, separatorIndex);
      const pass = decoded.substring(separatorIndex + 1);

      if (user === USERNAME && pass === PASSWORD) {
        return next();
      }
    }
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Queenscliff Kids Choir Members Area", charset="UTF-8"',
    },
  });
}
