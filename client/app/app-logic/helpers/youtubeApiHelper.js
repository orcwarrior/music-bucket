/**
 * Created by orcwarrior on 2015-01-03.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('youtubeApiHelper', function ($http) {
               var baseApiUrl = 'https://www.googleapis.com/youtube/v3/';
               var apiKey = 'AIzaSyB4n5CxGsCe3VDLKCFQ8LRYWxGPkb_stuo';


               function extractSongInfos(songName) {
                 // When pick'd up from any online streams tags should be ok,
                 // in positive case of local file with proper naming it will be fine too.
                 var artistAndTitle = songName.split('-');

                 var _fragments = artistAndTitle[0].split(" ");
                 if (artistAndTitle.length > 1)
                   _fragments.concat(artistAndTitle[1].split(" "));

                 return {
                   artist   : artistAndTitle[0],
                   title    : artistAndTitle[1],
                   fragments: _fragments
                 };
               }

               function getSongSharedFragments(songShared) {
                    return _.extend({
                      fragments: songShared.title.split(" ").concat(songShared.artist.split(" "))
                    }, songShared);
               }
               function rateSimilarity(ytItem, songInfos) {
                 var rate = { id: ytItem.id.videoId, value: 0};
                 var ytTitle = ytItem.snippet.title.toUpperCase();
                 var ytDesc = ytItem.snippet.description.toUpperCase();

                 if ( ytTitle.indexOf(songInfos.artist.toUpperCase()) !== -1 )
                   rate.value += 0.4;

                 if ( ytTitle.indexOf(songInfos.title.toUpperCase()) !== -1 )
                   rate.value += 0.4;

                 var fragment;
                 for (fragIdx in songInfos.fragments) {
                   if ( ytTitle.indexOf(songInfos.fragments[fragIdx].toUpperCase()) !== -1 )
                     rate.value += 0.05;

                   if ( ytDesc.indexOf(songInfos.fragments[fragIdx].toUpperCase()) !== -1 )
                     rate.value += 0.01;
                 }

                 return rate;
               }
               function pickClosestFromList(searchResults, songShared) {
                 if (_.isUndefined(searchResults.data.items))
                   return null; // request error, tmp no handling TODO!

                 var songInfos;
                 if (songShared.artist == '') // haven't actually artist id3 tag - probably filename in title.
                   songInfos = extractSongInfos(songShared.title);
                 else
                   songInfos = getSongSharedFragments(songShared);
                 var ratings = [];
                 for (var idx =0;idx < searchResults.data.items.length; idx++)
                   ratings.push(rateSimilarity(searchResults.data.items[idx], songInfos));

                 // Sort from highest rating to lowest
                 // LOOKS LIKE TEMPORARY MY RATINGS SUCKS XD
                 //ratings = _.sortBy(ratings, function(rate){ return -rate.value; });
                 // return ratings[0];

                 return searchResults.data.items[0];
               }

               var youtubeApiSearch = {
                 prefix: baseApiUrl + 'search?' + 'videoEmbeddable=true&type=video&videoDefinition=high&order=relevance&part=snippet' + '&key=' + apiKey,
                 go    : function (query) {
                   var url = this.prefix + '&q=' + escape(query);
                   console.log('ytApi: Search url: ' + url);
                   return $http.get(url);
                 }
               };
                 var youtubeApiGetById = function(id) {

                 }
               return {
                 search                : youtubeApiSearch,
                 searchExtractBestMatch: pickClosestFromList,
                 getById               : youtubeApiGetById
               };
             })
}
)();
