const osc = require("osc");
const maxFutureTime = 250;
// let stepTime = 200
const smallestTimeLeft = 50; // should be >= 40
const destinationServer = "127.0.0.1";
const destinationPort = 57120;
const localPort = 57121;
const localAddress = "0.0.0.0";
const loopTimeout = 10;

let stepMap = null;

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

udpPort.on("ready", function() {
  loop();
});

const info = () => {
  return {
    playing
  };
};

const createStepMap = sequence => {
  let map = {};
  sequence.instruments.forEach(instrument => {
    map[instrument.name] = 0;
  });
  return map;
};

const setSequence = newSequence => {
  console.log("new sequence", newSequence);
  sequence = newSequence;

  if (!stepMap) {
    stepMap = createStepMap();
  }
};

const shouldSchedule = nextStartTime => {
  const diff = nextStartTime - Date.now();
  return diff <= smallestTimeLeft;
};

const getStepPackets = sounds => {
  return sounds.map(sound => ({
    address: "/play2",
    args: [
      {
        type: "s",
        value: "s"
      },
      { type: "s", value: sound.sample },
      { type: "s", value: "gain" },
      { type: "f", value: sound.gain || 1 }
    ]
  }));
};

const getSchedule = ({ startStep, startTime, refTime }) => {
  const stepTime = sequence.stepTime;
  const stepsToBatch = Math.ceil(stepTime / maxFutureTime);
  const steps = sequence.steps;
  let numStep = startStep;
  let messages = [];
  let accumulation = 0;

  for (let i = 0; i < stepsToBatch; i++) {
    if (!sequence || !steps || steps.length === 0 || steps[numStep] === "") {
      continue;
    }

    const { sounds, timeMult } = steps[numStep];

    messages.push({
      timeTag: osc.timeTag(
        (startTime + i * stepTime - refTime + accumulation) / 1000,
        refTime
      ),
      packets: getStepPackets(sounds)
    });
    numStep = numStep + 1 >= steps.length ? 0 : numStep + 1;

    if (timeMult && timeMult !== 1.0) {
      accumulation += (timeMult - 1) * stepTime;
    }
  }

  return {
    messages,
    nextStartTime: startTime + stepsToBatch * stepTime + accumulation,
    // nextStartStep:
    //   startStep + stepsToBatch >= steps.length ? 0 : startStep + stepsToBatch
    nextStartStep: !!steps ? (startStep + stepsToBatch) % steps.length : 0
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
  console.log("sequencer.playing", playing);
};

module.exports = { setSequence, toggle, info };
