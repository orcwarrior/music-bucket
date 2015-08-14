'use strict';

describe('Service: songBuilder', function () {

  // load the service's module
  beforeEach(module('musicBucketApp'));

  // instantiate service
  var songBuilder;
  beforeEach(inject(function (_songBuilder_) {
    songBuilder = _songBuilder_;
  }));

  it('should do something', function () {
    expect(!!songBuilder).toBe(true);
  });

});
