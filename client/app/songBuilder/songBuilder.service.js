'use strict';

angular.module('musicBucketApp')
  .service('songBuilder', function ($q, songSeeker) {

    return {
      createSong : function(fullname) {
        var deffered = $q.defer();
        var metainfos = {
          title: fullname
        };
        new songSeeker(metainfos)
          .then(function(song) {
            deffered.resolve(song[0]);
          });
        return deffered.promise;
      }
    };
  });
