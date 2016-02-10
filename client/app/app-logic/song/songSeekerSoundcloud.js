/**
 * Created by orcwa on 29.11.2015.
 */

angular.module('musicBucketEngine')
  .factory('songSeekerSoundcloud', function ($q, soundcloudApi, mbScoreUtils, mbStringUtils, songCommons) {


    function _pickSoundcloudEntry(entries, metainfos) {
      var scoreMap = [];
      var highestScore = {val: 0, entry: undefined};
      var nMetaTitle = mbStringUtils.normalizeString(metainfos.title);
      _.each(entries, function (entry) {
        var nDescription = entry.description || "";
        var nTitle = entry.title || "";
        var entryScore = {
          val: (mbScoreUtils.scoreTitle(nTitle, metainfos, 3)
          + mbScoreUtils.scoreDescription(nDescription, metainfos) / 2),
          key: entry.id,
          'entry': entry,
          type: songCommons.songType.soundcloud
        };
        entryScore.val *= 1.2;
        entryScore.val += 10;
        // remix fix:
        if (nMetaTitle.indexOf("remix") == -1 && entry.track_type === "remix")
          entryScore.val *= 0.5;
        scoreMap.push(entryScore);
      });

      highestScore = _.chain(scoreMap).sortBy('val').reverse().first().value();
      // TODO: Grab some first entries based on val distribution, get them informations about duration
      // and compare it with metainfos duration, update score
      // additionaly try to
      return highestScore;
    }

    return function songSeekerSoundcloud(metainfos, searchQuery) {
      var deferred = $q.defer();

      soundcloudApi.search.track(searchQuery, 5)
        .then(function (response) {
          // TODO: No search results?
          var pickedEntry = _pickSoundcloudEntry(response.data, metainfos);
          if (pickedEntry) {
            deferred.resolve(pickedEntry);
          }
        });
      return deferred.promise;

    };
  });
