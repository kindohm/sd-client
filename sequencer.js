const osc = require('osc')
const maxFutureTime = 250
let stepTime = 200
const smallestTimeLeft = 50 // should be >= 40
const destinationServer = '127.0.0.1'
const destinationPort = 57120
const localPort = 57121
const localAddress = '0.0.0.0'
const loopTimeout = 10

let sequence = [],
  playing = false,
  toggledOn = false,
  nextStartTime = null,
  currentStep = 0

const udpPort = new osc.UDPPort({
  localAddress,
  localPort,
  metadata: true
})

udpPort.open()

udpPort.on('ready', function() {
  loop()
})

const setSequence = newSequence => {
  sequence = newSequence
}

const shouldSchedule = nextStartTime => {
  const diff = nextStartTime - Date.now()
  return diff <= smallestTimeLeft
}

const getSchedule = ({ startStep, startTime, refTime }) => {
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

const sendMessages = messages => {
  messages.forEach(message =>
    udpPort.send(message, destinationServer, destinationPort)
  )
}

const loop = () => {
  const now = Date.now()
  nextStartTime =
    nextStartTime === null || toggledOn ? now + 200 : nextStartTime

  if (!playing)
    return setTimeout(() => {
      loop()
    }, loopTimeout)

  toggledOn = false

  setTimeout(() => {
    if (shouldSchedule(nextStartTime)) {
      const batch = getSchedule({
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

const toggle = () => {
  playing = !playing
  toggledOn = playing
  console.log('sequencer.playing', playing)
}

const setStepTime = time => {
  stepTime = time
}

module.exports = { setSequence, toggle, setStepTime }
