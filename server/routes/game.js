import {Router} from 'express';
import {riotFetch} from '../utils.js';

var router = Router();


const BLUE_TEAM_ID = 100;
const RED_TEAM_ID = 200;

function sum(list) {
    list.map(value => parseFloat(value)).reduce((a, b) => a + b, 0);
};


function getChampionName(championId) {
    return championId;
};


function getTeamData(matchData, teamId) {
    console.log(matchData.info.teams);
    var teamInfo = matchData.info.teams.filter(team => team.teamId == teamId)[0];

    var participantsInfo = matchData.info.participants.filter(participant => participant.teamId == teamId);

    var participants = participantsInfo.map(p => {
        return {
            "assists": p.assists,
            "champion": p.championName,
            "cs": parseInt(p.neutralMinionsKilled) + parseInt(p.totalMinionsKilled),
            "csd@14": -1,
            "csm": -1,
            "damage": p.totalDamageDealtToChampions,
            "dpm": -1,
            "dmg%": -1,
            "deaths": p.deaths,
            "fb": -1,
            "gold": parseInt(p.goldEarned),
            "gpm": -1,
            "g%": -1,
            "gd@14": -1,
            "kda": (parseInt(p.assists) + parseInt(p.kills)) / parseInt(p.deaths),
            "kills": p.kills,
            "kp%": -1,
            "k+a@14": -1,
            "player": p.summonerName,
            "vision": p.visionScore,
            "vspm": -1,
        }
    });
    return {
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