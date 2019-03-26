const osc = require('osc')

// Create an osc.js UDP Port listening on port 57121.
var udpPort = new osc.UDPPort({
  localAddress: '0.0.0.0',
  localPort: 57121,
  metadata: true
})

// Listen for incoming OSC bundles.
// udpPort.on('bundle', function(oscBundle, timeTag, info) {
//   console.log(
//     'An OSC bundle just arrived for time tag',
//     timeTag,
//     ':',
//     oscBundle
//   )
//   console.log('Remote info is: ', info)
// })

// Open the socket.
udpPort.open()

// When the port is read, send an OSC message to, say, SuperCollider
udpPort.on('ready', function() {
  setInterval(() => {
    udpPort.send(
      {
        timeTag: osc.timeTag(0.5),
        packets: [
          {
            address: '/play2',
            args: [
              {
                type: 's',
                value: 's'
              },
              { type: 's', value: 'bd' },
              { type: 's', value: 'cut' },
              { type: 's', value: '1' }
            ]
          }
        ]
      },
      '127.0.0.1',
      57120
    )
  }, 500)
})
