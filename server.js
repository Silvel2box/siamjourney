// Passenger/Plesk startup file. Boots Next.js in production and hands every
// request to Next's own router. This file is NOT processed by the Next compiler,
// so it must be plain CommonJS that the server's Node version can run directly.
// Passenger overrides listen() to bind its own socket; PORT is the local fallback.
const { createServer } = require("http");
const next = require("next");

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(process.env.PORT || 3000);
});
