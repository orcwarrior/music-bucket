/**
 * Created by orcwa on 29.05.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaItemBuilder', function (mediaItem, mediaItemTypes,
                                         mediaItemSpotifyPlaylistAdapter, mediaItemSpotifyAlbumAdapter,
                                         mediaItemYoutubeVideoAdapter, mediaItemYoutubePlaylistAdapter,
                                         mediaItemSongzaPlaylistAdapter,
                                         mediaItemSoundcloudSongAdapter, mediaItemSoundcloudPlaylistAdapter) {
    function mediaItemBuilder(data) {
      if (_isSpotifyPlaylist(data))
        return _.bind(mediaItemSpotifyPlaylistAdapter, {}, data)();
      else if (_isSpotifyAlbum(data))
        return _.bind(mediaItemSpotifyAlbumAdapter, {}, data)();
      else if (_isYoutubeVideo(data))
        return _.bind(mediaItemYoutubeVideoAdapter, {}, data)();
      else if (_isYoutubePlaylist(data))
        return _.bind(mediaItemYoutubePlaylistAdapter, {}, data)();
      else if (_isSongzaPlaylist(data))
        return _.bind(mediaItemSongzaPlaylistAdapter, {}, data)();
      else if (_isSoundcloudSong(data))
        return _.bind(mediaItemSoundcloudSongAdapter, {}, data)();
      else if (_isSoundcloudPlaylist(data))
        return _.bind(mediaItemSoundcloudPlaylistAdapter, {}, data)();
      else
        return console.warn("Providen data is not know mediaItem source data!");
    }

    function _isSpotifyPlaylist(data) {
      return (data.uri && data.uri.indexOf("spotify:") === 0 && data.type === "playlist")
          /*builder*/ || (data._isBuilderObj && data.type === mediaItemTypes.spotifyPlaylist);
    }

    function _isSpotifyAlbum(data) {
      return (data.uri && data.uri.indexOf("spotify:") === 0 && data.type === "album")
          /*builder*/ || (data._isBuilderObj && data.type === mediaItemTypes.spotifyAlbum);
    }

    function _isYoutubeVideo(data) {
      return ((data.id && data.id.kind === "youtube#video")
      || (data._isBuilderObj && data.type === mediaItemTypes.youtubeVideo));
    }

    function _isYoutubePlaylist(data) {
      return ((data.id && data.id.kind === "youtube#playlist")
      || (data._isBuilderObj && data.type === mediaItemTypes.youtubePlaylist));
    }

    function _isSongzaPlaylist(data) {
      return (data._id && !_.isUndefined(data.creator) && !_.isUndefined(data.__v)
      || (data._isBuilderObj && data.type === mediaItemTypes.songzaPlaylist));
    }
    function _isSoundcloudSong(data) {
      return (data.uri && data.uri.indexOf("api.soundcloud.com/tracks") >= 0
      || (data._isBuilderObj && data.type === mediaItemTypes.soundcloudSong));
    }
    function _isSoundcloudPlaylist(data) {
      return (data.uri && data.uri.indexOf("api.soundcloud.com/playlists") >= 0
        || (data._isBuilderObj && data.type === mediaItemTypes.soundcloudPlaylist));
    }


    return mediaItemBuilder;
  });
