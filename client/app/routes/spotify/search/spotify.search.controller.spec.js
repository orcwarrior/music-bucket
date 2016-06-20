'use strict';

describe('Controller: SpotifySearchCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SpotifySearchCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SpotifySearchCtrl = $controller('SpotifySearchCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
