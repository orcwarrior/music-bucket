'use strict';

describe('Controller: SongzaCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SongzaCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SongzaCtrl = $controller('SongzaCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
