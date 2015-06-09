'use strict';

angular.module('applyMyRideApp')
  .controller('TransitController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {

      $scope.location = $location.path();
      $scope.disableNext = true;
      $scope.tripid = $routeParams.tripid;
      $scope.showDiv = {};

      $http.get('data/itineraries.json').
        success(function(data) {
          planService.searchResults = data;
          planService.prepareTripSearchResultsPage($scope);
          $scope.prepareTrip();
      });

      $scope.prepareTrip = function(){
        angular.forEach(planService.searchResults.itineraries, function(itinerary, index) {
          if(itinerary.id == $scope.tripid){
            angular.forEach(itinerary.json_legs, function(leg, index) {
              planService.setItineraryLegDescriptions(leg);
              if(leg.steps){
                angular.forEach(leg.steps, function(step, index) {
                  planService.setWalkingDescriptions(step);
                });
              }
            });
            itinerary.destinationDesc = itinerary.json_legs[itinerary.json_legs.length - 1].to.name;
            itinerary.destinationTimeDesc = itinerary.json_legs[itinerary.json_legs.length - 1].endTimeDesc;
            $scope.itinerary = itinerary;
          }
        });
      }
      $scope.test = function($event){
        var index = $(event.target).parents('.timeline').attr('index');
        $scope.showDiv[index] = !$scope.showDiv[index];
      }

      $scope.next = function(){
        if($scope.disableNext)
          return;
        var path = $location.path();
        planService.sharedRideId = $scope.sharedRideId;
        planService.county = $scope.county;
        planService.dateofbirth = $scope.dateofbirth;
        if(path == '/'){
          $location.path('/authenticateSharedRideId');
        }else if(path == '/authenticateSharedRideId' || path == '/loginError'){
          $scope.authenticate();
        }
      }

    }
  ]);
