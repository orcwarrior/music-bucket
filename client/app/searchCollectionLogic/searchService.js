/**
 * Created by orcwa on 03.07.2016.
 */

angular.module('musicBucketEngine')
  .service('searchService', function ($q, $injector, searchDefinitionTypes, pageObject) {
    /* private */
    var mediaItemBuilder;

    function _validateSearchService(searchService) {
      if (!searchService.id || searchService.id.length !== 4)
        return console.error("Search service has not valid id!");
      if (!_.isFunction(searchService.searchMethod))
        return console.error("Search service has no valid search method");
      if (!searchService.searchTypeMatching)
        return console.error("Search service has no valid search type match");
      return true;
    }

    function __extractFromPath(obj, path) {
      var extracted = obj;
      if (path)
        _.each(path.split('.'), function (fieldname) {
          if (extracted[fieldname])
            extracted = extracted[fieldname];
          else console.warn("Path extracting stopped at: " + fieldname + ", path: " + path);
        });
      return extracted;
    }

    /* public */
    var searchServiceFunc = function searchService(id, searchMethod, serviceConfig) {
      var srchService = {id: id};

      srchService = _.extend(srchService, _.pick(serviceConfig,
        'searchTypeMatching', 'searchSrcKey', 'searchCollectionPath', 'searchMaxItemsPath',
        'searchPageToken', 'searchPageTokenPath',
        'searchName', 'searchSubName'));

      if (!searchDefinitionTypes[srchService.searchTypeMatching]) return console.error("searchTypeMatching is invaild!");

      srchService.searchMethod = function (searchData, pageObj) {
        var deffered = $q.defer();
        var mySearchTypeDef = searchDefinitionTypes[srchService.searchTypeMatching];
        if (!pageObj) pageObj = new pageObject();
        if (!searchData[srchService.searchSrcKey]) return console.warn("This search doesn't contain specific key: " + srchService.searchSrcKey);
        if (mySearchTypeDef.validate(searchData)) {

          var offset = (srchService.searchPageToken) ? srchService.searchPageToken : pageObj.getRawOffset();
          searchMethod(searchData[srchService.searchSrcKey], pageObj.getSizeOfFetch(), offset)
            .then(function (searchResponse) {
              if (srchService.searchMaxItemsPath)
                pageObj.setMaxItems(__extractFromPath(searchResponse, srchService.searchMaxItemsPath));
              if (srchService.searchPageTokenPath)
                srchService.searchPageToken = __extractFromPath(searchResponse, srchService.searchPageTokenPath);

              deffered.resolve(__extractFromPath(searchResponse, srchService.searchCollectionPath));
              // deffered.resolve(_buildMediaItemCollection(searchResponse));
            });
        }
        return deffered.promise;
      };

      if (_validateSearchService(srchService)) return srchService;
    };

    return searchServiceFunc;
  });
