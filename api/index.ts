import express from "express";
import expressWs from "express-ws";
import cors from "cors";
import WebSocket from "ws";

const port = process.env.PORT || 8888;

const app = express();
const router = express.Router();

const instanceWs = expressWs(app);
instanceWs.applyTo(router);

app.use(cors());
app.use(router);


router.ws("/colors", (ws, req, res) => {

  ws.on("message", (message) => {
    try {

    } catch (err) {
    }

  });

  ws.on("close", () => {
  })
});

app.listen(port, () => {
  console.log("Server running on port " + port);
});