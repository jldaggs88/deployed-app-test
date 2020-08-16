const { Router } = require('express');
const router = Router();
const {
    Playlist,
    PlaylistSong,
    User,
    Song,
    Party,
    PartySongUser
  } = require('../db/database.js');

//Set up routes
// router.get('/', (req, res) => {
// 	res.sendFile(HTML_FILE);
// });

//Login route
router.post('/login', async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } })

  if (user === null) {
    await User.create(req.body)
      .then((dbResponse) => {
        res.send({ user: dbResponse });
      })
  } else {
    // Look up (findOne) playlist id with user id (user.id)
    const playlist = await Playlist.findOne({ where: { userId: user.id } })
    if (playlist) {
      // Look up (findAll) songIDs with playlistID
      const playlistSongs = await PlaylistSong.findAll({ where: { playlistId: playlist.id }, raw: true })
      if (playlistSongs) {
        // Look up (findAll) songs with songID
        const songs = playlistSongs.map(song => Song.findByPk(song.songId, { raw: true }));

        await Promise.all(songs).then(mapped => res.send({ user, songs: mapped }));
        return;
        // const songs = await Song.findAll({ where: {  } })
      }
    }
    res.send({ user }); // Send em back to the client
  }
});

// update / reset votes
router.put('/vote', async (req, res) => {
  // console.log('vote request body', req.body)
  const { url, direction, accessCode, reset, userId } = req.body;
  const party = await Party.findOne({ where: { accessCode } });
  const playlist = await Playlist.findOne({ where: { userId: party.hostId } })
  const song = url && await Song.findOne({ where: { url } })
  if (reset === true) {
    await PartySongUser.destroy({ where: { partyId: party.id } });
    await party.destroy();
    const playlistSongs = await PlaylistSong.findAll({ where: { playlistId: playlist.id } }, {raw: true});
    await Promise.all(playlistSongs.map(song => song.update({ vote: null })))
    .then(() => {
      res.sendStatus(200);
    })
    .catch((err) => {
      console.error(err);
    })
    return;
  } else {
    // console.log(song, playlist);
    const playlistSong = await PlaylistSong.findOne({ where: { songId: song.id, playlistId: playlist.id } })
    let voteObj = { vote: playlistSong.vote }
    if (direction === 'up') {
      voteObj.vote++;
    } else if (direction === 'down' && voteObj.vote !== 0) {
      voteObj.vote--;
    } else {
      res.send({ newVoteCount: voteObj.vote});
      return;
    }
    const partySongUser = await PartySongUser.findOne({ where: { partyId: party.id, songId: song.id, userId } })
    if (partySongUser === null) {
      PartySongUser.create({ partyId: party.id, songId: song.id, userId });
      playlistSong.update(voteObj)
      .then(() => {
        res.send({ newVoteCount: playlistSong.vote })
      })
    } else {
      res.send({ newVoteCount: playlistSong.vote })
    }
  }
});

router.get('/party/:code', async (req, res) => {
  const accessCode = req.params.code;

  const party = await Party.findOne({ where: { accessCode } });
  const playlist = await Playlist.findOne({ where: { userId: party.hostId } })

  const playlistSongs = await PlaylistSong.findAll({ where: { playlistId: playlist.id } }, {raw: true})

  const songsWithDetails = playlistSongs.map(song => {
    return Song.findByPk(song.songId, { raw: true })
  })

  await Promise.all(songsWithDetails).then(result => {
    res.send(result.map((song, index) => {
      const nowPlaying = song.url === party.nowPlaying;
      return { song, vote: playlistSongs[index].vote || 0, nowPlaying }
    }))
  });
})

// create / delete host
router.post('/host', async (req, res) => {
  const { host, id } = req.body;
  const user = await User.findByPk(id);
  const party = await Party.findOne({ where: { hostId: id } });
  if (host === false) {
    user.update({ hostedPartyId: null });
  } else {
    if (party === null) {
      let accessCode = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const charactersLength = characters.length;
      for (var i = 0; i < 5; i++) {
        accessCode += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      Party.create({ hostId: id, accessCode })
      .then(({ dataValues }) => {
        user.update({ hostedPartyId: dataValues.id });
        res.send(accessCode);
      });
    } else {
      res.send(party.accessCode);
    }
  }
});

router.post('/playlist/:user', async (req, res) => {
  // console.log('Request Params', req.params.user)
  // console.log('Request Body', req.body)
  // let songId;
  // let playlistId;
  const userId = req.params.user;

  let song = await Song.findOne({ where: { url: req.body.url } }) // Look for song in the db
  let alreadyExists = false;

  if (song === null) {
    await Song.create(req.body) // Create entry if its not there
      .then(({ dataValues }) => {
        song = dataValues; // Save the song the db generated
      })
  }

  let playlist = await Playlist.findOne({ where: { userId } }) // Look for existing playlist for current user
  
  if (playlist === null) {
    await Playlist.create({ userId }) // Create playlist if user doesn't have one
      .then(({ dataValues }) => {
        playlist = dataValues; // Save the playlist ID generated by the db
      })
  };

  let playlist_song = await PlaylistSong.findOne({ where: { playlistId: playlist.id, songId: song.id } });

  if (playlist_song === null) {
    PlaylistSong.create({ playlistId: playlist.id, songId: song.id });
  } else {
    alreadyExists = true;
  }

  res.send(alreadyExists); // Tell client if song was already in the database
});

router.put('/party', async (req, res) => {
  const { nowPlaying, accessCode } = req.body;
  await Party.update({ nowPlaying }, { where: { accessCode } })
  res.sendStatus(200);
})

module.exports = {
	router,
};