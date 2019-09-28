const osc = require('osc');
const maxFutureTime = 250;
const smallestTimeLeft = 50; // should be >= 40
const destinationServer = '127.0.0.1';
const destinationPort = 57120;
const localPort = 57121;
const localAddress = '0.0.0.0';
const loopTimeout = 10;

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
  sequence = newSequence;
};

const shouldSchedule = nextStartTime => {
  const diff = nextStartTime - Date.now();
  return diff <= smallestTimeLeft;
};

const getSoundPacket = (sample, gain) => {
  return {
    address: '/play2',
    args: [
      {
        type: 's',
        value: 's'
      },
      { type: 's', value: 'midi' },
      { type: 's', value: 'midinote' },
      { type: 'f', value: parseFloat(sample) },
      { type: 's', value: 'midichan' },
      { type: 'f', value: 0 },
      { type: 's', value: 'gain' },
      {
        type: 'f',
        value: gain * 1.2
      }
    ]
  };
};

const getStepPackets = instrumentsOnStep => {
  const result = instrumentsOnStep.map(instrument =>
    getSoundPacket(instrument.s, instrument.vel)
  );
  return result;
};

const getInstrumentsOnStep = (instruments, numStep) => {
  const result = instruments
    .map(instrument => {
      return { ...instrument.steps[numStep], s: instrument.s };
    })
    .filter(inst => {
      return inst.vel === undefined || inst.vel !== 0;
    });
  return result;
};

const getSchedule = ({ startStep, startTime, refTime }) => {
  const { stepTime, numSteps, instruments, timeMults } = sequence;
  const stepsToBatch = Math.ceil(stepTime / maxFutureTime);
  let numStep = startStep;
  let messages = [];
  let accumulation = 0;

  for (let i = 0; i < stepsToBatch; i++) {
    const timeMult = timeMults[numStep];
    const instrumentsOnStep = getInstrumentsOnStep(instruments, numStep);

    const timestamp = startTime + i * stepTime - refTime + accumulation;
    messages.push({
      timeTag: osc.timeTag(timestamp / 1000, refTime),
      packets: getStepPackets(instrumentsOnStep)
    });

    const instrumentsWithReps = instrumentsOnStep.filter(i => i.reps > 0);
    instrumentsWithReps.forEach(inst => {
      const { reps, vel } = inst;
      const repUnitTime = (stepTime * timeMult) / (reps + 1);
      for (let x = 0; x < reps; x++) {
        const msg = getSoundPacket(inst.s, vel);
        const repTimestamp = timestamp + repUnitTime * (x + 1);
        messages.push({
          timeTag: osc.timeTag(repTimestamp / 1000, refTime),
          packets: [msg]
        });
      }
    });

    numStep = numStep + 1 >= numSteps ? 0 : numStep + 1;

    if (timeMult && timeMult !== 1.0) {
      accumulation += (timeMult - 1) * stepTime;
    }
  }

  return {
    messages,
    nextStartTime: startTime + stepsToBatch * stepTime + accumulation,
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
