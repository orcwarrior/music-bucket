/**
 * Created by orcwa on 29.05.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaItem', function (mediaCollection) {

    var sectionsNames = {
      metainfos: "METAINFOS",
      tracks: "TRACKS",
      similars: "SIMILARS"
    };
    var resolveProto = function () {
      console.warn("This resolve method should be overriden!");
    };

    var item = function mediaItem(id, name, cover, songsCount, url) {
      this.id = id;
      this.name = name;
      this.cover = cover;
      this.songsCount = songsCount;
      this.url = url;
      this._resolveMetainfos = resolveProto;
      this._resolveTracks = resolveProto;
      this._resolveSimilars = resolveProto;
      this._getBuilderObj = resolveProto;
      this.__resolvedSections = []; // "metainfos, playlist..."
      this.__sectionNames = sectionsNames;
      this.__isAnMediaItemObject = true;
    }
    return item;
  });
