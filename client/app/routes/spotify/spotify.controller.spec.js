'use strict';

describe('Controller: SpotifyCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SpotifyCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SpotifyCtrl = $controller('SpotifyCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
