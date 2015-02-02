/**
 * Created by orcwarrior on 2014-12-26.
 */


(function () {
  angular.module('musicBucketEngine')
    .factory('entryDBHelper', function (localEntry, songzaStation, entryCommons) {

               return {
                 createEntryFromDBModel: function(db)
                 {
                   switch (db.type) {
                     case (entryCommons.entryType.localEntry
                     ):
                       return new localEntry.constructorDB(db);
                     case (entryCommons.entryType.songzaStation
                     ):
                       return new songzaStation.constructorDB(db);
                   }
                 }
               };
             });
})();
