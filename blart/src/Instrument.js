import React from 'react';
import StepGain from './StepGain';

export default class Instrument extends React.Component {
  handleGainChanged(index, newVel) {
    const newSteps = this.props.instrument.steps.map((step, i) => {
      return i === index ? { ...step, vel: parseFloat(newVel) } : step;
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
    return (
      <div>
        <h4>{this.props.instrument.name}</h4>
        <div>{stepGains}</div>
      </div>
    );
  }
}
