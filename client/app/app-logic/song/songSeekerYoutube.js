/**
 * Created by orcwa on 29.11.2015.
 */

angular.module('musicBucketEngine')
  .factory('songSeekerYoutube', function ($q, $log, youtubeApi, mbScoreUtils, mbStringUtils, moment, songCommons) {


    function _scoreYoutubeAddYearInfo(snippet) {
      var year = moment(snippet.publishedAt).year();
      var multipiler;
      if (year > 2013)
        return 1.4;
      else if (year > 2010)
        return 1.25;
      else if (year > 2008)
        return 1.0;
      else
        return 0.8;
    }

    function _scoreYoutubeDuration(orginalDuration, entryDuration) {
      const IGNORE_DIFF_MS = 1500;
      var score = Math.abs(orginalDuration - entryDuration);
      if (score <= IGNORE_DIFF_MS) return 1.5;
      score = Math.min(score, 600 * 1000);
      score = score / 1000; // to sec's diff
      score = (score * 2);
      console.log("Duration score:(" + orginalDuration + "," + entryDuration + ") = " + (100 - score));
      return 100 - score;
    }

    function _pickYoutubeEntry(entries, metainfos, videoDurations) {
      var scoreMap = [];
      var highestScore = {val: 0, entry: undefined};
      var metainfosHasFeaturing = (mbStringUtils.clearFeaturingStr(metainfos.title) !== metainfos.title);
      _.each(entries, function (entry, idx) {
        var nDescription = entry.snippet.description;
        var nTitle = mbStringUtils.normalizeString(entry.snippet.title);
        if (!metainfosHasFeaturing) nTitle = mbStringUtils.clearFeaturingStr(nTitle);

        var entryScore = {
          val: (mbScoreUtils.scoreTitle(nTitle, metainfos)
          + mbScoreUtils.scoreDescription(nDescription, metainfos) / 2),
          key: entry.id.videoId,
          'entry': entry,
          nTitle: nTitle,
          type: songCommons.songType.youtube
        };
        entryScore.val *= 1 - (idx * 5 / entries.length);
        scoreMap.push(entryScore);
        // Duration penality
      });

      // scoreMap = _.chain(scoreMap).sortBy('val').reverse().take(10).value();

      scoreMap = _.chain(scoreMap).each(function (score) {
        score.val *= _scoreYoutubeAddYearInfo(score.entry.snippet);
        if (videoDurations) {
          var durScore = _scoreYoutubeDuration(metainfos.duration, videoDurations[score.key].duration);
          score.val += durScore;
          score._durScore = durScore;
        }
      }).sortBy('val').value();
      highestScore = _.last(scoreMap);
      // TODO: Grab some first entries based on val distribution, get them informations about duration
      // and compare it with metainfos duration, update score
      // additionaly try to
      $log.warn("Youtube scores: ");
      $log.warn(scoreMap);
      return highestScore;
    }

    return function songSeekerYoutube(metainfos, searchQuery) {
      var deferred = $q.defer();
      var searchPromises = [];
      var searchArtistAndTitle = youtubeApi.search(searchQuery, 25, {part: 'snippet'});
      var searchArtistAndTitleWithAlbum = youtubeApi.search(metainfos.artist + " - " + metainfos.album + " - " + metainfos.title, 20, {part: 'snippet'});

      searchPromises.push(searchArtistAndTitle);
      if (metainfos.album && metainfos.album !== "")
        searchPromises.push(searchArtistAndTitleWithAlbum);

      $q.all(searchPromises)
        .then(function (resolveValues) {
          var combinedItems = [];
          _.each(resolveValues, function (response) {
            combinedItems.push.apply(combinedItems, response.data.items);
          });
          combinedItems = _.uniq(combinedItems);

          var contentDetailsSearch;
          if (metainfos.duration) {
            var vidIdsOnly = _.map(combinedItems, function (item) {
              return item.id.videoId
            });
            contentDetailsSearch = youtubeApi.video.list('contentDetails', {id: vidIdsOnly}, 50);
          }
          $q.when(contentDetailsSearch, function (response) {
            var vidDetails;
            if (response) {
              vidDetails = {};
              _.each(response.data.items, function (vid) {
                vidDetails[vid.id] = {
                  duration: moment.duration(vid.contentDetails.duration).asMilliseconds(),
                  definition: vid.contentDetails.definition
                };
              });
            }
            var pickedEntry = _pickYoutubeEntry(combinedItems, metainfos, vidDetails);
            $log.info("YT Picked entry for " + metainfos.artist + " - " + metainfos.title);
            $log.info(pickedEntry);
            if (pickedEntry) {
              deferred.resolve(pickedEntry);
            }
          });
        });
      return deferred.promise;
    };
  });
