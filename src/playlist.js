import React from 'react';

// import ListEntry from './listEntry.js';

const Playlist = ({ userPlaylist }) => {
  // console.log(videos);
  return (
    <div>
      <h3 style={{ 
        color: "black", backgroundColor: "#ECEBEB", fontFamily: "Big Shoulders Display", textalign: "center", fontSize: 20, fontWeight: 100, textAlign: "center", padding: "10px 20px"
        }}>Your Playlist:</h3>
      <ul>
        {userPlaylist.map((video) => (
          <li>{video.snippet.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Playlist;
