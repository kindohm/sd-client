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
    ],
    view: 'gains'
  };

  constructor() {
    super();
    this.doToggle = this.doToggle.bind(this);
    this.sendSequence = this.sendSequence.bind(this);
    this.handleStepTimeChange = this.handleStepTimeChange.bind(this);
    this.handleNumStepsChange = this.handleNumStepsChange.bind(this);
    this.handleViewChanged = this.handleViewChanged.bind(this);
  }

  componentDidMount() {}

  doToggle() {
    this.sendSequence()
      .then(() => {
        return fetch('/toggle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
      })
      .then(resp => {
        console.log('resp', resp);
        return resp.json();
      })
      .then(json => {
        console.log('/toggle', json);
      });
  }

  sendSequence() {
    const body = JSON.stringify(this.state);

    return fetch('/seq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    })
      .then(res => {
        return res.json();
      })
      .then(json => () => {});
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

  handleViewChanged(event) {
    this.setState({ ...this.state, view: event.target.value });
  }

  handleStepTimeChange(event) {
    this.setState(
      { ...this.state, stepTime: parseFloat(event.target.value) },
      () => {
        this.sendSequence();
      }
    );
  }

  handleNumStepsChange(event) {
    const newNumSteps = parseInt(event.target.value);
    const newInstruments = this.state.instruments.map(inst => {
      if (inst.steps.length < newNumSteps) {
        return {
          ...inst,
          steps: inst.steps.concat(
            new Array(newNumSteps - inst.steps.length)
              .fill(null)
              .map(newStep => ({ vel: 0 }))
          )
        };
      } else {
        return inst;
      }
    });
    this.setState(
      { ...this.state, numSteps: newNumSteps, instruments: newInstruments },
      () => {
        this.sendSequence();
      }
    );
  }

  render() {
    console.log('state', this.state);
    const instruments = this.state.instruments.map(instrument => {
      return (
        <Instrument
          key={instrument.name}
          instrument={instrument}
          numSteps={this.state.numSteps}
          instrumentChanged={i => this.instrumentChanged(i)}
          view={this.state.view}
        />
      );
    });
    return (
      <div className="App">
        <header className="App-header">
          <div>
            <button
              style={{ padding: '10px', fontSize: '16px' }}
              onClick={this.doToggle}
            >
              play/pause
            </button>
            <div>
              <h3>Step Time</h3>
              <input
                type="range"
                min="15"
                max="300"
                step="1"
                value={this.state.stepTime}
                onInput={this.handleStepTimeChange}
                onChange={this.handleStepTimeChange}
              />
            </div>
            <div>
              <h3># steps {this.state.numSteps}</h3>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={this.state.numSteps}
                onInput={this.handleNumStepsChange}
                onChange={this.handleNumStepsChange}
              />
            </div>
            <div>
              <select onChange={this.handleViewChanged}>
                <option value="gains">gains</option>
                <option value="mults">mults</option>
              </select>
            </div>
            {instruments}
          </div>
        </header>
      </div>
    );
  }
}

export default App;
