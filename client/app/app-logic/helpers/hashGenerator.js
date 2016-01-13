/**
 * Created by orcwa on 15.11.2015.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('hashGenerator', function ($rootScope, $q, entryCommons) {
      function s4() {
        return Math.floor((1 + Math.random()
          ) * 0x10000)
          .toString(16)
          .substring(1);
      }

      return {
        generateGUID: function () {
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        },
        generateId: function () {
          return s4() + s4() + s4();
        }
      };

    });
}) ();
