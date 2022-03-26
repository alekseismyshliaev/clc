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

async function getMidgameStatsByPuuid(matchId) {
    var jsonData = await (await riotFetch(`/lol/match/v5/matches/${matchId}/timeline`)).json();
    var statsByPuuid = jsonData.info.participants.reduce((collection, item) => {
        collection[item.puuid] = {
            "cs": 0,
            "gold": 0,
            "takedowns": 0,
        };
        return collection;
    }, {});

    var puuidByParticipantId = jsonData.info.participants.reduce((collection, item) => {
        collection[item.participantId] = item.puuid;
        return collection;
    }, {});

    var addTakedown = id => statsByPuuid[puuidByParticipantId[id]].takedowns += 1;

    var earlyFrames = jsonData.info.frames.filter(frame => (frame.timestamp/1000) < (14 * 60 + 1));     // before 14min and 1sec; there is a small delay, frames don't publish exactly at 840000 millis
    earlyFrames.forEach(frame => {
        frame.events.forEach(event => {
            if (event.type == "CHAMPION_KILL") {
                addTakedown(event.killerId);
                if ("assistingParticipantIds" in event) {
                    event.assistingParticipantIds.forEach(id => addTakedown(id));
                };
            }
        })
    });

    var lastFrame = earlyFrames[earlyFrames.length - 1];
    Object.values(lastFrame.participantFrames).forEach(participant => {
        var participantStats = statsByPuuid[puuidByParticipantId[participant.participantId]];
        participantStats.cs = participant.minionsKilled + participant.jungleMinionsKilled;
        participantStats.gold = participant.totalGold;
    });
    return statsByPuuid;
}


async function getTeamData(matchData, teamId) {
    var midgameStatsByPuuid = await getMidgameStatsByPuuid(matchData.metadata.matchId);
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
            "cs@14": midgameStatsByPuuid[p.puuid].cs,
            "cspm": cs / gameDuration,
            "damage": p.totalDamageDealtToChampions,
            "dpm": p.totalDamageDealtToChampions / gameDuration,
            "dmg%": p.totalDamageDealtToChampions / teamDamage,
            "deaths": p.deaths,
            "fb": p.firstBloodKill ? 1 : 0,
            "gold": p.goldEarned,
            "gpm": p.goldEarned / gameDuration,
            "g%": p.goldEarned / teamGold,
            "gold@14": midgameStatsByPuuid[p.puuid].gold,
            "kda": takedowns / p.deaths,
            "kills": p.kills,
            "kp%": takedowns / teamKills,
            "takedowns@14": midgameStatsByPuuid[p.puuid].takedowns,
            "player": p.summonerName,
            "role": p.lane,
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

router.get('/:matchId', async function(req, res) {
    var jsonData = await (await riotFetch(`/lol/match/v5/matches/${req.params.matchId}`)).json();

    var blueTeam = await getTeamData(jsonData, BLUE_TEAM_ID);
    var redTeam = await getTeamData(jsonData, RED_TEAM_ID);
    res.json({
        timestamp: new Date().toISOString(),
        gameId: req.body.gameId,
        blueTeam,
        redTeam,
    });
});

export default router;