/**
 * Created by orcwa on 29.11.2015.
 */

angular.module('musicBucketEngine')
  .factory('songSeekerYoutube', function ($q, youtubeApi, mbScoreUtils, mbStringUtils, moment, song, songCommons) {


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

    function _pickYoutubeEntry(entries, metainfos) {
      var scoreMap = [];
      var highestScore = {val: 0, entry: undefined};
      _.each(entries, function (entry) {
        var nDescription = entry.snippet.description;
        var nTitle = entry.snippet.title;
        var entryScore = {
          val: (mbScoreUtils.scoreTitle(nTitle, metainfos)
          + mbScoreUtils.scoreDescription(nDescription, metainfos) / 2),
          key: entry.id.videoId,
          'entry': entry
        };
        scoreMap.push(entryScore);
      });

      scoreMap = _.chain(scoreMap).sortBy('val').reverse().take(10).value();
      highestScore = _.chain(scoreMap).each(function(score) {
        score.val *= _scoreYoutubeAddYearInfo(score.entry.snippet);
      }).sortBy('val').last().value();
      // TODO: Grab some first entries based on val distribution, get them informations about duration
      // and compare it with metainfos duration, update score
      // additionaly try to
      return highestScore.entry;
    }

    return function songSeekerYoutube(metainfos, searchQuery) {
      var deferred = $q.defer();

      youtubeApi.search(searchQuery, 15, {part: 'snippet'})
        .then(function (response) {
          var pickedEntry = _pickYoutubeEntry(response.data.items, metainfos);
          if (pickedEntry) {
            var ytSong = new song(pickedEntry, songCommons.songType.youtube);
            deferred.resolve(ytSong);
          }
        });
      return deferred.promise;

    };
  });
