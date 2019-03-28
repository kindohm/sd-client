const osc = require('osc');
const maxFutureTime = 250;
// let stepTime = 200
const smallestTimeLeft = 50; // should be >= 40
const destinationServer = '127.0.0.1';
const destinationPort = 57120;
const localPort = 57121;
const localAddress = '0.0.0.0';
const loopTimeout = 10;

// let stepMap = null;

let sequence = [],
  playing = false,
  toggledOn = false,
  nextStartTime = null,
  currentStep = 0;

const udpPort = new osc.UDPPort({
  localAddress,
  localPort,
  metadata: true
});

udpPort.open();

udpPort.on('ready', function() {
  loop();
});

const info = () => {
  return {
    playing
  };
};

const setSequence = newSequence => {
  console.log('new sequence', JSON.stringify(newSequence));
  sequence = newSequence;
};

const shouldSchedule = nextStartTime => {
  const diff = nextStartTime - Date.now();
  return diff <= smallestTimeLeft;
};

const getStepTimeMult = instrumentsOnStep => {
  const first = instrumentsOnStep.find(i => i.timeMult !== undefined);

  return !!first ? first.timeMult : 1;
};

const getStepPackets = instrumentsOnStep => {
  const result = instrumentsOnStep.map(instrument => ({
    address: '/play2',
    args: [
      {
        type: 's',
        value: 's'
      },
      { type: 's', value: instrument.s },
      { type: 's', value: 'gain' },
      {
        type: 'f',
        value: instrument.vel
      }
    ]
  }));
  return result;
};

const getSchedule = ({ startStep, startTime, refTime }) => {
  const { stepTime, numSteps, instruments } = sequence;
  const stepsToBatch = Math.ceil(stepTime / maxFutureTime);
  let numStep = startStep;
  let messages = [];
  let accumulation = 0;

  for (let i = 0; i < stepsToBatch; i++) {
    const instrumentsOnStep = instruments
      .map(instrument => {
        return { ...instrument.steps[numStep], s: instrument.s };
      })
      .filter(inst => {
        return inst.vel === undefined || inst.vel !== 0;
      });

    messages.push({
      timeTag: osc.timeTag(
        (startTime + i * stepTime - refTime + accumulation) / 1000,
        refTime
      ),
      packets: getStepPackets(instrumentsOnStep)
    });
    numStep = numStep + 1 >= numSteps ? 0 : numStep + 1;

    const timeMult = getStepTimeMult(instrumentsOnStep);

    if (timeMult && timeMult !== 1.0) {
      accumulation += (timeMult - 1) * stepTime;
    }
  }

  return {
    messages,
    nextStartTime: startTime + stepsToBatch * stepTime + accumulation,
    // nextStartStep:
    //   startStep + stepsToBatch >= steps.length ? 0 : startStep + stepsToBatch
    nextStartStep: !!sequence ? (startStep + stepsToBatch) % numSteps : 0
  };
};

const sendMessages = messages => {
  messages.forEach(message =>
    udpPort.send(message, destinationServer, destinationPort)
  );
};

const loop = () => {
  const now = Date.now();
  nextStartTime =
    nextStartTime === null || toggledOn ? now + 200 : nextStartTime;

  if (!playing)
    return setTimeout(() => {
      loop();
    }, loopTimeout);

  toggledOn = false;

  setTimeout(() => {
    if (shouldSchedule(nextStartTime)) {
      const schedule = getSchedule({
        startStep: currentStep,
        startTime: nextStartTime,
        refTime: now
      });

      nextStartTime = schedule.nextStartTime;
      currentStep = schedule.nextStartStep;

      sendMessages(schedule.messages);
    }

    loop();
  }, loopTimeout);
};

const toggle = () => {
  playing = !playing;
  toggledOn = playing;
  console.log('sequencer.playing', playing);
};

module.exports = { setSequence, toggle, info };
