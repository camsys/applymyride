'use strict';

angular.module('applyMyRideApp')
  .controller('ItineraryController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {
      $scope.showDiv = {};
      $scope.location = $location.path();
      $scope.trip = planService.selectedTrip;
      angular.forEach($scope.trip.itineraries, function(itinerary, index) {
        planService.prepareItinerary(itinerary);
      });
      if($scope.trip.mode == 'mode_transit'){
        $scope.itineraries = $scope.trip.itineraries;
      }else if($scope.trip.mode == 'mode_walk'){
        $scope.walkItineraries = $scope.trip.itineraries;
      }else if($scope.trip.mode == 'mode_paratransit'){
        $scope.paratransitItineraries = $scope.trip.itineraries;
        angular.forEach($scope.paratransitItineraries, function(result, index) {
          result.wait_startDesc = moment(result.wait_start).format('h:mm a');
          result.wait_endDesc = moment(result.wait_end).format('h:mm a');
          result.arrivalDesc = moment(result.arrival).format('h:mm a');
        });
      }
      $scope.mode = $scope.trip.mode;

      $scope.show = function($event){
        var index = $(event.target).parents('.timeline').attr('index');
        $scope.showDiv[index] = !$scope.showDiv[index];
      }
    }
  ]);
