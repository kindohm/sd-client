const osc = require('osc')

// Create an osc.js UDP Port listening on port 57121.
var udpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: 57121,
  metadata: true
})

udpPort.open()

const maxFutureTime = 250
const stepTime = 15
const smallestTimeLeft = 50 // should be >= 40
const server = '127.0.0.1'
const port = 57120

const steps = [
  'bd',
  'bd',
  'bd',
  'bd',
  'bd',
  'bd',
  'bd',
  'bd',
  'bd',
  'bd',
  'bd',
  'cp',
  '',
  '',
  '',
  '',
  ''
]

function shouldBatch(nextStartTime) {
  const diff = nextStartTime - Date.now()
  return diff <= smallestTimeLeft
}

function getBatch({ startStep, startTime, refTime }) {
  const stepsToBatch = Math.ceil(stepTime / maxFutureTime)
  let numStep = startStep
  let messages = []

  for (let i = 0; i < stepsToBatch; i++) {
    if (steps[numStep] === '') continue
    messages.push({
      timeTag: osc.timeTag(
        (startTime + i * stepTime - refTime) / 1000,
        refTime
      ),
      packets: [
        {
          address: '/play2',
          args: [
            {
              type: 's',
              value: 's'
            },
            { type: 's', value: steps[numStep] }
          ]
        }
      ]
    })
    numStep = numStep + 1 >= steps.length ? 0 : numStep + 1
  }
  return {
    messages,
    nextStartTime: startTime + stepsToBatch * stepTime,
    nextStartStep:
      startStep + stepsToBatch >= steps.length ? 0 : startStep + stepsToBatch
  }
}

function sendMessages(messages) {
  messages.forEach(message => udpPort.send(message, server, port))
}

let nextStartTime = null
let currentStep = 0

function loop() {
  const now = Date.now()
  nextStartTime = nextStartTime === null ? now + 200 : nextStartTime

  setTimeout(() => {
    if (shouldBatch(nextStartTime)) {
      const batch = getBatch({
        startStep: currentStep,
        startTime: nextStartTime,
        refTime: now
      })

      nextStartTime = batch.nextStartTime
      currentStep = batch.nextStartStep

      sendMessages(batch.messages)
    } else {
      //   console.log('nope', nextStartTime)
    }
    loop()
  }, 10)
}

udpPort.on('ready', function() {
  loop()
})
