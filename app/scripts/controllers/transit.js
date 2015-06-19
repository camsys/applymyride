'use strict';

angular.module('applyMyRideApp')
  .controller('TransitController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {

      $scope.location = $location.path();
      $scope.disableNext = true;
      $scope.tripid = $routeParams.tripid;
      $scope.showDiv = {};

      $scope.prepareTrip = function(){
        angular.forEach(planService.searchResults.itineraries, function(itinerary, index) {
          if(itinerary.id == $scope.tripid){
            planService.prepareTripSearchResultsPage(0);
            $scope.fare_info = planService.fare_info;
            $scope.transitInfos = planService.transitInfos;
            $scope.itinerary = itinerary;
          }
        });
      }

      if($routeParams.test){
        $http.get('data/'+ $routeParams.test + '.json').
          success(function(data) {
            planService.searchResults = data;
            $scope.prepareTrip();
          });
      }else{
        $scope.prepareTrip();
      }


      $scope.show = function($event){
        var index = $(event.target).parents('.timeline').attr('index');
        $scope.showDiv[index] = !$scope.showDiv[index];
      }

    }
  ]);
