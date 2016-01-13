/**
 * Created by orcwarrior on 2015-01-15.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('playlistCookieFactory', function ($injector, playlistSequencers, playlistEntryCookieFactory, modelConverter) {

      var fromCookieModel = function (_playlist, cookie) {
        _playlist.id = cookie.id;
        _playlist.author = cookie.author;
        _playlist.authorName = cookie.authorName;
        _playlist.name = cookie.name;
        _playlist.description = cookie.description;
        _playlist.songsCount = cookie.songsCount;
        _playlist.sampleSongs = cookie.sampleSongs;
        _playlist.visibility = cookie.visibility || "public";
        _playlist.tags = cookie.tags || [];
        _playlist.imageUrl = cookie.imageUrl;
        _playlist.modified = cookie.modified;
        _playlist.description = cookie.description;
        _playlist.playlistSequencer = playlistSequencers[cookie.playlistSequencer.name];
        _playlist.isAltered = cookie.isAltered;
        _playlist.entries = _.map(cookie.entries,
          function (entry) { return playlistEntryCookieFactory.convertFrom(entry);});

        _playlist.entries = _.without(_playlist.entries, undefined);
      }
      var toCookieModel = function (_playlist) {
        return {
          id:               _playlist.id,
          author:           _playlist.author,
          authorName:       _playlist.authorName,
          name:             _playlist.name,
          songsCount:       _playlist.songsCount,
          sampleSongs:      _playlist.sampleSongs,
          visibility      : _playlist.visibility,
          tags            : _playlist.tags,
          imageUrl        : _playlist.imageUrl,
          modified        : _playlist.modified,
          description     : _playlist.description,
          playlistSequencer: {name: _playlist.playlistSequencer.name},
          isAltered: _playlist.isAltered,
          entries: _.map(_playlist.entries, function (entry) {return playlistEntryCookieFactory.convertTo(entry); })
        };
      }

      return {
        convertFrom: function (cookieModel) {
          return modelConverter.convertFromModel(cookieModel, 'cookies');
        },
        convertTo: function (playlist) {
          return modelConverter.convertToModel(playlist, 'cookies');
          //return toCookieModel(playlist);
        }
      };
    });
})();
