import React from "react";
import "./App.css";
import { Button, CircularProgress, Grid, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { Image } from "mui-image";


const BACKEND_URL = process.env.REACT_APP_BACKEND_DOMAIN;


class TeamInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...props.teamData,
      side: props.teamSide,
    };
  }

  render() {
    return (
      <>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell component="th" colSpan={16} align="center">{this.state.side} team: {this.state.win ? "VICTORY" : "DEFEAT"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell component="th" scope="row">Objectives:</TableCell>
              <TableCell align="right">{this.state.totalStats.barons}</TableCell><TableCell aligh="left">Barons</TableCell>
              <TableCell align="right">{this.state.totalStats.dragons}</TableCell><TableCell aligh="left">Dragons</TableCell>
              <TableCell align="right">{this.state.totalStats.kills}</TableCell><TableCell aligh="left">Kills</TableCell>
              <TableCell align="right">{this.state.totalStats.towers}</TableCell><TableCell aligh="left">Towers</TableCell>
              <TableCell>{this.state.totalStats.firstBlood && "First Blood!"}</TableCell>
              <TableCell component="th" scope="row">Bans:</TableCell>
              {this.state.bans.map((ban, index) => <TableCell key={`${this.state.side}-ban-${index}`}>{ban}</TableCell>)}
            </TableRow>
          </TableBody>
        </Table>
        <br />
        <TeamParticipants participants={this.state.participants} />
        <br />
        <br />
      </>
    );
  }
}

class TeamParticipants extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      participants: props.participants,
    }
  }

  render() {
    var prettify = number => number.toLocaleString(navigator.language, {maximumFractionDigits: 2});
    var percent = number => number.toLocaleString(navigator.language, {style: 'percent'});
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell colSpan={2}>Champion</TableCell>
            <TableCell>Kills</TableCell>
            <TableCell>Deaths</TableCell>
            <TableCell>Assists</TableCell>
            <TableCell>KDA</TableCell>
            <TableCell>Creep Score</TableCell>
            <TableCell>CS/min</TableCell>
            <TableCell>Gold Earned</TableCell>
            <TableCell>Gold/min</TableCell>
            <TableCell>Team Gold %</TableCell>
            <TableCell>Vision Score</TableCell>
            <TableCell>VS/min</TableCell>
            <TableCell>Damage Dealt</TableCell>
            <TableCell>Damage/min</TableCell>
            <TableCell>Team Damage %</TableCell>
            <TableCell>Kill Participation %</TableCell>
            <TableCell>Gold Earned @14min</TableCell>
            <TableCell>Creep Score @14min</TableCell>
            <TableCell>Takedowns @14min</TableCell>
            <TableCell>First Blood</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {this.state.participants.map(participant => (
            <TableRow
              key={participant.player}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{participant.player}</TableCell>
              <TableCell component="th" scope="row">{participant.champion}</TableCell>
              <TableCell component="th" scope="row">
                <Image src={`${process.env.PUBLIC_URL}/img/${participant.role}.png`} height="1em" alt={`${participant.role}`} />
              </TableCell>
              <TableCell>{participant.kills}</TableCell>
              <TableCell>{participant.deaths}</TableCell>
              <TableCell>{participant.assists}</TableCell>
              <TableCell>{prettify(participant.kda)}</TableCell>
              <TableCell>{participant.cs}</TableCell>
              <TableCell>{prettify(participant.cspm)}</TableCell>
              <TableCell>{participant.gold}</TableCell>
              <TableCell>{prettify(participant.gpm)}</TableCell>
              <TableCell>{percent(participant['g%'])}</TableCell>
              <TableCell>{participant.vision}</TableCell>
              <TableCell>{prettify(participant.vspm)}</TableCell>
              <TableCell>{participant.damage}</TableCell>
              <TableCell>{prettify(participant.dpm)}</TableCell>
              <TableCell>{percent(participant['dmg%'])}</TableCell>
              <TableCell>{percent(participant['kp%'])}</TableCell>
              <TableCell>{participant['gold@14']}</TableCell>
              <TableCell>{participant['cs@14']}</TableCell>
              <TableCell>{participant['takedowns@14']}</TableCell>
              <TableCell>{participant.fb}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      gameId: "",
      gameIdError: "",
      gameData: null,
      isLoading: false,
    };
  };

  setStateField = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  getGameData = async () => {
    try {
      this.setState({gameIdError: "", isLoading: true});
      const response = await fetch(`${BACKEND_URL}/api/game/${this.state.gameId}`, {
        method: "GET",
      });
      const jsonData = await response.json();
      this.setState({gameData: jsonData, isLoading: false});
    } catch (exc) {
      console.error(exc);
      this.setState({gameIdError: "Error loading the game ID", isLoading: false})
    };
  };

  render() {
    return (
      <Grid container pt={2} spacing={2} justifyContent="center">
        <Grid item>
          <TextField
            error={Boolean(this.state.gameIdError)}
            helperText={this.state.gameIdError}
            label="Input game ID:"
            id="gameId"
            value={this.state.gameId} onChange={this.setStateField} />
        </Grid>
        <Grid item>
          <Button
            size="large"
            disabled={this.state.isLoading}
            onClick={this.getGameData}
            variant="contained"
          >
            {this.state.isLoading ?
              <>
                <Typography p={1}>Loading...</Typography>
                <CircularProgress />
              </>
            :
              <>
                <Typography p={1}>Fetch data</Typography>
                <SearchIcon />
              </>
            }
          </Button>
        </Grid>

        <Grid item xs={12}>
          {this.state.gameData &&
            <>
              <TeamInfo teamData={this.state.gameData.blueTeam} teamSide={"Blue"} />

              <TeamInfo teamData={this.state.gameData.redTeam} teamSide={"Red"} />
            </>
          }
        </Grid>
      </Grid>
    );
  }
}

export default App;
