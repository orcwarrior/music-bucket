/**
 * Created by orcwa on 15.11.2015.
 */


(function () {
  angular.module('musicBucketEngine')
    .factory('modelConverter', function ($injector) {

      // Hacky o,O http://stackoverflow.com/a/1608546
      function construct(constructor, args) {
        /*
        function dummyConstructor() {
          return constructor.apply(this, args);
        }

        dummyConstructor.prototype = constructor.prototype;
        return new dummyConstructor();
        */
        // BUGFIX: Strange o,O
        if (_.isArray(args)) args.unshift(undefined);
        return new (Function.prototype.bind.apply(constructor, args));
      }

      function __hasProperModel(obj, modelName) {
        return (!_.isUndefined(obj.__models__) && !_.isUndefined(obj.__models__[modelName]));
      }

      function convertFromModel(obj, modelName) {
        var converted = {}, convertedExt;
        if (obj._base) { // is proper-store model, or just raw object?
          var constructor = $injector.get(obj._base);
          var conversionDef = constructor.prototype.__models__[modelName];
          convertedExt = _.pick(obj, conversionDef.pickedFields);

          // construct based on service name, with additional args (by fields) if present:
          if (conversionDef.base) {
            var args = _.map(conversionDef.constructorArgs, function (fieldName) {
              return convertedExt[fieldName];
            });
            if (args.length === 0) args = undefined;
            converted = construct(constructor, args);
          }

          // look through restored fields to check if there is any deeper models to store
          _.each(convertedExt, function (val, key) {
            if (_.isArray(val)) {
              convertedExt[key] = []; // arrays need to be recreated
              _.each(obj[key], function (el, idx) {
                if (_.isObject(el))
                  convertedExt[key].push(convertFromModel(el, modelName));
                else
                  convertedExt[key].push(el);
              });
            }
            else if (_.isObject(val))
              convertedExt[key] = convertFromModel(val, modelName);
          })
          _.extendOwn(converted, convertedExt);
        } else {
          return obj; // return original
          //_.extendOwn(converted, obj);
        }
        // console.log(converted);
        return converted;
      }

      function convertToModel(obj, modelName) {
        var converted = {};
        if (__hasProperModel(obj, modelName)) {
          var conversionDef = obj.__models__[modelName];
          converted = _.pick(obj, conversionDef.pickedFields);
          converted._base = conversionDef.base;
          // look through restored fields to check if there is any deeper models to store
          _.each(converted, function (val, key) {
            if (_.isArray(val)) {
              converted[key] = []; // arrays need to be recreated
              _.each(obj[key], function (el, idx) {
                if (_.isObject(el))
                  converted[key].push(convertToModel(el, modelName));
                else
                  converted[key].push(el);
              });
            }
            else if (_.isObject(val))
              converted[key] = convertToModel(val, modelName);
          })
        } else {
          return obj; // return original ???
        }
        // console.log(converted);
        return converted;
      }

      var modelConverter = {
        setModelName: function (modelName) {
          this.modelName = modelName;
        },
        convertFromModel: function (model, modelName) {
          console.log("convertFromModel");
          var obj = convertFromModel(model, modelName || this.modelName);
          console.log(obj);
          return obj;
        },
        convertToModel: function (obj, modelName) {
          console.log("convertToModel");
          var model = convertToModel(obj, modelName || this.modelName);
          console.log(model);
          return model;
        }
      };
      return modelConverter

    });
})
();
