import "dotenv/config";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import GameRoutes from "./routes/game.js";

const PORT = process.env.PORT || 3001;

const app = express();

// serve static files from the React build
app.use(express.static("build"));
app.use(bodyParser.json());
app.use(cors());


app.use('/api/game', GameRoutes);


app.post("/api/v1/getGameData", (req, res) => {

})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});