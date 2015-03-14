'use strict';

describe('Controller: SongzaSearchCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SongzaSearchCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SongzaSearchCtrl = $controller('SongzaSearchCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
