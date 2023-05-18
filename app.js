const express = require("express");
const app = express();
app.use(express.json());

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Working");
    });
  } catch (err) {
    console.log("Error");
    process.exit(1);
  }
};

initializeDbAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM player_details;
    `;
  const getplayerdetails = await db.all(getPlayersQuery);
  const finalplayerdetails = getplayerdetails.map((eachPlayer) => {
    return {
      playerId: eachPlayer.player_id,
      playerName: eachPlayer.player_name,
    };
  });
  response.send(finalplayerdetails);
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const singleplayerQuery = `
    SELECT * FROM player_details
    WHERE player_id = ${playerId};
    `;
  const getsingleplayer = await db.get(singleplayerQuery);
  const filterplayer = (getsingleplayer) => {
    return {
      playerId: getsingleplayer.player_id,
      playerName: getsingleplayer.player_name,
    };
  };
  response.send(filterplayer);
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { player_name } = request.body;
  const updateQuery = `
    UPDATE player_details
    SET playerName = ${player_name}
    WHERE player_id = ${playerId};
    `;
  const playerUpdate = await db.run(updateQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getmatchDetails = `
    SELECT * FROM match_details
    WHERE match_id = ${matchId};
    `;
  const getdetailsmatch = await db.get(getmatchDetails);
  const filterdetails = (getdetailsmatch) => {
    return {
      matchId: getdetailsmatch.match_id,
      match: getdetailsmatch.match,
      year: getdetailsmatch.year,
    };
  };
  response.send(filterdetails);
});

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getplayermatchQuery = `
    SELECT *
    FROM match_details INNER JOIN player_match_score ON match_details.match_id = player_match_score.match_id
    WHERE player_match_score.player_id = ${playerId};
    `;
  const getsingledetail = await db.get(getplayermatchQuery);
  const getfinaldetailsmatch = (getsingledetail) => {
    return {
      matchId: getsingledetail.match_id,
      match: getsingledetail.match,
      year: getsingledetail.year,
    };
  };
  response.send(getfinaldetailsmatch);
});

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getplayersmatchQuery = `
    SELECT *
    FROM player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
    WHERE player_match_score.match_id = ${matchId};
    `;
  const getsingledetails = await db.get(getplayersmatchQuery);
  const getfinaldetailsofmatch = (getsingledetails) => {
    return {
      playerId: getsingledetails.player_id,
      playerName: getsingledetails.player_name,
    };
  };
  response.send(getfinaldetailsofmatch);
});

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getplayersmatchQuerys = `
    SELECT player_id, player_name, SUM(score) as totalScore,
     SUM(fours) as totalFours, SUM(sixes) as totalSixes
    FROM player_details INNER JOIN player_match_score 
    ON player_details.player_id = player_match_score.player_id
    WHERE player_match_score.match_id = ${matchId};
    `;
  const getsingledetailss = await db.get(getplayersmatchQuerys);
  const getfinaldetailsofmatches = (getsingledetailss) => {
    return {
      playerId: getsingledetailss.player_id,
      playerName: getsingledetailss.player_name,
      totalScore: getsingledetailss.totalScore,
      totalFours: getsingledetailss.totalFours,
      totalSixes: getsingledetailss.totalSixes,
    };
  };
  response.send(getfinaldetailsofmatches);
});

module.exports = app;
