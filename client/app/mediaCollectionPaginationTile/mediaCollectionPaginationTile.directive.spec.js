'use strict';

describe('Directive: mediaCollectionPaginationTile', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mediaCollectionPaginationTile/mediaCollectionPaginationTile.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<media-collection-pagination-tile></media-collection-pagination-tile>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mediaCollectionPaginationTile directive');
  }));
});