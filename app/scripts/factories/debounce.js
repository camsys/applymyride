'use strict';

var app = angular.module('applyMyRideApp');

app.factory('debounce', ['$timeout', '$q', function ($timeout, $q) {
  /**
   * Angular JS Debounce factory
   * - only exists to debounce function calls so we can't spam a button over and over
   * - taken from this StackOverflow post: https://stackoverflow.com/questions/13320015/how-to-write-a-debounce-service-in-angularjs
   *
   * @param {Function} func - the input function to be debounced
   * @param {number} wait - wait time before executing the function in milliseconds
   * @param {Boolean} immediate - run the input function immediately?
   */
  return function debounce(func, wait, immediate) {
    let timeout;
    // Create a deferred object that will be resolved when we need to
    // ... actually call the function
    // The Deferred object represents a task to be finished in the future
    let deferred = $q.defer(); // $q is a service that lets your run functions asynchronously

    return function () {
      let context = this;
      let args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) {
          deferred.resolve(func.apply(context, args));
          deferred = $q.defer();
        }
      };
      const callNow = immediate && !timeout;
      if (timeout) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(later, wait);
      if (callNow) {
        deferred.resolve(func.apply(context,args));
        deferred = $q.defer();
      }
      return deferred.promise;
    };
  };
}]);