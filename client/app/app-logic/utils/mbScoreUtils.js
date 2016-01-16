/**
 * Created by orcwa on 12.01.2016.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('mbScoreUtils', function (mbStringUtils) {
      return {
        scoreTitle: function (nTitle, metainfos) {
          nTitle = mbStringUtils.normalizeString(nTitle);
          nTitle = nTitle.replace("-", "");
          nTitle = s(nTitle).clean().cleanDiacritics().value();
          var metaArtist = mbStringUtils.normalizeString(metainfos.artist);
          var metaTitle = mbStringUtils.normalizeString(metainfos.title);
          var score = 0;
          var scoreTitle = 0, scoreArtist = 0, scoreLevenstein, scoreRemixMul = 1;
          if (metaArtist && nTitle.indexOf(metaArtist) > -1) scoreArtist = 30;
          if (metaTitle && nTitle.indexOf(metaTitle) > -1) scoreTitle = 70;
          scoreLevenstein = -(s.levenshtein(metaArtist + ' ' + metaTitle,
              nTitle
            )) / Math.min(1, nTitle.length / 2);

          // check for remix
          var metaRemixer = mbStringUtils.extractRemixer(metaTitle);
          var ytRemixer = mbStringUtils.extractRemixer(nTitle);
          if (metaRemixer.artist === ytRemixer.artist)
            scoreRemixMul = 2;
          else if (nTitle.indexOf(metaRemixer.artist.toLowerCase()) > -1)
            scoreRemixMul = 1.75;

          score = (scoreArtist + scoreTitle + scoreLevenstein) * scoreRemixMul;
          console.log("Score of \"" + nTitle + "\": " + scoreArtist + "+" + scoreTitle + "+" + scoreLevenstein + "*" + scoreRemixMul + "=" + score);
          return score;
        },
        scoreDescription: function (nDescription, metainfos) {
          nDescription = mbStringUtils.normalizeString(nDescription);
          var score = 0;
          if (nDescription.indexOf(metainfos.artist.toLowerCase()) > -1) score += 5;
          if (nDescription.indexOf(metainfos.title.toLowerCase()) > -1) score += 5;
          if (metainfos.album && nDescription.indexOf(metainfos.album.toLowerCase()) > -1) score += 10;
          return score;
        }
      }
    });
})();
