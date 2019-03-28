import React from 'react';
import './StepGain.css';

export default class StepReps extends React.Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.repsChanged(event.target.value);
  }

  render() {
    return (
      <input
        className="vertical-range"
        orient="vertical"
        type="range"
        min="0"
        max="20"
        step="1"
        value={this.props.value}
        onInput={this.handleChange}
        onChange={this.handleChange}
      />
    );
  }
}
