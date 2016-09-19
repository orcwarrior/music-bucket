/**
 * Created by orcwa on 04.07.2016.
 */

angular.module('musicBucketEngine')
  .service('pageObject', function ($q, $log) {

    function pageObject(config) {
      var self = this;
      var MIN_PAGE = 1;
      var pOffset = (config && config.offset) || 0;
      var pSize = (config && config.pageSize) || 8;
      var pSizeAlters = 1;
      var lineSize = 1;
      var _storedMediaCollection = {};
      _.extend(this, {
        //offset: 0,
        //size: 8,
        allItems: 0,
        fetchSize: 50,
        fetchedData: [],
        _isLoading: false,
        data: undefined,
        getSizeOfFetch: function () {
          return this.fetchSize || this.pageSize;
        },
        getSmallerSize: function () {
          return _getSizeBasedOnAltersAndLineSize(pSizeAlters - 1);
        },
        getBiggerSize: function () {
          var biggerSize = _getSizeBasedOnAltersAndLineSize(pSizeAlters + 1);
          if (biggerSize >= this.fetchSize) {
            // so it will always be ideall number of items per line.
            biggerSize = Math.min(biggerSize, this.fetchSize);
            biggerSize = Math.min(biggerSize, this.allItems); // FIX: No more than all items
            biggerSize = biggerSize - (biggerSize % lineSize);
          }
          return biggerSize;
        },
        setOneLineSize: function (val) {
          lineSize = val;
          var newPSize = _getSizeBasedOnAltersAndLineSize(pSizeAlters);
          if (pSize !== newPSize) {
            pSize = newPSize;
            this.fetchData(_storedMediaCollection);
          }
        },
        getRawOffset: function () {
          return pOffset;
        },
        curPage: function () {
          return Math.ceil(this.offset / this.pageSize) + 1;
        },
        lastPage: function () {
          return Math.ceil(this.allItems / this.pageSize);
        },
        setMaxItems: function (max) {
          if (_.isNumber(max))
            this.allItems = max;
        }
      }, config);

      /* properties */
      Object.defineProperty(this, 'offset', {
        get: function () {
          return pOffset
        },
        set: function (value) {
          pOffset = value;
          this.fetchData(_storedMediaCollection);
        }
      });
      Object.defineProperty(this, 'page', {
        get: function () {
          return pPage;
        },
        set: function (value) {
          pPage = value;
          this.offset = (pPage - MIN_PAGE) * this.pageSize; // page starts by 1, not 0
        }
      });
      Object.defineProperty(this, 'pageSize', {
        get: function () {
          return pSize;
        },
        set: function (value) {
          var oldPSize = pSize;
          if (value > pSize) {
            pSize = this.getBiggerSize();
            pSizeAlters++;
          }
          else if (value < pSize) {
            pSize = this.getSmallerSize();
            pSizeAlters--;
          } else return;
          this.page = __correctPageBySize(this.page, oldPSize, pSize);

          this.fetchData(_storedMediaCollection);
        }
      });
      /* privates */
      function __correctPageBySize(pageOld, oldPP, newPP) {
        return Math.max(MIN_PAGE, Math.ceil(pageOld * (oldPP / newPP)));
      }

      function _getSizeBasedOnAltersAndLineSize(altersValue) {
        altersValue = (_.isUndefined(altersValue)) ? pSizeAlters : altersValue;
        return Math.max(lineSize * Math.pow(2, altersValue), lineSize);
      }

      var pPage = ((config && config.offset) / this.pageSize + 1) || 1;


      this.fetchData = function fetchData(mediaCollection) {
        var deffered = $q.defer();
        if (!mediaCollection.searchService || !mediaCollection.searchDefinition) {
          return console.warn("No searchService or searchDefinition!");
        }
        _storedMediaCollection = mediaCollection;

        var startOffset = this.offset;
        var endOffset = this.offset + this.pageSize;
        /* fix */ if (this.allItems>this.pageSize && this.offset+this.pageSize > this.allItems)
          endOffset = this.allItems;

        var lookupInFetchedData = this._lookupInFetchedData(this.offset, endOffset);
        if (lookupInFetchedData) {
          $log.info("lookupInFetchedData sucess! (" + startOffset + "," + endOffset + ")");
          self.data = lookupInFetchedData;
          self.allItems = Math.max(self.allItems, endOffset);
          deffered.resolve(self.data);
        } else {
          // var itemsRange = mediaCollection.pageObject.offset + "-" + endOffset;
          $log.info("Fetching data by search service! (" + startOffset + "," + endOffset + ")");
          mediaCollection._isWorking = true;
          mediaCollection.searchService.searchMethod(mediaCollection.searchDefinition.data, this)
            .then(function (mediaItems) {
              var offsetedData = _offsetFetchedData(mediaItems, startOffset);
              self.fetchedData = _.extend(self.fetchedData, offsetedData); // array of mediaItem(s)?
              self.data = self.fetchedData.slice(startOffset, endOffset);
              self.allItems = Math.max(self.allItems, self.fetchedData.length);
              mediaCollection._isWorking = false;
              deffered.resolve(self.data);
            });
        }
        return deffered.promise;
      };
      function _offsetFetchedData(fetchData, startOffset) {
        var offsetedFetchData = [];
        _.each(fetchData, function (fetchRecord, idx) {
          offsetedFetchData[startOffset + idx] = fetchRecord;
        });
        return offsetedFetchData;
      };
      this._lookupInFetchedData = function (startOffset, endOffset) {
        // TODO: simplify with slice
        var fetchedPart = [];
        _.each(this.fetchedData, function (el, idx) {
          if (startOffset <= idx && idx < endOffset && !_.isUndefined(el))
            fetchedPart.push(el);
        });
        if (_.keys(fetchedPart).length === (endOffset - startOffset))
          return fetchedPart;
        else return null;
      };
      return this;
    }

    return pageObject;
  });
