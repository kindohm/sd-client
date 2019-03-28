const testSequence = {
  stepTime: 200,
  numSteps: 5,
  instruments: [
    {
      name: "kick",
      s: "bd",
      steps: [{ vel: 1 }, { vel: 1 }, { vel: 0 }, { vel: 0 }, { vel: 1 }]
    },
    {
      name: "clap",
      s: "cp",
      steps: [{ vel: 0 }, { vel: 0 }, { vel: 1 }, { vel: 0 }, { vel: 1 }]
    }
  ]
};

module.exports = testSequence;
