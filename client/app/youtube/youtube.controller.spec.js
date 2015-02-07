'use strict';

describe('Controller: YoutubeCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var YoutubeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    YoutubeCtrl = $controller('YoutubeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
