const Discord = require('discord.js');
const client = new Discord.Client();
const bodyParser = require('body-parser');
const config = require('config');


const express = require('express');
const app = express();
app.use(bodyParser.json());

const port = config.get('port');
const token = config.get('token');

var connection = null

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const broadcast = client.voice.createBroadcast();

var volume = 1

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/channels', (req, res) => {
  channels = client.channels.cache.filter(channel => {
    return channel.type === "voice"
  });

  data = channels.map(channel => {
    channel["server"] = channel.guild.name;
    channel["mem"] = channel.members;
    return channel
  })
  res.json(data)
})


/*
  curl --request POST localhost:3000/play/758709852411002913/Fuifje.mp3
  758709852411002913
*/
app.post('/play/:id', (req, res) => {
  channel = client.channels.cache.get(req.params.id);
  //console.log(connection);
  connection.play(broadcast);

  console.log("Will play:", req.body);
  broadcast.play(req.body.url)
  broadcast.dispatcher.setVolume(volume);
  res.sendStatus(200);
});


app.post('/pause/', (req, res) => {
  broadcast.dispatcher.pause()
  res.sendStatus(200);
});

/// Sets the volume relative to the input stream - i.e. 1 is normal, 0.5 is half, 2 is double.
app.post('/volume/', (req, res) => {
  console.log("received volume");
  console.log(req.body.volume);
  volume = req.body.volume;
  broadcast.dispatcher.setVolume(volume);
  res.sendStatus(200);
});


app.post('/resume/', (req, res) => {
  broadcast.dispatcher.resume()
  res.sendStatus(200);
});

/*
  curl --request POST localhost:3000/disconnect/758709852411002913
  758709852411002913
*/

app.post('/disconnect/:id', (req, res) => {
  channel = client.channels.cache.get(req.params.id);
  channel.leave()
  res.sendStatus(200);
});

/*
  curl --request POST localhost:3000/join/758709852411002913
*/

app.post('/join/:id', (req, res) => {
    console.log(req.params.id)
    channel = client.channels.cache.get(req.params.id);
    console.log(channel);
    channel.join().then(connection_i => {
      connection = connection_i
      console.log("Successfully connected.");
    })
    .catch(console.error);
    res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
})

client.login(token);
