/**
 * Created by orcwarrior on 2015-04-12.
 */

angular.module('musicBucketEngine')
  .factory('songSeeker', function ($injector, $q, songCommons, youtubeApi, soundcloudApi, songSeekerYoutube) {
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

    }

    var SEEKING_SERVICES = 2;
    return function songSeeker(metainfos, pickFirst) {
      var resolvedServices = 0;
      var searchQuery = buildSearchQuery(metainfos);
      var foundedSongs = [];
      var song = $injector.get('song');
      var deferred = $q.defer();

      new songSeekerYoutube(metainfos, searchQuery)
        .then(function (song) {
          foundedSongs.push(song);
          processFoundedSong(song, metainfos);
          if (pickFirst) deferred.resolve(song);
          if (++resolvedServices >= SEEKING_SERVICES)
            deferred.resolve(foundedSongs);
        });
      soundcloudApi.search.track(searchQuery, 5)
        .then(function (response) {
          if (response.data.length > 0) {
            var scSong = new song(response.data[0], songCommons.songType.soundcloud);
            // scSong.metainfos = _.extend(scSong.metainfos,
            //   filterMetainfos(metainfos));
            foundedSongs.push(scSong);

            if (pickFirst) deferred.resolve(scSong);
          }
          if (++resolvedServices >= SEEKING_SERVICES)
            deferred.resolve(foundedSongs);
        });

      return deferred.promise;
    };
  }
)
;
