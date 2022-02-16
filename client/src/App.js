import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Button, Container, Grid, Paper, TextField } from '@mui/material';

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
    fetch(`/api/game/${this.state.gameId}`, {
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
            <Paper elevation={2}>
              {this.state.gameData &&
                <pre className={"json-text"}>{JSON.stringify(this.state.gameData, null, 4)}</pre>
              }
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default App;
