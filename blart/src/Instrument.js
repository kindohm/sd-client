import React from 'react';
import StepGain from './StepGain';
import StepReps from './StepReps';

export default class Instrument extends React.Component {
  handleGainChanged(index, newVel) {
    const newSteps = this.props.instrument.steps.map((step, i) => {
      return i === index ? { ...step, vel: parseFloat(newVel) } : step;
    });
    const newInstrument = { ...this.props.instrument, steps: newSteps };
    this.props.instrumentChanged(newInstrument);
  }

  handleRepsChanged(index, newReps) {
    const newSteps = this.props.instrument.steps.map((step, i) => {
      return i === index ? { ...step, reps: parseFloat(newReps) } : step;
    });
    const newInstrument = { ...this.props.instrument, steps: newSteps };
    this.props.instrumentChanged(newInstrument);
  }

  render() {
    const steps = this.props.instrument.steps.slice(0, this.props.numSteps);

    const stepGains = steps.map((step, index) => {
      return (
        <StepGain
          key={index}
          value={step.vel}
          gainChanged={val => this.handleGainChanged(index, val)}
        />
      );
    });

    const stepReps = steps.map((step, index) => {
      return (
        <StepReps
          key={index}
          value={step.vel}
          repsChanged={val => this.handleRepsChanged(index, val)}
        />
      );
    });

    return (
      <div style={{ backgroundColor: '#eee', padding: '5px', margin: '5px' }}>
        <h4>{this.props.instrument.name}</h4>
        <div>
          <p>
            <strong>Gains</strong>
          </p>
          {stepGains}
        </div>
        <div>
          <p>
            <strong>Reps</strong>
          </p>
          {stepReps}
        </div>
      </div>
    );
  }
}
