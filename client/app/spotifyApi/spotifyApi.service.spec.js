'use strict';

describe('Service: songzaApi', function () {

  // load the service's module
  beforeEach(module('musicBucketApp'));

  // instantiate service
  var songzaApi;
  beforeEach(inject(function (_songzaApi_) {
    songzaApi = _songzaApi_;
  }));

  it('should do something', function () {
    expect(!!songzaApi).toBe(true);
  });

});
