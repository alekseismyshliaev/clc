import { Router } from "express";
import { readFile } from "fs/promises";
import { riotFetch } from "../utils.js";


var router = Router();


const BLUE_TEAM_ID = 100;
const RED_TEAM_ID = 200;

function sum(list) {
    return list.map(value => parseFloat(value)).reduce((a, b) => a + b, 0);
};


const _CHAMPIONS_JSON = JSON.parse(await readFile(new URL("../../data/champion.json", import.meta.url)));

const CHAMPIONS_BY_ID = Object.keys(_CHAMPIONS_JSON.data).reduce((collection, item) => {
    var champion = _CHAMPIONS_JSON.data[item];
    collection[champion.key] = champion;
    return collection;
}, {});


function getChampionName(championId) {
    return CHAMPIONS_BY_ID[championId].name;
};


function getTeamData(matchData, teamId) {
    console.log(matchData.info.teams);
    var gameDuration = matchData.info.gameDuration / 60.0;
    var teamInfo = matchData.info.teams.filter(team => team.teamId == teamId)[0];

    var participantsInfo = matchData.info.participants.filter(participant => participant.teamId == teamId);
    var teamDamage = sum(participantsInfo.map(p => p.totalDamageDealtToChampions));
    var teamGold = sum(participantsInfo.map(p => p.goldEarned));
    var teamKills = sum(participantsInfo.map(p => p.kills));

    var participants = participantsInfo.map(p => {
        var cs = p.neutralMinionsKilled + p.totalMinionsKilled;
        var takedowns = p.assists + p.kills;
        return {
            "assists": p.assists,
            "champion": p.championName,
            "cs": cs,
            "csd@14": -1,
            "cspm": cs / gameDuration,
            "damage": p.totalDamageDealtToChampions,
            "dpm": p.totalDamageDealtToChampions / gameDuration,
            "dmg%": p.totalDamageDealtToChampions / teamDamage,
            "deaths": p.deaths,
            "fb": p.firstBloodKill ? 1 : 0,
            "gold": p.goldEarned,
            "gpm": p.goldEarned / gameDuration,
            "g%": p.goldEarned / teamGold,
            "gd@14": -1,
            "kda": takedowns / p.deaths,
            "kills": p.kills,
            "kp%": takedowns / teamKills,
            "k+a@14": -1,
            "player": p.summonerName,
            "vision": p.visionScore,
            "vspm": p.visionScore / gameDuration,
        }
    });
    return {
        "bans": teamInfo.bans.sort(b => b.pickTurn).map(b => getChampionName(b.championId)),
        participants,
        "totalStats": {
            "assists": sum(participantsInfo.map(p => p.assists)),
            "barons": teamInfo.objectives.baron.kills,
            "damage": sum(participantsInfo.map(p => p.totalDamageDealtToChampions)),
            "deaths": sum(participantsInfo.map(p => p.deaths)),
            "dragons": teamInfo.objectives.dragon.kills,
            "firstBlood": teamInfo.objectives.champion.first,
            "gold": sum(participantsInfo.map(p => p.goldEarned)),
            "kills": teamInfo.objectives.champion.kills,
            "towers": teamInfo.objectives.tower.kills,
        },
        "win": teamInfo.win,
    }
}

router.get('/:matchId', function(req, res) {
    riotFetch(`/lol/match/v5/matches/${req.params.matchId}`).then(response => response.json()).then(jsonData => {
        console.log(jsonData);

        var blueTeam = getTeamData(jsonData, BLUE_TEAM_ID);
        var redTeam = getTeamData(jsonData, RED_TEAM_ID);
        res.json({
            timestamp: new Date().toISOString(),
            gameId: req.body.gameId,
            blueTeam,
            redTeam,
            gameData: jsonData});
    });
});

export default router;