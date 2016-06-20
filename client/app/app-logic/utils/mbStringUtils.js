/**
 * Created by orcwa on 17.11.2015.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('mbStringUtils', function () {
      var stringUtils = function stringUtils() {
        this.normalizeAlbumNameString = function (inString) {
          var cleanPattern = /(\[|\()((gold|deluxe|limited|diamond|collectors|special|bonus|explicit|clean|club|official).+(version|edition|tracks|mix|mixtape)|ep|explicit|deluxe|e\.p\.|(\d{4})|feat\.*(\w|\s)*?)(\]|\))|ep|the|single\s*$|feat\.*(\w|\s)*$/ig;

          var outString = inString;
          outString = s(outString)
            .clean()
            .cleanDiacritics()
            .toLowerCase()
            .value();
          outString = outString.replace(cleanPattern, "");
          outString = s(outString)
            .replace("'", "")
            .replace(".", "")
            .replace("the", "")
            .replace("&", "and")
            .replace("pt.", "part")
            .replace("-", "")
            .clean()
            .value();
          // cut out "single" if its at ends
          if (s.endsWith(outString, "single"))
            outString = outString.substring(0, outString.length - 6);
          return outString;
        };
        this.normalizeString = function (inString) {
          var outString = inString;
          outString = s(outString)
            .cleanDiacritics()
            .toLowerCase()
            .replace("'", "")
            .replace(".", "")
            .clean()
            .value();
          return outString;
        };
        this.extractRemixer = function (inString) {
          var remixPattern = /(?:\(|\[)([^\(\[]+)(?:remix|re-work|version|extended mix|\smix)(?:\)|\])?/ig;
          var match = remixPattern.exec(inString);
          if (_.isNull(match) || match[0].toLowerCase().indexOf("orginal") > 0) return {
            artist: "",
            title: inString
          };
          return {
            artist: (match[1] || '').trim(),
            title: inString.replace(match[0], "").trim()
          };
        };
        this.clearFeaturingStr = function (inString) {
          var featPattern = /(\[|\(|\s)((feat|ft)\.{0,1}(\w|\s)*?)(\]|\)|-|$)/ig;
          var match = featPattern.exec(inString);
          if (!_.isNull(match) && match[0])
            return inString.replace(match[0], "").trim();
          else return inString;
        }
        this.extractRemixerLoose = function (inString) {
          var remixPattern = /(\w+) r?e?mix/ig;
          var match = remixPattern.exec(inString);
          if (_.isNull(match) || match[0].toLowerCase().indexOf("orginal") > 0) return null;
          return match[0].trim();
        };
        this.getSongTypeByString = function (inString) {

          var featPattern = /(\[|\(|\s)(cover|tour|remix|live|vs|edit|rework|original)/ig;
          var match = featPattern.exec(inString);
          if (!_.isNull(match) && match[2]) return match[2];
          else return undefined;
        };
        this.getArtistAndTitleFromFullname = function (fullname) {
          var artist = fullname.split(" - ")[0] || fullname.split(" ")[0] || "";
          var title = fullname.split(" - ")[1] || fullname.split(" ")[1] || fullname;
          if (artist === fullname) {
            artist = undefined;
            title = fullname;
          }
          return (artist) ? {artist: artist, title: title} : {title: title};
        }
      };
      return new stringUtils();
    });
})
();
