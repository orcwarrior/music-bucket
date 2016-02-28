/**
 * Created by orcwa on 15.11.2015.
 */


(function () {
  angular.module('musicBucketEngine')
    .factory('modelConverter', function ($injector, $q) {

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

      function __hasProperBuilder(obj, modelName) {
        return _.isObject(obj.__builder__);
      }

      function __hasProperModel(obj, modelName) {
        return (!_.isUndefined(obj.__models__) && !_.isUndefined(obj.__models__[modelName]));
      }

      function convertFromModel(obj, modelName) {
        var deffered = $q.defer();
        var converted = {}, convertedExt;
        if (__hasProperBuilder(obj, modelName)) {
          var builder = $injector.get(obj.__builder__.name);
          $q.when(builder.build(obj.__builder__.data, obj), function (builded) {
            deffered.resolve(builded);
          });
        }
        else if (_.isObject(obj)) { // is proper-store model, or just raw object
          if (obj._base) {
            var constructor = $injector.get(obj._base);
            var conversionDef = constructor.prototype.__models__[modelName];

            convertedExt = _.pick(obj, conversionDef.pickedFields);
            // construct based on service name, with additional args (by fields) if present:
            if (conversionDef.base) {
              var args = _.map(conversionDef.constructorArgs, function (fieldName) {
                // this arg special case:
                if (fieldName === "$this")
                  return convertedExt;
                return convertedExt[fieldName];
              });
              if (args.length === 0) args = undefined;
              converted = construct(constructor, args);
            }
          } else {
            converted = {};
            convertedExt = _.clone(obj);
          }

          // look through restored fields to check if there is any deeper models to store
          var propertyPromises = [];
          _.each(convertedExt, function (val, key) {
            if (_.isArray(val)) { // TODO: Moved to main switch?
              convertedExt[key] = []; // arrays need to be recreated
              _.each(obj[key], function (el, idx) {
                if (_.isObject(el)) {
                  var promise = convertFromModel(el, modelName)
                    .then(function (convertedProp) {
                      converted[key].push(convertedProp);
                    });
                  propertyPromises.push(promise);
                }
                else
                  converted[key].push(el);
              });
            } else if (_.isObject(val)) {
              var promise = convertFromModel(val, modelName)
                .then(function (convertedProp) {
                  converted[key] = convertedProp;
                });
              propertyPromises.push(promise);
            }
          });

          $q.all(propertyPromises)
            .then(function (resolvedPromises) {
              console.log("all promises");
              deffered.resolve(converted);
            });
          if (propertyPromises.length == 0)
            deffered.resolve(converted);

          _.extendOwn(converted, convertedExt);
        }
        else {
          deffered.resolve(obj);
          //_.extendOwn(converted, obj);
        }
        // console.log(converted);
        return deffered.promise;
      }

      function convertToModel(obj, modelName) {
        var converted = {};
        var deffered = $q.defer();
        if (__hasProperBuilder(obj, modelName)) {
          var builder = $injector.get(obj.__builder__.name);
          console.log("toModel.builder");
          builder.store(obj, modelName)
            .then(function (buildedObj) {
              converted = buildedObj;
              converted.__builder__ = obj.__builder__;
              deffered.resolve(converted);
            });
        }
        else if (_.isObject(obj)) { // __model__ stored obj, or just plain
          var propertyPromises = [];
          if (__hasProperModel(obj, modelName)) {
            converted = _.pick(obj, obj.__models__[modelName].pickedFields);
            converted._base = obj.__models__[modelName].base;
            obj = converted; // so it will NOT iterate through ignored fields
          } else {
            converted = _.isArray(obj) ? [] : {};
          }

          _.each(obj, function (val, key) {
            if (!_.isFunction(val) && _.isObject(val)) {
              var propDeffered = convertToModel(val, modelName)
                .then(function (convertedProperty) {
                  console.log("single promise");
                  converted[key] = convertedProperty;
                });
              propertyPromises.push(propDeffered);
            }
            else if (!_.isUndefined(val)) {
              converted[key] = val;
            }
            else {
              console.trace("it's sth else: " + typeof val);
            }
          });
          $q.all(propertyPromises)
            .then(function (resolvedPromises) {
              console.log("all promises");
              deffered.resolve(converted);
            });
        }
        // bugfix: not all object in-dept-line has to have conversion properties
        else {
          console.log("toModel.original");
          deffered.resolve(obj); // return original ???
        }
        // console.log(converted);
        return deffered.promise;
      }

      var modelConverter = {
        setModelName: function (modelName) {
          this.modelName = modelName;
        },
        convertFromModel: function (model, modelName) {
          console.info("convertFromModel");
          var obj = convertFromModel(model, modelName || this.modelName);
          return obj;
        },
        convertToModel: function (obj, modelName) {
          console.info("convertToModel");
          var model = convertToModel(obj, modelName || this.modelName);
          return model;
        }
      };
      return modelConverter

    });
})
();
