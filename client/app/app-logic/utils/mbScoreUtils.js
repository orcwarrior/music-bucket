/**
 * Created by orcwa on 12.01.2016.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('mbScoreUtils', function ($log, mbStringUtils) {
      return {
        scoreTitle: function (nTitle, metainfos, levensteinMul) {
          if (_.isUndefined(levensteinMul)) levensteinMul = 2;

          nTitle = mbStringUtils.normalizeString(nTitle);
          var nTitleHyphenSplited = nTitle.split('-');
          nTitle = nTitle.replace("-", "");
          nTitle = s(nTitle).clean().cleanDiacritics().value();
          var metaArtist = mbStringUtils.normalizeString(metainfos.artist);
          var metaTitle = mbStringUtils.normalizeString(metainfos.title);
          var score = 0;
          var scoreTitle = 0, scoreArtist = 0, scoreLevenstein, scoreAltLevenstein, scoreRemixMul = 1,
            scoreCoverAndRemixMul = 1;
          var lengthDiff = Math.abs(nTitle.length - (metaArtist + ' ' + metaTitle).length);

          // Now score artist by levenstein
          if (metaArtist) {
            if (nTitleHyphenSplited[0] && nTitleHyphenSplited[1]) {
              var artistLevenstein = Math.min(s.levenshtein(nTitleHyphenSplited[0], metaArtist),
                s.levenshtein(nTitleHyphenSplited[1], metaArtist));
              scoreArtist = 30 - artistLevenstein * artistLevenstein;
            }
            else if (nTitle.indexOf(metaArtist) > -1) scoreArtist = 35;
          }
          if (metaTitle && nTitle.indexOf(metaTitle) > -1) scoreTitle = 70;
          scoreLevenstein = -(s.levenshtein(metaArtist + ' ' + metaTitle,
              nTitle
            )) / (nTitle.length / 4) * Math.sqrt(lengthDiff) * levensteinMul;
          scoreAltLevenstein = -(s.levenshtein(metaTitle + ' ' + metaArtist,
              nTitle
            )) / (nTitle.length / 3) * Math.sqrt(lengthDiff) * levensteinMul;
          scoreLevenstein = Math.max(scoreAltLevenstein, scoreLevenstein);

          // check for remix
          var metaRemixer = mbStringUtils.extractRemixer(metaTitle);
          var ytRemixer = mbStringUtils.extractRemixer(nTitle);
          if (metaRemixer.artist === ytRemixer.artist)
            scoreRemixMul = 2;
          else if (nTitle.indexOf(metaRemixer.artist.toLowerCase()) > -1)
            scoreRemixMul = 1.75;

          // cover and remix detect:
          if (mbStringUtils.getSongTypeByString(nTitle) !== mbStringUtils.getSongTypeByString(metaTitle))
            scoreCoverAndRemixMul *= 0.5;
          score = (scoreArtist + scoreTitle + scoreLevenstein) * scoreRemixMul * scoreCoverAndRemixMul;
          if (nTitle.indexOf(" hd"))
            score *= 1.2;
          if (nTitle.match(/(official|music) (song|video)/gi))
            score = score * 1.3 + 15;
          console.log("Score of \"" + nTitle + "\": " + scoreArtist + "+" + scoreTitle + "+" + scoreLevenstein + "*" + scoreRemixMul + "*" + scoreCoverAndRemixMul + "=" + score);
          return Math.max(score, 0);
        },
        scoreDescription: function (nDescription, metainfos) {
          nDescription = mbStringUtils.normalizeString(nDescription);
          var score = 0;
          if (nDescription.indexOf(metainfos.artist.toLowerCase()) > -1) score += 5;
          if (nDescription.indexOf(metainfos.title.toLowerCase()) > -1) score += 5;
          if (metainfos.album && nDescription.indexOf(metainfos.album.toLowerCase()) > -1) score += 10;

          // cover and remix detect:
          // TODO: Next non-letter
          var metaTitle = mbStringUtils.normalizeString(metainfos.title);
          if (mbStringUtils.getSongTypeByString(nDescription) !== mbStringUtils.getSongTypeByString(metaTitle))
            score -= 5;

          if (nDescription.match(/(official|music) (song|video)/gi))
            score *= 1.2;
          return score;
        }
      }
    });
})();
