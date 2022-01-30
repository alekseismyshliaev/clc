import fetch from "node-fetch";
import express from "express";
import bodyParser from "body-parser";

const PORT = process.env.PORT || 3001;

const app = express();

const RIOT_API_URL = "https://europe.api.riotgames.com";

// serve static files from the React build
app.use(express.static("build"));
app.use(bodyParser.json())


app.post("/api/v1/getGameData", (req, res) => {
    console.log(req.body, process.env.RIOT_API_KEY);
    fetch(RIOT_API_URL + `/lol/match/v5/matches/${req.body.gameId}`, {
        method: "GET",
        headers: {
            "X-Riot-Token": process.env.RIOT_API_KEY,
        },
    }).then(response => response.json()).then(jsonData => {
        console.log(jsonData);
        res.json({timestamp: new Date().toISOString(), gameId: req.body.gameId, gameData: jsonData});
    });
})

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});