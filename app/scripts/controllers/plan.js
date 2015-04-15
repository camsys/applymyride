'use strict';

var app = angular.module('applyMyRideApp');

app.controller('PlanController', ['$scope', '$routeParams', '$location', 'planService', 'flash', 'usSpinnerService', '$q', 'LocationSearch',

function($scope, $routeParams, $location, planService, flash, usSpinnerService, $q, LocationSearch) {

  $scope.marker = null;
  $scope.locations = [];
  $scope.placeIds = [];
  $scope.showConfirmLocationMap = false;
  $scope.mapOptions = {
    zoom: 17,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  $scope.step = $routeParams.step;
  $scope.disableNext = true;
  $scope.showUndo = false;
  $scope.showNext = true;
  $scope.planService = planService;
  $scope.fromDate = new Date();
  $scope.returnDate = new Date();

  $scope.openCalendar = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1,
    showWeeks: false,
    showButtonBar: false
  };

  $scope.minDate = new Date();



  $scope.getFromDateString = function(){
    return $scope.getDateString(planService.fromDate, planService.fromTime, planService.fromTimeType)
  }

  $scope.getReturnDateString = function(){
    return $scope.getDateString(planService.returnDate, planService.returnTime, planService.returnTimeType )
  }

  $scope.getDateString = function(date, time, type){
    var fromDateString = null
    if(date){
      fromDateString = moment(date).format('M/D/YYYY');
      if(type == 'asap'){
        fromDateString += " - As soon as possible"
      }else if(type == 'depart'){
        fromDateString += " - Depart at " + moment(time).format('h:mm a');
      }else if(type == 'arrive'){
        fromDateString += " - Arrive at " + moment(time).format('h:mm a');
      }
    }
    return fromDateString;
  }

  switch($routeParams.step) {
    case undefined:
    case 'start_current':
      $scope.showNext = false;
      break;
    case 'from':
      if(planService.from != null){
        $scope.from = planService.from;
        $scope.disableNext = false;
        $scope.$apply();
      }
      break;
    case 'fromDate':
      if(planService.fromDate != null){
        $scope.fromDate = planService.fromDate;
      }
      $scope.disableNext = false;
      break;
    case 'fromTime':
      if(planService.fromTime != null){
        $scope.fromTime = planService.fromTime;
      }else{
        $scope.fromTime = new Date();
      }
      $scope.disableNext = false;
      break;
    case 'to':
      if(planService.to != null){
        $scope.to = planService.to;
        $scope.disableNext = false;
      }
      break;
      break;
    case 'returnDate':
      if(planService.returnDate != null){
        $scope.returnDate = planService.returnDate;
      }else if(planService.fromDate != null){
        $scope.returnDate = planService.fromDate;
      }
      $scope.fromDate = planService.fromDate
      $scope.disableNext = false;
      break;
    case 'returnTime':
      if(planService.returnTime != null){
        $scope.returnTime = planService.returnTime;
      }else{
        $scope.returnTime = new Date();
      }
      $scope.disableNext = false;
      break;
    case 'purpose':
      $scope.showNext = false;
      break;
    case 'confirm':
      $scope.showNext = false;
      break;
    case 'needReturnTrip':
    case 'fromTimeType':
      $scope.showNext = false;
      break;
    case 'returnTimeType':
      $scope.showNext = false;
      break;
    case 'from_confirm':
      if(planService.from == null){
        $location.path("/plan/fromDate");
        $scope.step = 'fromDate';
      }
      $scope.showNext = false;
      break;
    default:

      break;
  }

  $scope.next = function() {
    switch($scope.step) {
      case 'fromDate':
        planService.fromDate = $scope.fromDate;
        $location.path('/plan/fromTimeType');
        break;
      case 'fromTime':
        console.log($scope.fromTime);
        planService.fromTime = $scope.fromTime;
        $location.path('/plan/start_current');
        break;
      case 'from':
        planService.fromDate = $scope.fromDate;
        $location.path('/plan/to');
        break;
      case 'from_confirm':
        $location.path('/plan/to');
        break;
      case 'to':
        $location.path('/plan/purpose');
        break;
      case 'needReturnTrip':
        $location.path('/plan/returnDate');
        break;
      case 'returnDate':
        planService.returnDate = $scope.returnDate;
        $location.path('/plan/returnTimeType');
        break;
      case 'returnTime':
        planService.returnTime = $scope.returnTime;
        $location.path('/plan/confirm');
        break;
      case 'confirm':
        $location.path('/plan2');
        break;
    }
  };

  $scope.undo = function() {
    switch($routeParams.step) {
      case 'from':
        $scope.fromChoice = null;
        $scope.showMap = false;
        $scope.showUndo = false;
        $scope.disableNext = true;
        break;
      case 'to':
        $scope.toChoice = null;
        $scope.showMap = false;
        $scope.showUndo = false;
        $scope.disableNext = true;
        break;
      default:
        break;
    }
  }

  $scope.specifyTripPurpose = function(purpose){
    planService.purpose = purpose;
    $location.path("/plan/needReturnTrip");
    $scope.step = 'needReturnTrip';
  }

  $scope.specifyFromTimeType = function(type){
    planService.fromTimeType = type;
    if(type == 'asap'){
      $location.path("/plan/start_current");
      $scope.step = 'from';
    }else{
      $location.path("/plan/fromTime");
      $scope.step = 'fromTime';
    }
  }

  $scope.specifyReturnTimeType = function(type){
    planService.returnTimeType = type;
    if(type == 'asap'){
      $location.path("/plan/confirm");
      $scope.step = 'confirm';
    }else{
      $location.path("/plan/returnTime");
      $scope.step = 'fromTime';
    }
  }

  $scope.getLocations = function(typed){
    if(typed){
      $scope.suggestions = LocationSearch.getLocations(typed);
      $scope.suggestions.then(function(data){

        var choices = [];

        var savedPlaceData = data[2];
        if(savedPlaceData && savedPlaceData.length > 0){
          choices.push({label:'Saved Places', option: false});
          angular.forEach(savedPlaceData, function(savedPlace, index) {
            choices.push({label:savedPlace, option: true});
          }, choices);
        }


        var recentSearchData = data[1];
        if(recentSearchData && recentSearchData.length > 0){
          choices.push({label:'Recently Searched', option: false});
          angular.forEach(recentSearchData, function(recentSearch, index) {
            choices.push({label:recentSearch, option: true});
          }, choices);
        }

        var googlePlaceData = data[0].googleplaces;
        if(googlePlaceData.length > 0){
          choices.push({label:'Suggestions', option: false});
          angular.forEach(googlePlaceData, function(googleplace, index) {
            choices.push({label:googleplace, option: true});
          }, choices);
        }

        $scope.locations = choices;
        $scope.placeLabels = googlePlaceData;
        $scope.placeIds = data[0].placeIds;
      });
    }
  }

  $scope.selectPlace = function(place){
    var map;
    if($routeParams.step == 'from'){
      map = $scope.fromLocationMap;
    }else if($routeParams.step == 'to'){
      map = $scope.toLocationMap;
    }
    var placeId = $scope.placeIds[$scope.placeLabels.indexOf(place)]
    var placesService = new google.maps.places.PlacesService(map);
    placesService.getDetails( { 'placeId': placeId}, function(result, status) {
      if (status == google.maps.GeocoderStatus.OK) {

        if($routeParams.step == 'from'){
          planService.fromDetails = result;
        }else if($routeParams.step == 'to'){
          planService.toDetails = result;
        }

        var bounds = new google.maps.LatLngBounds(result.geometry.location, result.geometry.location);
        if($scope.marker){
          $scope.marker.setMap(null);
        }

        $scope.showMap = true;
        $scope.showUndo = true;
        $scope.disableNext = false;
        $scope.showNext = true;
        $scope.$apply();

        google.maps.event.trigger(map, 'resize');


        map.setCenter(result.geometry.location);
        $scope.marker = new google.maps.Marker({
          map: map,
          position: result.geometry.location,
          animation: google.maps.Animation.DROP
        });
        //var bounds = new google.maps.LatLngBounds(result.geometry.location, result.geometry.location);
        var contentString = '' + result.name;
        var infoWindow = new google.maps.InfoWindow({content: contentString, position: result.geometry.location});

      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  $scope.purposes = [
    'General Purpose',
    'After School Program',
    'Grocery',
    'Medical',
    'Work',
    'Other'
  ];

  $scope.readyToPlan = function() {
    return planService.from && planService.to && planService.depart && (planService.return || $scope.returnTrip===false);
  };

  $scope.getCurrentLocation = function() {
    usSpinnerService.spin('spinner-1');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition($scope.setOriginLocation, $scope.showError);
    } else {
      $scope.error = "Geolocation is not supported by this browser.";
    }
  };

  $scope.showError = function (error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        $scope.error = "User denied the request for Geolocation."
        break;
      case error.POSITION_UNAVAILABLE:
        $scope.error = "Location information is unavailable."
        break;
      case error.TIMEOUT:
        $scope.error = "The request to get user location timed out."
        break;
      case error.UNKNOWN_ERROR:
        $scope.error = "An unknown error occurred."
        break;
    }
    $scope.$apply();
  }

  $scope.setOriginLocation = function (position) {
    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          var result = results[0];
          planService.from = result.formatted_address;
          planService.fromDetails = result;
          $location.path("/plan/from_confirm");
          $scope.step = 'from_confirm';
          $scope.$apply();
        }
      }
    })
  }

  $scope.overrideCurrentLocation = function() {
    $scope.restartPlan();
    $location.path("/plan/from");
    $scope.step = 'from';
  };

  $scope.restartPlan = function() {
    planService.from = null;
    planService.fromDetails = null;
  };

  $scope.$watch('fromDate', function(n) {
      if($scope.step == 'fromDate'){
        if (n) {
          $scope.fromDate = n;
          $scope.disableNext = false;
        }else{
          $scope.disableNext = true;
        }
      }
    }
  );

  $scope.$watch('returnDate', function(n) {
      if($scope.step == 'returnDate'){
        if (n) {
          $scope.returnDate = n;
          $scope.disableNext = false;
        }else{
          $scope.disableNext = true;
        }
      }
    }
  );

  $scope.$watch('fromChoice', function(n) {
      if (n) {
        planService.from = n;
        $scope.disableNext = true;
      }
    }
  );

  $scope.$watch('toChoice', function(n) {
      if (n) {
        planService.to = n;
        $scope.disableNext = false;
      }
    }
  );

  $scope.$watch('fromLocationMap', function(map) {
    if(map && $routeParams.step == 'from' && planService.from){
        $scope.fromChoice = planService.from;
        var result = planService.fromDetails;
        if($scope.marker){
          $scope.marker.setMap(null);
        }
        map.setCenter(result.geometry.location);
        $scope.marker = new google.maps.Marker({
          map: map,
          position: result.geometry.location,
          animation: google.maps.Animation.DROP
        });
        $scope.showMap = true;
        $scope.disableNext = false;
        $scope.showNext = true;
        $scope.showUndo = true;
    }
  })

  $scope.$watch('toLocationMap', function(map) {
    if(map && $routeParams.step == 'to' && planService.to){
      $scope.toChoice = planService.to;
      var result = planService.toDetails;
      if($scope.marker){
        $scope.marker.setMap(null);
      }
      map.setCenter(result.geometry.location);
      $scope.marker = new google.maps.Marker({
        map: map,
        position: result.geometry.location,
        animation: google.maps.Animation.DROP
      });
      $scope.showMap = true;
      $scope.disableNext = false;
      $scope.showNext = true;
      $scope.showUndo = true;
    }
  })


  $scope.$watch('confirmFromLocationMap', function(n) {
      if (n) {
        if(planService.fromDetails && $scope.step == 'from_confirm'){
          var result = planService.fromDetails;
          n.setCenter(result.geometry.location);
          if($scope.marker){
            $scope.marker.setMap(null);
          }
          $scope.marker = new google.maps.Marker({
            map: n,
            position: result.geometry.location,
            animation: google.maps.Animation.DROP
          });
          var bounds = new google.maps.LatLngBounds(result.geometry.location, result.geometry.location);

          var contentString = '' + result.name;
          var infoWindow = new google.maps.InfoWindow({content: contentString, position: result.geometry.location});
          //infoWindow.open(map);

          google.maps.event.trigger(n, 'resize');
          n.setCenter(result.geometry.location);
          $scope.showMap = true;
          $scope.showConfirmLocationMap = true;
        }
      }
    }
  );
}
]);

