'use strict';

describe('Controller: SongzaStationCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SongzaStationCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SongzaStationCtrl = $controller('SongzaStationCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
