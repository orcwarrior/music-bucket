'use strict';

describe('Controller: SongzaActivitiesCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SongzaActivitiesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SongzaActivitiesCtrl = $controller('SongzaActivitiesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
