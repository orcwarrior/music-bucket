/**
 * Created by orcwarrior on 2015-07-23.
 */

angular.module('musicBucketApp')
  .filter('momentDate', function() {
    return function(date, format) {
      return moment(date);
    };
  })
.filter('momentFrom', function() {
    return function (date) {
      return moment().from(date);
    }
  })
