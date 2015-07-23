/**
 * Created by orcwarrior on 2015-04-12.
 */

angular.module('musicBucketEngine')
  .factory('songSeeker', function ($injector, $q, songCommons, youtubeApi, soundcloudApi) {
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

    var SEEKING_SERVICES = 2;
    return function songSeeker(metainfos) {
      var resolvedServices = 0;
      var searchQuery = buildSearchQuery(metainfos);
      var foundedSongs = [];
      var song = $injector.get('song');
      var deferred = $q.defer();

      youtubeApi.search(searchQuery)
        .then(function (response) {
          var firstEntry = _.first(response.data.items);
          if (firstEntry) {
            var ytSong = new song(firstEntry, songCommons.songType.youtube);
            ytSong.metainfos = _.extend(ytSong.metainfos,
              filterMetainfos(metainfos));
            foundedSongs.push(ytSong);
          }
          if (++resolvedServices >= SEEKING_SERVICES)
            deferred.resolve(foundedSongs);
        });
      soundcloudApi.search.track(searchQuery, 5)
        .then(function (response) {
          if (response.data.length > 0) {
            var scSong = new song(response.data[0], songCommons.songType.soundcloud);
            scSong.metainfos = _.extend(scSong.metainfos,
              filterMetainfos(metainfos));
            foundedSongs.push(scSong);
          }
          if (++resolvedServices >= SEEKING_SERVICES)
            deferred.resolve(foundedSongs);
        });

      return deferred.promise;
    };
  }
);
