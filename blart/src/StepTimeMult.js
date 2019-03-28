import React from 'react';
import './StepGain.css';

export default class StepTimeMult extends React.Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.timeMultChanged(event.target.value);
  }

  render() {
    return (
      <input
        className="vertical-range"
        orient="vertical"
        type="range"
        min="0.05"
        max="8"
        step="0.01"
        value={this.props.value}
        onInput={this.handleChange}
        onChange={this.handleChange}
      />
    );
  }
}
