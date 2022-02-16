import fetch from "node-fetch";


const RIOT_API_URL = "https://europe.api.riotgames.com";

function getRiotApiUrl() {
    return RIOT_API_URL;
}

function getRiotApiKey() {
    return process.env.RIOT_API_KEY;
}

export function riotFetch(resource, method="GET") {
    return fetch(getRiotApiUrl() + resource, {
        method: method,
        headers: {
            "X-Riot-Token": getRiotApiKey(),
        },
    });
};