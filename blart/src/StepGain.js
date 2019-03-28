import React from 'react';
import './StepGain.css';

export default class StepGain extends React.Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.gainChanged(event.target.value);
  }

  render() {
    return (
      <input
        className="vertical-range"
        orient="vertical"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={this.props.value}
        onInput={this.handleChange}
        onChange={this.handleChange}
      />
    );
  }
}
