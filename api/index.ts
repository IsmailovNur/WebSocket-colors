import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import WebSocket from "ws";
import { IncomingMessage, Pixel } from "./types";

const port = process.env.PORT || 8888;

const app = express();
const router = express.Router();

const instanceWs = expressWs(app);
instanceWs.applyTo(router);

app.use(cors());
app.use(router);
app.use(express.json());

const connectedClients: WebSocket[] = [];
let pixelsHistory: Pixel[] = [];


router.ws("/colors", (ws, req, res) => {
  connectedClients.push(ws);
  console.log("client connected", connectedClients.length);

  ws.send(
    JSON.stringify({
      type: "INIT",
      payload: pixelsHistory,
    })
  );


  ws.on("message", (message) => {
    try {
      const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;

      if (decodedMessage.type === "DRAW_POINTS") {
        const newPixels = decodedMessage.payload;

        pixelsHistory.push(...newPixels);

        connectedClients.forEach(client => {
          client.send(
            JSON.stringify({
              type: "NEW_POINTS",
              payload: newPixels,
            })
          );
        });
      } else if (decodedMessage.type === "CLEAR") {
        pixelsHistory = [];

        connectedClients.forEach((client) => {
          client.send(
            JSON.stringify({
              type: "CLEAR",
            })
          );
        });
      }
    } catch (err) {
      ws.send(JSON.stringify({error: "invalid message", err: err}));
    }
  });

  ws.on("close", () => {
    const index = connectedClients.indexOf(ws);
    connectedClients.splice(index, 1);
    console.log("client disconnected", connectedClients.length);
  })
});

app.listen(port, () => {
  console.log("Server running on port " + port);
});