const path = require('path')
const sequencer = require('./sequencer')
const express = require('express')
const app = express()
const port = 2112
// const testSequence2 = require('./testSequence2');
// var bodyParser = require('body-parser');

app.use('/', express.static(path.join(__dirname, 'public')))
app.use(express.json())

app.get('/test', (req, res) => {
  res.json({ message: 'hi' })
})

app.post('/toggle', (req, res) => {
  sequencer.toggle()
  res.json(sequencer.info())
})

app.post('/seq', (req, res) => {
  console.log('/seq', req.body)
  sequencer.setSequence(req.body)
  res.json(req.body)
})

app.listen(port, console.log(`listening on *:${port}`))

//sequencer.setSequence(testSequence2);
// sequencer.toggle();
