const express = require("express");
const { w3cwebsocket: W3CWebSocket } = require("websocket");
const httpProxy = require("http-proxy");
const { Server: WSServer } = require("ws");
const WebSocketServer = require("websocket").server;
const proxy = require("express-http-proxy");

// TODO: How to add multiple Websocket support

const PORT = 3010;

console.log("server started on " + PORT);
const app = express();
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// proxy HTTP GET / POST
app.all("/appOne/*", function (req, res) {
  const reqOriginalUrl = req.url;
  const url = req.url.split("/appOne")[1];
  console.log({ url });
  req.url = url;

  const proxy = httpProxy.createProxyServer();
  proxy.on("proxyReq", function (proxyReq, req, res, options) {
    if (!req.body || !Object.keys(req.body).length) {
      return;
    }

    var contentType = proxyReq.getHeader("Content-Type");
    var bodyData;

    if (contentType === "application/json") {
      bodyData = JSON.stringify(req.body);
    }

    if (contentType === "application/x-www-form-urlencoded") {
      bodyData = queryString.stringify(req.body);
    }

    if (bodyData) {
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  });
  proxy.web(req, res, { target: "http://localhost:3006", changeOrigin: true });
  console.log({ reqOriginalUrl, reqUrl: req.url });
});

app.all("/appTwo/*", function (req, res) {
  const url = req.url.split("/appTwo")[1];
  console.log({ url });
  req.url = url;
  const proxy2 = httpProxy.createProxyServer();
  proxy2.on("proxyReq", function (proxyReq, req, res, options) {
    if (!req.body || !Object.keys(req.body).length) {
      return;
    }

    var contentType = proxyReq.getHeader("Content-Type");
    var bodyData;

    if (contentType === "application/json") {
      bodyData = JSON.stringify(req.body);
    }

    if (contentType === "application/x-www-form-urlencoded") {
      bodyData = queryString.stringify(req.body);
    }

    if (bodyData) {
      proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  });

  proxy2.web(req, res, { target: "http://localhost:3007", changeOrigin: true });
});
const server = app.listen(PORT);
server.on("upgrade", (req, socket, head) => {
  const proxy = httpProxy.createProxyServer({
    ws: true,
    changeOrigin: true,
    target: "ws://localhost:3006",
  });

  const proxy2 = httpProxy.createProxyServer({
    ws: true,
    changeOrigin: true,
    target: "ws://localhost:3007",
  });
  console.log({ reqUrl: req.url });
  if (req.url === "/appOne") {
    req.url = "/";
    console.log("request for proxy 3006: ", req.url);
    proxy.ws(req, socket, head);
  } else if (req.url === "/appTwo") {
    req.url = "/";
    console.log("request for proxy 3007: ", req.url);
    proxy2.ws(req, socket, head);
  }
});
const ws = new W3CWebSocket("ws://localhost:3010/appOne");
ws.onopen = () => {
  console.log("ws open");
  ws.send("hello");
};

ws.onmessage = (ev) => {
  console.log("FROM 3006: ws message");
  console.log(ev.data.toString());
};

ws.onclose = (code) => {
  console.log("ws close");
};
ws.onerror = (err) => {
  console.log("ws error");
};

const ws2 = new W3CWebSocket("ws://localhost:3010/appTwo");
ws2.onopen = () => {
  console.log("ws open");
  ws2.send("hello");
};

ws2.onmessage = (ev) => {
  console.log("FROM 3007: ws message");
  console.log(ev.data.toString());
};

ws2.onclose = (code) => {
  console.log("ws close");
};
ws2.onerror = (err) => {
  console.log("ws error");
};

const wss = new WSServer({ noServer: true });
wss.on("connection", async (ws, request) => {
  console.log({ reqUrl: request.url, message: "attachToServer" });
  if (!request.url) {
    // ws.close(4001, `[${TAG}] Invalid url`);
    return;
  }
  ws.on("open", () => {
    console.log("websocket open");
  });
  ws.on("close", () => {
    console.log("websocket close");
  });
  ws.on("message", (data) => {
    console.log("websocket message");
    console.log({ data });
  });
});
