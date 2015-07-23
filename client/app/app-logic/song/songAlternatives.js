/**
 * Created by orcwarrior on 2015-02-25.
 */
angular.module('musicBucketEngine')
  .factory('songAlternatives', function (songCommons, $injector, $log, $q) {


    return function (metainfos, passedAlternatives, catalogueInfos) {
      // HACKY: Get song dependency without circurral dependency error
      var song = $injector.get('song');
      var self = this;
      var songSeeker = $injector.get('songSeeker');

      this.alternativesPromise = $q.defer();
      this.alternatives = passedAlternatives || [];
      new songSeeker(metainfos)
        .then(function (foundedAlternatives) {
          self.alternatives = self.alternatives.concat(foundedAlternatives);
          $log.info("songAlternative: Founded " + foundedAlternatives.length + " alts.");
          self.alternativesPromise.resolve(self.alternatives);
        });

      this.currentAlternative = undefined;
      this.getAlternative = function () {
        if (!_.isUndefined(this.currentAlternative) && checkAlternative()) { this.currentAlternative = undefined; $log.info("songAlternative: Current alternative has error!"); }

        if (_.isUndefined(this.currentAlternative)) {
          pickAlternative();
          $log.info("songAlternative: Picked Alternative: ");
          $log.info(this.currentAlternative);
        }
        return this.currentAlternative;
      };
      function checkAlternative() {
        var check = self.currentAlternative.engine.isBuffered();
        return !check.error;
      }
      function pickAlternative() {
        self.currentAlternative = _.first(self.alternatives);
        self.alternatives = _.filter(self.alternatives, self.currentAlternative);
      }
    };
  });

