const osc = require('osc')
const maxFutureTime = 250
const stepTime = 200
const smallestTimeLeft = 50 // should be >= 40
const destinationServer = '127.0.0.1'
const destinationPort = 57120
const localPort = 57121
const localAddress = '0.0.0.0'
const loopTimeout = 10

let sequence = [],
  playing = false

const udpPort = new osc.UDPPort({
  localAddress,
  localPort,
  metadata: true
})

udpPort.open()

udpPort.on('ready', function() {
  loop()
})

function setSequence(newSequence) {
  sequence = newSequence
}

function shouldBatch(nextStartTime) {
  const diff = nextStartTime - Date.now()
  return diff <= smallestTimeLeft
}

function getBatch({ startStep, startTime, refTime }) {
  const stepsToBatch = Math.ceil(stepTime / maxFutureTime)
  let numStep = startStep
  let messages = []

  for (let i = 0; i < stepsToBatch; i++) {
    if (!sequence || sequence.length === 0 || sequence[numStep] === '') continue
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
            { type: 's', value: sequence[numStep] }
          ]
        },
        {
          address: '/play2',
          args: [
            {
              type: 's',
              value: 's'
            },
            { type: 's', value: 'arpy' }
          ]
        }
      ]
    })
    numStep = numStep + 1 >= sequence.length ? 0 : numStep + 1
  }
  return {
    messages,
    nextStartTime: startTime + stepsToBatch * stepTime,
    nextStartStep:
      startStep + stepsToBatch >= sequence.length ? 0 : startStep + stepsToBatch
  }
}

function sendMessages(messages) {
  messages.forEach(message =>
    udpPort.send(message, destinationServer, destinationPort)
  )
}

let nextStartTime = null
let currentStep = 0

function loop() {
  if (!playing) return setTimeout(() => loop, loopTimeout)

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
    }

    loop()
  }, loopTimeout)
}

function stop() {
  playing = false
}

function play() {
  playing = true
}

module.exports = { setSequence, stop, play }
