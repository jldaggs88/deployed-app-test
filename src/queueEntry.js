import React, { useState } from 'react';
import axios from 'axios';
import { PORT } from '../config.js'

import Button from 'react-bootstrap/Button';
import Image from "react-bootstrap/Image"



const QueueEntry = ({ video, listClickHandler, sortPlaylist, accessCode, userId }) => {
  const [voteCount, setVoteCount] = useState(0);
  const voteUpdate = (direction) => {
    axios.put(`http://localhost:${PORT}/vote/`, {
      userId,
      url: video.id.videoId,
      direction,
      accessCode
    })
    .then(({ data }) => {
      setVoteCount(data.newVoteCount || 0);
    })
  }
  // voteUpdate()
  return (
    <div>
      <div>
        <Image src={video.snippet.thumbnails.default.url} onClick={() => listClickHandler(video)} rounded></Image>
      </div>
      <div>
        <div onClick={() => listClickHandler(video)}>{video.snippet.title}</div>
        <div>{video.snippet.channelTitle}</div>
        <div>{voteCount} votes</div>
        <div>
          <Button
            className="voteUp"
            onClick={() => {
            // setVoteCount(voteCount + 1);
              voteUpUpdate();
            }
            }
          >
            Up vote
          </Button>
          <Button
            className="voteDown"
            onClick={() => {
              voteDownUpdate();
            }
            }
          >
            Down vote
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QueueEntry;
