'use strict';

describe('Controller: SongzaConciergeCtrl', function () {

  // load the controller's module
  beforeEach(module('musicBucketApp'));

  var SongzaConciergeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SongzaConciergeCtrl = $controller('SongzaConciergeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
