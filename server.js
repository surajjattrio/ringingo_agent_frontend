// server.js
const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// SSL options
const httpsOptions = {
  key: fs.readFileSync("certs/private-key.pem"),
  cert: fs.readFileSync("certs/certificate.pem"),
};

const args = process.argv;
let port = process.env.PORT || 3000;

// Support: `npm run dev -- -p 3400`
if (args.includes('-p')) {
  port = parseInt(args[args.indexOf('-p') + 1]);
}

// Support: `npm run dev -- 3400`
if (!isNaN(parseInt(args[2]))) {
  port = parseInt(args[2]);
}

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, "0.0.0.0", (err) => {
    if (err) throw err;
    console.log(process.env.NEXT_PUBLIC_SITE_URL)
    console.log("> Ready on https://localhost:" + port);
  });
});

