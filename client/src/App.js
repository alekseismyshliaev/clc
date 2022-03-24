import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Container, Grid, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';



const BACKEND_URL = process.env.BACKEND_DOMAIN;


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
        <h3>{this.state.side} team: {this.state.win ? "VICTORY" : "DEFEAT"}</h3>
        <p>
          <Stack direction="row" spacing={2}>
            <Paper>Barons: {this.state.totalStats.barons}</Paper>
            <Paper>Dragons: {this.state.totalStats.dragons}</Paper>
            <Paper>Kills: {this.state.totalStats.kills}</Paper>
            <Paper>Towers: {this.state.totalStats.towers}</Paper>
            {this.state.totalStats.firstBlood && <Paper><b>FIRST BLOOD!</b></Paper>}
          </Stack>
        </p>
        <p>
          <Stack direction="row" spacing={2}>
            Bans:
            {this.state.bans.map(b => <Paper>{b}</Paper>)}
          </Stack>
        </p>
        <TeamParticipants participants={this.state.participants} />
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
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Player</TableCell>
            <TableCell>Champion</TableCell>
            <TableCell>Kills</TableCell>
            <TableCell>Deaths</TableCell>
            <TableCell>Assists</TableCell>
            <TableCell>KDA</TableCell>
            <TableCell>Creep Score</TableCell>
            <TableCell>CS/min</TableCell>
            <TableCell>Gold Earned</TableCell>
            <TableCell>Gold/min</TableCell>
            <TableCell>Gold %</TableCell>
            <TableCell>Vision Score</TableCell>
            <TableCell>VS/min</TableCell>
            <TableCell>Damage Dealt</TableCell>
            <TableCell>Damage/min</TableCell>
            <TableCell>Damage %</TableCell>
            <TableCell>Kill Participation</TableCell>
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
              <TableCell>{participant.kills}</TableCell>
              <TableCell>{participant.deaths}</TableCell>
              <TableCell>{participant.assists}</TableCell>
              <TableCell>{prettify(participant.kda)}</TableCell>
              <TableCell>{participant.cs}</TableCell>
              <TableCell>{prettify(participant.cspm)}</TableCell>
              <TableCell>{participant.gold}</TableCell>
              <TableCell>{prettify(participant.gpm)}</TableCell>
              <TableCell>{prettify(participant['g%'])}</TableCell>
              <TableCell>{participant.vision}</TableCell>
              <TableCell>{prettify(participant.vspm)}</TableCell>
              <TableCell>{participant.damage}</TableCell>
              <TableCell>{prettify(participant.dpm)}</TableCell>
              <TableCell>{prettify(participant['dmg%'])}</TableCell>
              <TableCell>{prettify(participant['kp%'])}</TableCell>
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
      gameData: null,
      isLoading: false,
    };
  };

  setStateField = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };

  getGameData = (e) => {
    this.setState({isLoading: true});
    fetch(`${BACKEND_URL}/api/game/${this.state.gameId}`, {
      method: "GET",
    }).then(response => response.json()).then(jsonData => this.setState({gameData: jsonData, isLoading: false}));
  };

  render() {
    return (
      <Container className="App" maxWidth={false}>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <header className="App-header">
              <img src={logo} className={`App-logo ${this.state.isLoading ? "loading" : ""}`} alt="logo" />
            </header>
          </Grid>

          <TextField label="Input game ID:" id="gameId" value={this.state.gameId} onChange={this.setStateField} />
          <Button onClick={this.getGameData}>Fetch Data</Button>

          <Grid item xs={12}>
            {this.state.gameData &&
              <>
                <TeamInfo teamData={this.state.gameData.blueTeam} teamSide={"Blue"} />

                <TeamInfo teamData={this.state.gameData.redTeam} teamSide={"Red"} />
              </>
            }
            <Paper elevation={2}>
              {this.state.gameData &&
                <>
                  <p>Raw data fom RIOT:</p>
                  <pre className={"json-text"}>{JSON.stringify(this.state.gameData, null, 4)}</pre>
                </>
              }
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default App;
