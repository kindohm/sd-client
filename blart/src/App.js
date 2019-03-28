import React, { Component } from 'react';
import Instrument from './Instrument';

class App extends Component {
  state = {
    stepTime: 200,
    numSteps: 5,
    instruments: [
      {
        name: 'kick',
        s: 'bd',
        steps: [{ vel: 1 }, { vel: 1 }, { vel: 0 }, { vel: 0 }, { vel: 1 }]
      },
      {
        name: 'clap',
        s: 'cp',
        steps: [{ vel: 0 }, { vel: 0 }, { vel: 1 }, { vel: 0 }, { vel: 1 }]
      }
    ]
  };

  constructor() {
    super();
    this.sendSequence = this.sendSequence.bind(this);
  }

  componentDidMount() {}

  doToggle() {
    console.log('doing it!');
    fetch('/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(resp => {
        return resp.json();
      })
      .then(json => {
        console.log('/toggle', json);
      });
  }

  sendSequence() {
    const body = JSON.stringify(this.state);
    console.log('body', body);

    fetch('/seq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    })
      .then(res => {
        return res.json();
      })
      .then(json => {
        console.log('/seq response:', json);
      });
  }

  instrumentChanged(changedInstrument) {
    const newInstruments = this.state.instruments.map(instrument => {
      return instrument.name === changedInstrument.name
        ? changedInstrument
        : instrument;
    });

    this.setState({ ...this.state, instruments: newInstruments }, () => {
      this.sendSequence();
    });
  }

  render() {
    const instruments = this.state.instruments.map(instrument => {
      return (
        <Instrument
          key={instrument.name}
          instrument={instrument}
          numSteps={this.state.numSteps}
          instrumentChanged={i => this.instrumentChanged(i)}
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
