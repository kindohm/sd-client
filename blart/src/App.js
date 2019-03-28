import React, { Component } from "react";
import Instrument from "./Instrument";

class App extends Component {
  state = {
    numSteps: 16,
    instruments: ["bd", "cp"]
  };
  componentDidMount() {}

  doToggle() {
    console.log("doing it!");
    fetch("/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(resp => {
        return resp.json();
      })
      .then(json => {
        console.log("body", json);
      });
  }

  render() {
    const instruments = this.state.instruments.map(instrument => {
      return (
        <Instrument
          key={instrument}
          name={instrument}
          numSteps={this.state.numSteps}
        />
      );
    });
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <button onClick={this.doToggle}>do it man</button>
            {instruments}
          </div>
        </header>
      </div>
    );
  }
}

export default App;
