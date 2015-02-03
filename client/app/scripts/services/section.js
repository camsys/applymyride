'use strict';

/**
 * @ngdoc service
 * @name quizModule.quizBasicFactory
 * @description
 * # quizBasicFactory
 * Factory in the quizModule.
 */
angular.module('clientApp')
  .factory('sectionsFactory', function ($resource) {
    return $resource('./data/sections.json');
  });
