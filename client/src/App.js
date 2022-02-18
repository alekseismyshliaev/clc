import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Container, Grid, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';



const BACKEND_URL = 'http://localhost:3001';


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
            <TableCell>Gold Diff @14min</TableCell>
            <TableCell>CS Diff @14min</TableCell>
            <TableCell>First Blood</TableCell>
            <TableCell>K+A @14min</TableCell>
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
              <TableCell>{participant.kda}</TableCell>
              <TableCell>{participant.cs}</TableCell>
              <TableCell>{participant.cspm}</TableCell>
              <TableCell>{participant.gold}</TableCell>
              <TableCell>{participant.gpm}</TableCell>
              <TableCell>{participant['g%']}</TableCell>
              <TableCell>{participant.vision}</TableCell>
              <TableCell>{participant.vspm}</TableCell>
              <TableCell>{participant.damage}</TableCell>
              <TableCell>{participant.dpm}</TableCell>
              <TableCell>{participant['dmg%']}</TableCell>
              <TableCell>{participant['kp%']}</TableCell>
              <TableCell>{participant['gd@14']}</TableCell>
              <TableCell>{participant['csd@14']}</TableCell>
              <TableCell>{participant.fb}</TableCell>
              <TableCell>{participant['k+a@14']}</TableCell>
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
