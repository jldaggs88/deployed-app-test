import React from 'react';

// import ListEntry from './listEntry.js';

const Playlist = ({ userPlaylist }) => {
  return (
    <div>
      <h3 style={{ 
        color: "black", backgroundColor: "#ECEBEB", fontFamily: "verdana", textalign: "center", fontSize: 65, fontWeight: 600, textAlign: "center", padding: "10px 20px"
        }}>Your Playlist:
      </h3>
      <ul>
        {userPlaylist.map((video) => (
          <li>{video.snippet.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default Playlist;
