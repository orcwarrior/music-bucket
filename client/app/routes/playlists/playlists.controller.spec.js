'use strict';

describe('Controller: PlaylistsCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var PlaylistsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PlaylistsCtrl = $controller('PlaylistsCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
