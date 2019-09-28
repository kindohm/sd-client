import React, { Component } from 'react';
import Instrument from './Instrument';
import StepTimeMult from './StepTimeMult';

class App extends Component {
  state = {
    stepTime: 200,
    numSteps: 5,
    timeMults: [1, 1, 1, 1, 1],
    instruments: [
      {
        name: 'kick',
        s: '0',
        steps: [
          { vel: 1, reps: 0 },
          { vel: 1 },
          { vel: 0 },
          { vel: 0 },
          { vel: 1 }
        ]
      },
      {
        name: 'clap',
        s: '3',
        steps: [{ vel: 0 }, { vel: 0 }, { vel: 1 }, { vel: 0 }, { vel: 1 }]
      },
      {
        name: 'rave2',
        s: '1',
        steps: [{ vel: 0 }, { vel: 0 }, { vel: 1 }, { vel: 0 }, { vel: 1 }]
      }
    ]
  };

  constructor() {
    super();
    this.doToggle = this.doToggle.bind(this);
    this.sendSequence = this.sendSequence.bind(this);
    this.handleStepTimeChange = this.handleStepTimeChange.bind(this);
    this.handleNumStepsChange = this.handleNumStepsChange.bind(this);
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
        // console.log('resp', resp);
        return resp.json();
      })
      .then(json => {
        // console.log('/toggle', json);
      });
  }

  sendSequence() {
    // console.log('sending', this.state);
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

  handleStepTimeChange(event) {
    this.setState(
      { ...this.state, stepTime: parseFloat(event.target.value) },
      () => {
        this.sendSequence();
      }
    );
  }

  handleTimeMultChanged(index, newVal) {
    // 1. Make a shallow copy of the items
    let mults = [...this.state.timeMults];
    // 2. Make a shallow copy of the item you want to mutate
    let mult = { ...mults[index] };
    // 3. Replace the property you're intested in
    mult = parseFloat(newVal);
    // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
    mults[index] = mult;
    // 5. Set the state to our new copy
    this.setState({ ...this.state, timeMults: mults }, () => {
      this.sendSequence();
    });
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

    const newTimeMults = [...this.state.timeMults];
    if (newTimeMults.length < newNumSteps) {
      newTimeMults.splice(
        newTimeMults.length - 1,
        0,
        newNumSteps - newTimeMults.length
      );
    }

    this.setState(
      {
        ...this.state,
        numSteps: newNumSteps,
        instruments: newInstruments,
        timeMults: newTimeMults
      },
      () => {
        this.sendSequence();
      }
    );
  }

  render() {
    const timeMults = this.state.timeMults
      .slice(0, this.state.numSteps)
      .map((mult, index) => {
        return (
          <StepTimeMult
            key={index}
            value={mult}
            timeMultChanged={e => this.handleTimeMultChanged(index, e)}
          />
        );
      });

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
              <h3>Time Mults</h3>
              {timeMults}
            </div>
            <div>{instruments}</div>
          </div>
        </header>
      </div>
    );
  }
}

export default App;
