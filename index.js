const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require("mongoose")
let bodyParser = require('body-parser')

require('dotenv').config()
app.use(express.json());
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(bodyParser.urlencoded({ extended: false }));

const user = new mongoose.Schema({
  username: { type: String, required: true },
})
const exercise = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // referencia al usuario
    ref: 'User', // nombre del modelo que referencia
    required: true
  },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String }
})
const User = mongoose.model("User", user)
const Exercise = mongoose.model("Exercise", exercise)

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {
  const username = req.body.username
  const user = new User({ username })
  const data = await user.save()
  res.json(data)
})

app.get('/api/users', async (req, res) => {
  const users = await User.find({})
  res.json(users)
})

app.post("/api/users/:_id/exercises", async (req, res) => {
  const _id = req.params._id
  const user = await User.findById(_id)
  if (!user) return res.status(404).json({ error: "User not found" });

  const exercise = req.body
  const parsedDate = exercise.date && !isNaN(new Date(exercise.date))
    ? new Date(exercise.date).toDateString()
    : new Date().toDateString();
  const exa = new Exercise({
    userId: user._id,
    description: exercise.description,
    duration: Number(exercise.duration), date: parsedDate
  })
  await exa.save()
  const response = {
    _id: user._id,
    username: user.username,
    description: exercise.description,
    duration: Number(exercise.duration),
    date: parsedDate
  }

  res.json(response)
})

app.get("/api/users/:_id/logs", async (req, res) => {
  const _id = req.params._id
  const { from, to, limit } = req.query

  const user = await User.findOne({ _id })
  if (!user) {

  }
  let query = { userId: _id }
  if (from || to) {
    query.date = {}
    if (from) query.date.$gte = new Date(from)
    if (to) query.date.$lte = new Date(to)
  }
  const exercises = await Exercise.find(query).limit(limit ? parseInt(limit) : 0)
  res.json({ ...user, count: exercises.length, log: exercises })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
