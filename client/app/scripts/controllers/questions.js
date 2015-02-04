'use strict';

angular.module('clientApp')
  .controller('QuestionsController', ['$scope', '$location', '$routeParams', 'sectionsFactory',
    'paratransitApplication',
    function($scope, $location, $routeParams, sectionsFactory, paratransitApplication) {
      sectionsFactory.get(function(data) {
        $scope.sections = paratransitApplication.get();
        if (Object.keys($scope.sections).length==0) {
          $scope.sections = data.sections;
        }
      });
      $scope.section_id = $routeParams.section_id;
      $scope.nextSection = '/questions/' + (parseInt($scope.section_id) + 1);

      $scope.save = function(sections, nextSection) {
        paratransitApplication.set(sections);
        $location.path(nextSection);
      }
    }
  ]);