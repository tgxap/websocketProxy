const { WebSocketServer } = require("ws");
const express = require("express");
function createAppOne() {
  const app = express();

  const port = 3006;

  app.get("/", (req, res) => {
    // console.log({ req });
    res.send("Hello World Bro!");
  });

  app.get("/api", (req, res) => {
    res.send("Proxy Hello World!");
  });

  const server = app.listen(port, () => {
    console.log(`http server listening on ${port}`);
  });
  const wss = new WebSocketServer({ server });

  wss.on("connection", function connection(ws, request) {
    ws.on("open", () => {
      console.log("open");
      ws.send("something");
    });
    ws.on("message", function message(data) {
      console.log("PORT 3006: received: %s", data);
      ws.send(data);
    });
    ws.on("error", (err) => {
      console.log({ err });
    });
    ws.on("close", (code, reason) => {
      console.log({ reason, code });
    });
  });
}

function createAppTwo() {
  const app = express();

  const port = 3007;

  app.get("/", (req, res) => {
    // console.log({ req });
    res.send("Hello2 World2 Bro2!");
  });

  app.get("/api", (req, res) => {
    res.send("Proxy2 Hello2 World2!");
  });

  const server = app.listen(port, () => {
    console.log(`http server listening on ${port}`);
  });
  const wss = new WebSocketServer({ server });

  wss.on("connection", function connection(ws, request) {
    ws.on("open", () => {
      console.log("open");

      ws.send("something");
    });
    ws.on("message", function message(data) {
      console.log("PORT 3007: received: %s", data);
      ws.send(data);
    });
    ws.on("error", (err) => {
      console.log({ err });
    });
    ws.on("close", (code, reason) => {
      console.log({ reason, code });
    });
  });
}

createAppOne();
createAppTwo();
