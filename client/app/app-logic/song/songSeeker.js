/**
 * Created by orcwarrior on 2015-04-12.
 */

angular.module('musicBucketEngine')
  .factory('songSeeker', function ($injector, $q, song, songCommons, youtubeApi, soundcloudApi, songSeekerYoutube, songSeekerSoundcloud) {
    function buildSearchQuery(metainfos) {
      if (!_.isUndefined(metainfos.artist)) {
        return metainfos.artist + " " + metainfos.title;
      } else {
        return metainfos.title;
      }
    }

    function filterMetainfos(metainfos) {
      return _.pick(metainfos, 'album', 'artist', 'title', 'albumArt', 'genere');
    }

    function processFoundedSong(song, prepMetainfos) {
      song.metainfos = _.extend(song.metainfos,
        filterMetainfos(prepMetainfos));
      if (prepMetainfos.artist && prepMetainfos.title)
        song.metainfos.__overwritenByPreparedMetainfos = true;
      return song;
    }

    function _pickBestSong(foundedSongs, prepMetainfos) {
      var bestResult = _.chain(foundedSongs).sortBy('val').reverse().first().value();
      var createdSong = new song(bestResult.entry,  bestResult.type);
      return processFoundedSong(createdSong, prepMetainfos);
    }

    var SEEKING_SERVICES = 2;
    return function songSeeker(metainfos, pickFirst) {
      var resolvedServices = 0;
      var searchQuery = buildSearchQuery(metainfos);
      var foundedSongs = [];
      var song = $injector.get('song');
      var deferred = $q.defer();

      new songSeekerYoutube(metainfos, searchQuery)
        .then(function (songResult) {
          foundedSongs.push(songResult);
          if (++resolvedServices >= SEEKING_SERVICES)
            deferred.resolve(_pickBestSong(foundedSongs, metainfos));
        });

      new songSeekerSoundcloud(metainfos, searchQuery)
        .then(function (songResult) {
          foundedSongs.push(songResult);
          if (++resolvedServices >= SEEKING_SERVICES)
            deferred.resolve(_pickBestSong(foundedSongs, metainfos));
        });

      return deferred.promise;
    };
  });
