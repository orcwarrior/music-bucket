/**
 * Created by orcwarrior on 2014-11-08.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('song', function (songCommons) {
               return {
                 constructor : function(base, baseType, shared) {
                   this.base = base;
                   this.baseType = baseType;
                   this.shared =  _.extend(shared, songCommons.sharedProto);

                   this.toDBModel = function() {
                     var songDB = { shared : {
                                //id3 : {
                                //  artist : this.shared.id3.artist,
                                //  title  : this.shared.id3.title,
                                //  album  : this.shared.id3.album,
                                //  genere : this.shared.id3.genere
                                //},
                                artist : this.shared.artist,
                                title  : this.shared.title,
                                album  : this.shared.album,
                                genere : this.shared.genere
                              },
                              baseType : this.baseType,
                              base : this.base
                     };

                     // Copy album art only if it's an URL.
                     if(!this.shared.albumArtAttached ) {
                       songDB.shared.albumArt = this.shared.albumArt;
                     }
                     return songDB;
                   }
                 }
               };
             });
})();
