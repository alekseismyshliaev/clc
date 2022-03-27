import "dotenv/config";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import morgan from "morgan";
import GameRoutes from "./routes/game.js";
import UserRoutes from "./routes/user.js";


const PORT = process.env.PORT || 3001;

const app = express();

// serve static files from the React build
//app.use(express.static("build"));
app.use(bodyParser.json());
app.use(cors({
    "origin": process.env.ALLOWED_CORS_ORIGIN,
}));
app.use(morgan("combined"));


app.use("/api/game", GameRoutes);
app.use("/api/user", UserRoutes);


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});