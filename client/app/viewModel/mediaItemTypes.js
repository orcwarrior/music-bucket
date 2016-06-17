/**
 * Created by orcwa on 30.05.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaItemTypes', function () {

    var mediaItemTypes = {
      spotifyPlaylist: "SP_PL",
      spotifyAlbum: "SP_AL",
      youtubeVideo: "YT_VID",
      youtubePlaylist: "YT_PL",
      songzaPlaylist: "SO_PL",
      soundcloudSong: "SC_SNG",
      soundcloudPlaylist: "SC_PL"
    };
    return mediaItemTypes;
  });
