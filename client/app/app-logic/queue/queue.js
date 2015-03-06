/**
 * Created by orcwarrior on 2014-11-30.
 */
/**
 * Created by orcwarrior on 2014-11-11.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('queue', function (queueEntry) {
               return {
                 constructor: function () {

                   this.entries = [];
                   this.hasNext = function () {
                     return this.entries.length > 0;
                   }
                   this.peekNextSong = function() {
                     if (!this.hasNext()) return null;
                      return _.first(this.entries).song;
                   }
                   this.dequeue = this.getNext = function () {
                     if (this.hasNext()) {
                        var next = _.first(this.entries);
                       this.entries = _.rest(this.entries);
                       return next;
                     }
                     return null;
                   }
                   this.enqueue = function (playlistEntry) {
                     // create queueEntry, add to entries array
                     this.entries.push(new queueEntry(playlistEntry));
                   }
                   this.enqueueNext = function (playlistEntry) {
                     var head = new queueEntry(playlistEntry);
                     if (this.hasNext() && this.entries[0].buffered)
                        head.buffer();
                      this.entries.unshift(head);
                   }
                   this.bufferNext = function () {
                     if (this.hasNext()) {
                       var next = _.first(this.entries);
                       if (next.song.buffer()) console.log("Next song in queue buffered!", next.song.shared);
                     }
                   }
                   this.getLenght = function () { return this.entries.length;}


                   return this;
                 }
               };
             });
}
)();
