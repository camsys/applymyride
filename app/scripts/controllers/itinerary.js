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

        if($scope.driverInstructions == null)
          $scope.driverInstructions = 'N/A';

        $scope.escort = "";
        if($scope.trip.hasEscort == true){
          $scope.escort += "1 Escort";
        }

        if($scope.trip.numberOfCompanions != null && $scope.trip.numberOfCompanions > 0){
          if($scope.escort){
            $scope.escort += ', ';
          }
          $scope.escort += $scope.trip.numberOfCompanions + ' Companion';
          if(planService.numberOfCompanions > 1){
            $scope.escort += 's';
          }
        }

        if($scope.escort.length == 0)
          $scope.escort = 'N/A';

      }
      $scope.mode = $scope.trip.mode;

      $scope.show = function($event){
        var index = $(event.target).parents('.timeline').attr('index');
        $scope.showDiv[index] = !$scope.showDiv[index];
      }
    }
  ]);
