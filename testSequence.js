const testSequence = {
  stepTime: 300,
  steps: [
    {
      sounds: [{ sample: 'drum', gain: 1 }]
    },
    {
      sounds: [{ sample: 'rave2' }]
    },
    {
      sounds: [{ sample: 'arpy', gain: 1 }],
      timeMult: 0.5
    },
    {
      sounds: [{ sample: 'cp' }],
      timeMult: 1.5
    },
    {
      sounds: [{ sample: 'cp' }],
      timeMult: 1.5
    },
    {
      sounds: [{ sample: 'bass2' }]
    }
  ]
}

module.exports = testSequence
