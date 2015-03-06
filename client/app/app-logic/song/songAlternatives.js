/**
 * Created by orcwarrior on 2015-02-25.
 */
angular.module('musicBucketEngine')
.factory('songAlternatives', function (songCommons, $injector) {

  function songAlternative(url) {};

  return function (catalogueInfos, passedAlternatives) {
    // HACKY: Get song dependency without circurral dependency error
    var song = $injector.get('song');
    this.alternatives = passedAlternatives || [];
    this.getAlternative = function() {};

  };
});

