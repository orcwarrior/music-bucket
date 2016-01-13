/**
 * Created by orcwa on 26.10.2015.
 */
/*!
 * node.flow
 * Copyright(c) 2011 Ben Lin <ben@dreamerslab.com>
 * MIT Licensed
 *
 * @fileoverview
 * A deadly simple flow control package for node.js
 */

/**
 * @private
 */

/**
 * @private
 * @function
 */

// DK: Inline extend-implementation:


/**
 * Extening object that entered in first argument.
 *
 * Returns extended object or false if have no target object or incorrect type.
 *
 * If you wish to clone source object (without modify it), just use empty new
 * object as first argument, like this:
 *   deepExtend({}, yourObj_1, [yourObj_N]);
 */
var deepExtend = function (/*obj_1, [obj_2], [obj_N]*/) {


  function isSpecificValue(val) {
    return (
      val instanceof Buffer
      || val instanceof Date
      || val instanceof RegExp
    ) ? true : false;
  }

  function cloneSpecificValue(val) {
    if (val instanceof Buffer) {
      var x = new Buffer(val.length);
      val.copy(x);
      return x;
    } else if (val instanceof Date) {
      return new Date(val.getTime());
    } else if (val instanceof RegExp) {
      return new RegExp(val);
    } else {
      throw new Error('Unexpected situation');
    }
  }

  /**
   * Recursive cloning array.
   */
  function deepCloneArray(arr) {
    var clone = [];
    arr.forEach(function (item, index) {
      if (typeof item === 'object' && item !== null) {
        if (Array.isArray(item)) {
          clone[index] = deepCloneArray(item);
        } else if (isSpecificValue(item)) {
          clone[index] = cloneSpecificValue(item);
        } else {
          clone[index] = deepExtend({}, item);
        }
      } else {
        clone[index] = item;
      }
    });
    return clone;
  }

  if (arguments.length < 1 || typeof arguments[0] !== 'object') {
    return false;
  }

  if (arguments.length < 2) {
    return arguments[0];
  }

  var target = arguments[0];

  // convert arguments to array and cut off target object
  var args = Array.prototype.slice.call(arguments, 1);

  var val, src, clone;

  args.forEach(function (obj) {
    // skip argument if it is array or isn't object
    if (typeof obj !== 'object' || Array.isArray(obj)) {
      return;
    }

    Object.keys(obj).forEach(function (key) {
      src = target[key]; // source value
      val = obj[key]; // new value

      // recursion prevention
      if (val === target) {
        return;

        /**
         * if new value isn't object then just overwrite by new value
         * instead of extending.
         */
      } else if (typeof val !== 'object' || val === null) {
        target[key] = val;
        return;

        // just clone arrays (and recursive clone objects inside)
      } else if (Array.isArray(val)) {
        target[key] = deepCloneArray(val);
        return;

        // custom cloning and overwrite for specific objects
      } else if (isSpecificValue(val)) {
        target[key] = cloneSpecificValue(val);
        return;

        // overwrite by new value if source isn't object or array
      } else if (typeof src !== 'object' || src === null || Array.isArray(src)) {
        target[key] = deepExtend({}, val);
        return;

        // source value and new value is objects both, extending...
      } else {
        target[key] = deepExtend(src, val);
        return;
      }
    });
  });

  return target;
}


var slice  = [].slice;

/**
 * Check array equality
 * @private
 * @function
 * @this {global}
 * @param {Array} a First array to be compared
 * @param {Array} b second array to be compared
 * @returns {Bool} Whether if these 2 array match
 */
var arrays_equal = function ( a, b ){
  return !!a && !!b && ! ( a < b || b < a );
};



/**
 * Creates a new Flow.
 * @class Represents a flow control.
 * @requires extend
 * @requires fs
 * @constructor
 */
var Flow = function (){

  /**
   * Default auguments for all task functions.
   * @type {Array}
   * @default []
   */
  this._defaults = slice.call( arguments ) || [];

  /**
   * Series augument stack
   * @type {Array}
   */
  this._series_args = [];

  /**
   * Series task stack
   * @type {Array}
   */
  this._series = [];

  /**
   * Parallel augument stack
   * @type {Array}
   */
  this._ready_args = [];

  /**
   * Parallel augument stack
   * @type {Array}
   */
  this._parallel_args = [];

  /**
   * Parallel task stack
   * @type {Array}
   */
  this._parallel = [];

  /**
   * Parallel task group create counter
   * @type {Number}
   */
  this._group = 0;

  /**
   * Parallel task group execute counter
   * @type {Number}
   */
  this._count = 0;
};



Flow.prototype = {

  /**
   * Default error handler.
   * @private
   * @this {Flow}
   * @param {Error} err Error to throw.
   */
  _error : function ( err ){
    throw err;
  },



  /**
   * Check if the stack handler is the `next` handler.
   * @private
   * @this {Flow}
   * @param {String} str The handler to be check.
   */
  _is_next : function ( str ){
    return /self\[ '_' \+ next_type \]\.apply\( self, slice\.call\( arguments \)\);/g.test( str );
  },



  /**
   * Call the current series function and remove it.
   * @private
   * @this {Flow}
   * @param {Array} args Arguments to be passed to the current series function.
   */
  _run_series : function ( args ){
    if( args.length && args[ 0 ] instanceof Error ){
      return this._error.apply( this, args );
    }

    try{
      this._series.shift().apply( this, args );
    }catch( err ){
      args.unshift( err );
      this._error.apply( this, args );
    }
  },



  /**
   * Merge the next task arguments and call the next series function.
   * @private
   * @this {Flow}
   * @param {String|Number|Array|Object|Function} [arguments[ n ]] Arguments to be merged with the current arguments.
   */
  _next : function (){
    var args              = slice.call( arguments );
    var stack_series_args = this._series_args.shift();
    var next              = stack_series_args.pop();

    if( next ){
      if( stack_series_args.length === 0 ){
        stack_series_args = args;
      }else{
        deepExtend( true, stack_series_args, args );
      }

      stack_series_args.push( next );
      this._run_series( stack_series_args );
    }
  },



  /**
   * Call the current parallel functions and remove it.
   * @private
   * @this {Flow}
   * @param {Array} args Arguments to be added to the current parallel function.
   */
  _run_parallel : function ( args ){
    var self                = this;
    var parallel_args       = this._parallel_args.shift();
    var args_form_last_task = args;

    if( parallel_args === undefined ){
      throw new Error( '[node.flow] no parallel task assigned before calling `join`' );
    }

    this._count = parallel_args.length;

    this._parallel.shift().forEach( function ( task ){
      var _args = parallel_args.shift();

      if( args_form_last_task.length > 0 ){
        _args.unshift( args_form_last_task );
      }

      console.log("Parallel args: " + _args);
      console.log("Last-Parallel args: " + args_form_last_task);
      console.log("Parallel task: " + task);

      task.apply( self, _args );
    });

    this._group--;
  },



  /**
   * Push the arguments from parallel tasks to a global stack,
   * merge them with the next task arguments and fire `this._run_series` at the last run
   * @private
   * @this {Flow}
   * @param {String|Number|Array|Object} [arguments[ n ]] Arguments to be merged with the next task arguments.
   */
  _ready : function (){
    var arg, stack_series_args;

    if( arguments.length > 0 ){
      this._ready_args.push( arguments );
    }

    this._count--;

    if( this._count === 0 ){
      stack_series_args = this._series_args.shift();

      if( this._ready_args.length > 0 ){
        stack_series_args.unshift( this._ready_args );
      }

      arg = stack_series_args;

      this._ready_args = [];
      this._run_series( arg );
    }
  },



  /**
   * Add series or parallel task to the flow stack.
   * @public
   * @this {Flow}
   * @param {Arguments} args Arguments from this.series or this.parallel.
   * @param {String} next_type Assign this._next or this._ready to be the last prop in the arguments.
   * @param {Function} callback Callback function for this.series or this.parallel.
   * @param {Bool} merge_default Whether if to merge the default args.
   */
  _add : function ( args, next_type, callback, merge_default ){
    var self  = this;
    var task  = [].shift.call( args ) || function (){};
    var _args = merge_default ? deepExtend([], this._defaults ) : [];

    deepExtend( _args, slice.call( args ));
    _args.push( function (){
      self[ '_' + next_type ].apply( self, slice.call( arguments ));
    });

    callback( _args, task );
  },



  /**
   * Add series task to the flow stack.
   * @public
   * @this {Flow}
   * @param {Function} arguments[ 0 ] Task function to be called in series.
   * @param {String|Number|Array|Object|Function} [arguments[ 1 ]] Arguments to be passed to the task function(optional).
   * @returns {this} Return `this` to enable chaining.
   * @example
   *
   *     var Flow = require( 'node.flow' );
   *     var flow = new Flow();
   *
   *     flow.series( function( name, sort, next ){
 *       User.find({
 *         name : name
 *       }).sort( sort, -1 ).run( function ( err, users ){
 *         next( users );
 *       });
 *     }, 'bibi', 'created_at' );
   */
  series : function (){
    var self = this;

    this._add( arguments, 'next', function ( args, task ){
      self._series_args.push( args );
      self._series.push( task );
    }, true );

    return this;
  },



  /**
   * Add parallel task to the flow stack.
   * @public
   * @this {Flow}
   * @param {Function} arguments[ 0 ] Task function to be called in parallel.
   * @param {String|Number|Array|Object|Function} [arguments[ 1 ]] Arguments to be passed to the task function.
   * @returns {this} Return `this` to enable chaining.
   * @example
   *
   *     var Flow = require( 'node.flow' );
   *     var flow = new Flow();
   *
   *     flow.parallel( function( name, sort, ready ){
 *       User.find({
 *         name : name
 *       }).sort( sort, -1 ).run( function ( err, users ){
 *         ready( users );
 *       });
 *     }, 'bibi', 'created_at' );
   */
  parallel : function (){
    var self = this;

    this._add( arguments, 'ready', function ( args, task ){
      var group = self._group;

      if( self._parallel[ group ] === undefined ){
        self._parallel_args[ group ] = [];
        self._parallel[ group ]      = [];
      }

      self._parallel_args[ group ].push( args );
      self._parallel[ group ].push( task );
    }, true );

    return this;
  },



  /**
   * Set an end point for a group of parallel tasks.
   * @public
   * @this {Flow}
   * @param {Bool} is_parallel Whether if to use only first prop of the arguments
   * @returns {this} Return `this` to enable chaining.
   * @example
   *
   *     var Flow = require( 'node.flow' );
   *     var flow = new Flow();
   *
   *     flow.parallel( function( name, sort, ready ){
 *       User.find({
 *         name : name
 *       }).sort( sort, -1 ).run( function ( err, users ){
 *         ready( users );
 *       });
 *     }, 'bibi', 'created_at' );
   *
   *     flow.join();
   */
  join : function ( is_parallel ){
    var self = this;

    // arguments will not merged with defaults, only the args from last stack
    // if we pass the last arg as false
    this._add([ function (){
      var args = slice.call( arguments );
      var len  = arguments.length;

      if( len === 1 ){
        if( self._is_next( args[ 0 ])){
          args = [];
        }
      }else{
        // remove the last prop if it is a `next` method
        self._is_next( args[ len - 1 ]) && [].pop.call( args );

        // if last task is parallel
        if( is_parallel === true ) args = args[ 0 ];

        if( self._defaults.length > 0 && arrays_equal( args, self._defaults )){
          args = [];
        }
      }

      self._run_parallel( args );
    }], 'next', function ( args, task ){
      self._series_args.push( args );
      self._series.push( task );
    }, false );

    this._group++;

    return this;
  },

  error : function ( callback ){
    this._error = callback;

    return this;
  },



  /**
   * Call the tasks one after another in the stack.
   * @public
   * @this {Flow}
   * @param {Function} arguments[ 0 ] Callback function when all tasks are finished.
   * @param {String|Number|Array|Object|Function} [arguments[ 1 ]] Arguments to be passed to the callback.
   * @returns {this} Return `this` to enable chaining.
   * @example
   *
   * var Flow  = require( 'node.flow' );
   * var flow  = new Flow();
   * var users = {};
   *
   *    // find users with the given names
   *    [ 'fifi', 'jenny', 'steffi' ].forEach( function ( name ){
 *      // assign 3 parallel tasks searching for users
 *      flow.parallel( function( users, name, ready ){
 *        User.findOne({
 *          name : name
 *        }, function ( err, user ){
 *          users[ name ] = user;
 *          ready();
 *        });
 *      }, users, name )
 *    });
   *
   *    flow.join();
   *
   *    // print out the search results
   *    flow.end( function( users ){
 *      console.log( users );
 *    });
   */
  end : function (){
    this.series.apply( this, arguments ).
      _run_series( this._series_args.shift());

    return this;
  }
};



/**
 * @public
 */
Flow.version = "1.2.3"; // DK: Hardcoded



/**
 * Exports module.
 */
// module.exports = Flow;
