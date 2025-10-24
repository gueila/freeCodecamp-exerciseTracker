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
const User = mongoose.model("User", user)

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});
// {
//   username: "fcc_test",
//   description: "test",
//   duration: 60,
//   date: "Mon Jan 01 1990",
//   _id: "5fb5853f734231456ccb3b05"
// }

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


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
