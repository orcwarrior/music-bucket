/**
 * Created by orcwarrior on 2015-03-02.
 */
/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songCatalogueInfos', function ($q, musicbrainzApi) {
      function findoutArtistName(combinedName) {

      };
      function updateMetainfos(catalogueInfos, metainfos) {
        if (!musicbrainzApi.helper.concatArtists(catalogueInfos['artist-credit']).indexOf('feat.'))
          metainfos.artist = musicbrainzApi.helper.concatArtists(catalogueInfos['artist-credit']);
        metainfos.title = catalogueInfos.title;
        metainfos.album = catalogueInfos.releases[0].title;

        if (_.isUndefined(metainfos.albumArt) || metainfos.albumArt.indexOf("blob:") === 0)
        // No album art or temporary (file blob)
          musicbrainzApi.coverArt.get(catalogueInfos.releases[0].id)
            .then(function (coverArtResponse) {
              if (coverArtResponse.status == 404) console.warn(metainfos.getSongDescription() + " album art not found in archive!")
              if (_.isUndefined(coverArtResponse.data.images)) return;
              var images = coverArtResponse.data.images;

              for (var i = 0; i < images.length; i++)
                if (images[i].front) metainfos.albumArt = images[i].image;
            });
      };
      function approveSearchResult(result) {
        // TODO: Check if there is remixer name somewhere etc.
        return !_.isUndefined(result);
      }

      function pickupDesiredRecording(recordings) {
        var recordingTypePriorities = {"NONE": -1, "COMPILATION": 0, "REMIX": 1, "SINGLE": 2, "EP": 3, "ALBUM": 4};

        var pickedRecording = {obj: null, type: "NONE"};
      }

      function prepareMBSearch(metainfos) {
        var mbSearch;
        var featBlock = /\((\s*feat.*?)\)/gi.exec(metainfos.title);
        var title = (featBlock) ? metainfos.title.replace(featBlock[0], "") : metainfos.title;
        var artist = (featBlock) ? metainfos.artist + " " + featBlock[1].replace(/feat\.*/gi, "") : metainfos.artist;
        title = title.replace(/  /g, " ");
        artist = artist.replace(/  /g, " ");

        if (metainfos.artist && metainfos.title) {
          mbSearch = musicbrainzApi.search.recording({
            // query: metainfos.artist + " " + metainfos.title,
            artist: artist,
            recording: title
            // dur: metainfos.getDuration()
          });
        } else if (metainfos.title) {
          mbSearch = musicbrainzApi.search.recording({
            query: metainfos.title
            // dur: metainfos.getDuration()
          });
        }
        return mbSearch;
      }

      return function (metainfos) {
        var deferred = $q.defer();
        if (metainfos.artist === "" || metainfos.title === "") deferred.resolve("No sufficent metainfos provided for catalogue lookup! Provide artist and title!");
        else {
          prepareMBSearch(metainfos)
            .then(function (response) {
              // Beginning with very primitive version of selecting proper recording, hopin' musicbrainz know what they do :)
              var catalogueInfos = response.data.recordings[0];
              if (!approveSearchResult(catalogueInfos)) {
                deferred.resolve(null);
                return;
              }

              catalogueInfos._apiUrl = response.config.url;
              updateMetainfos(catalogueInfos, metainfos);
              deferred.resolve(catalogueInfos);
            });
        }
        return deferred.promise;
      };

    }
  )
  ;
})();
