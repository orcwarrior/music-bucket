/**
 * Created by orcwarrior on 2015-01-15.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('playlistCookieFactory', function (playlistSequencers, playlistEntryCookieFactory) {

               var fromCookieModel = function (_playlist, cookie) {
                 _playlist.id = cookie.id;
                 _playlist.author = cookie.author;
                 _playlist.authorName = cookie.authorName;
                 _playlist.name = cookie.name;
                 _playlist.songsCount = cookie.songsCount;
                 _playlist.sampleSongs = cookie.sampleSongs;
                 _playlist.playlistSequencer = playlistSequencers[cookie.playlistSequencer.name];
                 _playlist.isAltered = cookie.isAltered;
                 _playlist.entries = _.map(cookie.entries,
                                          function (entry) { return playlistEntryCookieFactory.convertFrom(entry);});
               }
               var toCookieModel = function (_playlist) {
                 return {
                   id              : _playlist.id,
                   author          : _playlist.author,
                   authorName      : _playlist.authorName,
                   name            : _playlist.name,
                   songsCount      : _playlist.songsCount,
                   sampleSongs     : _playlist.sampleSongs,
                   playlistSequencer : { name : _playlist.playlistSequencer.name },
                   isAltered       : _playlist.isAltered,
                   entries         : _.map(_playlist.entries, function(entry) {return playlistEntryCookieFactory.convertTo(entry); } )
                 };
               }

               return {
                 convertFrom: function (cookieModel) {
                   var _playlist = {};// new playlistFuncs();
                   fromCookieModel(_playlist, cookieModel);
                   return _playlist;
                 },
                 convertTo  : function (playlist) {
                    return toCookieModel(playlist);
                 }
               };
             });
}
)();
