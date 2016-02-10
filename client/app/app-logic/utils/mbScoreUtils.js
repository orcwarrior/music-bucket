/**
 * Created by orcwa on 12.01.2016.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('mbScoreUtils', function (mbStringUtils) {
      return {
        scoreTitle: function (nTitle, metainfos, levensteinMul) {
          if (_.isUndefined(levensteinMul)) levensteinMul = 1;

          nTitle = mbStringUtils.normalizeString(nTitle);
          nTitle = nTitle.replace("-", "");
          nTitle = s(nTitle).clean().cleanDiacritics().value();
          var metaArtist = mbStringUtils.normalizeString(metainfos.artist);
          var metaTitle = mbStringUtils.normalizeString(metainfos.title);
          var score = 0;
          var scoreTitle = 0, scoreArtist = 0, scoreLevenstein, scoreRemixMul = 1,
            scoreCoverAndRemixMul = 1;
          var lengthDiff = Math.abs(nTitle.length - (metaArtist + ' ' + metaTitle).length);

          if (metaArtist && nTitle.indexOf(metaArtist) > -1) scoreArtist = 30;
          if (metaTitle && nTitle.indexOf(metaTitle) > -1) scoreTitle = 70;
          scoreLevenstein = -(s.levenshtein(metaArtist + ' ' + metaTitle,
              nTitle
            )) / (nTitle.length/4) * Math.sqrt(lengthDiff) * levensteinMul;

          // check for remix
          var metaRemixer = mbStringUtils.extractRemixer(metaTitle);
          var ytRemixer = mbStringUtils.extractRemixer(nTitle);
          if (metaRemixer.artist === ytRemixer.artist)
            scoreRemixMul = 2;
          else if (nTitle.indexOf(metaRemixer.artist.toLowerCase()) > -1)
            scoreRemixMul = 1.75;

          // cover and remix detect:
          // TODO: Next non-letter
          if (Boolean(nTitle.indexOf(" cover") == -1) !== Boolean(metaTitle.indexOf(" cover") == -1))
            scoreCoverAndRemixMul *= 0.5;
          if (Boolean(nTitle.indexOf(" remix") == -1) !== Boolean(metaTitle.indexOf(" remix") == -1))
            scoreCoverAndRemixMul *= 0.5;
          if (Boolean(nTitle.indexOf(" live") == -1) !== Boolean(metaTitle.indexOf(" live") == -1))
            scoreCoverAndRemixMul *= 0.5;
          if (Boolean(nTitle.indexOf("vs ") == -1) !== Boolean(metaTitle.indexOf("vs ") == -1))
            scoreCoverAndRemixMul *= 0.5;
          if (Boolean(nTitle.indexOf(" edit") == -1) !== Boolean(metaTitle.indexOf(" edit") == -1))
            scoreCoverAndRemixMul *= 0.5;
          if (Boolean(nTitle.indexOf(" rework") == -1) !== Boolean(metaTitle.indexOf(" rework") == -1))
            scoreCoverAndRemixMul *= 0.5;
          score = (scoreArtist + scoreTitle + scoreLevenstein) * scoreRemixMul * scoreCoverAndRemixMul;
          console.log("Score of \"" + nTitle + "\": " + scoreArtist + "+" + scoreTitle + "+" + scoreLevenstein + "*" + scoreRemixMul + "*" + scoreCoverAndRemixMul + "=" + score);
          return Math.max(score, 0);
        },
        scoreDescription: function (nDescription, metainfos) {
          nDescription = mbStringUtils.normalizeString(nDescription);
          var score = 0;
          if (nDescription.indexOf(metainfos.artist.toLowerCase()) > -1) score += 5;
          if (nDescription.indexOf(metainfos.title.toLowerCase()) > -1) score += 5;
          if (metainfos.album && nDescription.indexOf(metainfos.album.toLowerCase()) > -1) score += 10;
          return Math.max(score, 0);
        }
      }
    });
})();
