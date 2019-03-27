const path = require('path')
const sequencer = require('./sequencer')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const convertRange = require('./convertRange')
const port = 3000

app.use('/', express.static(path.join(__dirname, 'public')))

io.on('connection', function(socket) {
  console.log('a user connected')
  socket.on('toggle', msg => {
    console.log('toggle', msg)
    sequencer.toggle()
  })
  socket.on('setStepTime', msg => {
    const newStepTime = convertRange(msg, [1, 100], [20, 500])
    console.log('setting new step time', newStepTime)
    sequencer.setStepTime(newStepTime)
  })
  socket.on('setSequence', seq => {
    console.log('new sequence', seq)
    sequencer.setSequence(seq)
  })
})

http.listen(3000, console.log('listening on *:3000'))

sequencer.setSequence([])
