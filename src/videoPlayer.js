import React from 'react';

const VideoPlayer = ({ video, nowPlaying }) => {
  if (nowPlaying) {
    return (
      <div>
        Now Playing: {`${nowPlaying.title} by ${nowPlaying.artist}`}
        {/* <div>
          <iframe src={`https://www.youtube.com/embed/${video.id.videoId}`} allowFullScreen />
          <iframe id="player" type="text/html" width="640" height="390"
    src={`http://www.youtube.com/embed/${video.id.videoId}?enablejsapi=1`}
    frameborder="0"></iframe>
        </div> */}
      </div>
      );
    };
  return <div></div>
  };

export default VideoPlayer;
