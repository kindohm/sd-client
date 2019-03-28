const testSequence = {
  stepTime: 100,
  steps: [
    {
      sounds: [{ sample: "drum", gain: 1 }, { sample: "arpy" }]
    },
    {
      sounds: [{ sample: "drum", gain: 0.95 }]
    }
  ]
};

module.exports = testSequence;
