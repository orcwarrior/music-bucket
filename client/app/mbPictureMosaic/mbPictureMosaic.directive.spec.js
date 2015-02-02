'use strict';

describe('Directive: mbPictureMosaic', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mbPictureMosaic/mbPictureMosaic.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mb-picture-mosaic></mb-picture-mosaic>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mbPictureMosaic directive');
  }));
});