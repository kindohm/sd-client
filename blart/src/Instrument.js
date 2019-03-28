import React from 'react';
import StepGain from './StepGain';
import StepTimeMult from './StepTimeMult';

export default class Instrument extends React.Component {
  handleGainChanged(index, newVel) {
    const newSteps = this.props.instrument.steps.map((step, i) => {
      return i === index ? { ...step, vel: parseFloat(newVel) } : step;
    });
    const newInstrument = { ...this.props.instrument, steps: newSteps };
    this.props.instrumentChanged(newInstrument);
  }

  handleTimeMultChanged(index, newTimeMult) {
    const newSteps = this.props.instrument.steps.map((step, i) => {
      return i === index
        ? { ...step, timeMult: parseFloat(newTimeMult) }
        : step;
    });
    const newInstrument = { ...this.props.instrument, steps: newSteps };
    this.props.instrumentChanged(newInstrument);
  }

  render() {
    console.log('re-rendering instrument', this.props.view);
    const steps = this.props.instrument.steps.slice(0, this.props.numSteps);
    const stepGains = steps.map((step, index) => {
      return this.props.view === 'gains' ? (
        <StepGain
          key={index}
          value={step.vel}
          gainChanged={val => this.handleGainChanged(index, val)}
        />
      ) : (
        <StepTimeMult
          key={index}
          value={step.timeMult || 1}
          timeMultChanged={val => this.handleTimeMultChanged(index, val)}
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
