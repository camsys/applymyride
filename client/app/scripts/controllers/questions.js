'use strict';

angular.module('clientApp')
  .controller('QuestionsController', ['$scope', '$routeParams', 'sectionsFactory',
    function($scope, $routeParams, sectionsFactory) {
      sectionsFactory.get(function(data) {
        $scope.sections = data.sections;
      });
      $scope.section = $routeParams.section;
      $scope.nextSection = '#/questions/' + (parseInt($routeParams.section) + 1);
    }
  ]);