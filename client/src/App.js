import React from 'react';
import logo from './logo.svg';
import './App.css';

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
    fetch("/api/v1/getGameData", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        gameId: this.state.gameId
      }),
    }).then(response => response.json()).then(jsonData => this.setState({gameData: jsonData, isLoading: false}));
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className={`App-logo ${this.state.isLoading ? "loading" : ""}`} alt="logo" />
          <p>
            Input game ID: <input id="gameId" value={this.state.gameId} onChange={this.setStateField}></input><button onClick={this.getGameData}>Fetch Data</button>
          </p>
          {this.state.gameData ?
          <p>{JSON.stringify(this.state.gameData)}</p>
          :
          ""}
        </header>
      </div>
    );
  }
}

export default App;
