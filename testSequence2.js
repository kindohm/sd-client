const testSequence = {
  stepTime: 100,
  numSteps: 4,
  instruments: [
    {
      name: "kick",
      s: "bd",
      steps: [{ vel: 1 }, { vel: 1 }, { vel: 0 }, { vel: 0 }]
    },
    {
      name: "clap",
      s: "cp",
      steps: [{ vel: 0 }, { vel: 0 }, { vel: 1 }, { vel: 0 }]
    }
  ]
};

module.exports = testSequence;
