'use strict';

var app = angular.module('applyMyRideApp');

app.controller('PlanController', ['$scope', '$routeParams', '$location', 'planService', 'flash', 'usSpinnerService', '$q', 'LocationSearch',

function($scope, $routeParams, $location, planService, flash, usSpinnerService, $q, LocationSearch) {

  $scope.marker = null;
  $scope.locations = [];
  $scope.placeIds = [];
  $scope.showConfirmLocationMap = false;
  $scope.mapOptions = {
    center: new google.maps.LatLng(35.784, -78.670),
    zoom: 17,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };


  $scope.step = $routeParams.step;

  $scope.ready = false;
  $scope.showUndo = false;
  $scope.showNext = true;
  $scope.planService = planService;

  switch($routeParams.step) {
    case undefined:
    case 'from':
      if(planService.from != null){
        $scope.$apply();
      }
      break;
    case 'to':
      if(planService.to != null){
        $scope.$apply();
      }
      break;
    case 'departDate':
    case 'departTime':
    case 'returnDate':
    case 'returnTime':
    case 'purpose':
    case 'confirm':
      $scope.ready = true;
      break;
    case 'needReturnTrip':
    case 'start':
      $scope.showNext = false;
      break;
    case 'from_confirm':
      if(planService.from == null){
        $location.path("/plan/start");
        $scope.step = 'start';
      }
      $scope.showNext = false;
      break;
    default:

      break;
  }

  $scope.next = function() {
    switch($scope.step) {
      case 'start':
        $location.path('/plan/from');
        break;
      case 'from':
        $location.path('/plan/to');
        break;
      case 'from_confirm':
        $location.path('/plan/to');
        break;
      case 'to':
        $location.path('/plan/departDate');
        break;
      case 'departDate':
        $location.path('/plan/departTime');
        break;
      case 'departTime':
        var t = moment(planService.departTime, 'h:mm a');
        planService.departDate.hour(t.hour()).minute(t.minute()).second(0).millisecond(0);
        $location.path('/plan/needReturnTrip');
        break;
      case 'needReturnTrip':
        $location.path('/plan/returnDate');
        break;
      case 'returnDate':
        $location.path('/plan/returnTime');
        break;
      case 'returnTime':
        var t = moment(planService.returnTime, 'h:mm a');
        planService.returnDate.hour(t.hour()).minute(t.minute()).second(0).millisecond(0);
        $location.path('/plan/purpose');
        break;
      case 'purpose':
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
        $scope.ready = false;
        break;
      case 'to':
        $scope.toChoice = null;
        $scope.showMap = false;
        $scope.showUndo = false;
        $scope.ready = false;
        break;
      default:
        break;
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
        $scope.ready = true;
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


  planService.purpose = 'Medical';
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

  $scope.getCurrentLocation = function() {
    usSpinnerService.spin('spinner-1');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition($scope.setOriginLocation, $scope.showError);
    } else {
      $scope.error = "Geolocation is not supported by this browser.";
    }
  };

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

  $scope.$watch('fromChoice', function(n) {
      if (n) {
        planService.from = n;
        $scope.ready = false;
      }
    }
  );

  $scope.$watch('toChoice', function(n) {
      if (n) {
        planService.to = n;
        $scope.ready = false;
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
        $scope.ready = true;
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
      $scope.ready = true;
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

app.directive('date', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, ngModelController) {

            ngModelController.$parsers.push(function(value) {
                return new Date(value).getTime();
            });

            ngModelController.$formatters.push(function(value) {
                return moment(value).format('MM/DD/YYYY');
            });
        }
    };
});

angular.module('applyMyRideApp').service('Map', ['$q', '$window', function($q, $window) {

    var google = $window.google;

    this.init = function() {
        var options = {
            // center: new google.maps.LatLng(40.7127837, -74.00594130000002),
            center: new google.maps.LatLng(39.9647747,-76.7291728),
            zoom: 13,
            disableDefaultUI: false
        };
        this.map = new google.maps.Map(
            document.getElementById('map'), options
        );
        this.places = new google.maps.places.PlacesService(this.map);
        this.infoWindows = [];
    };

    this.search = function(str) {
        var d = $q.defer();
        this.places.textSearch({query: str,
          location: new google.maps.LatLng(39.9647747,-76.7291728),
          radius: 5000}, function(results, status) {
            if (status === 'OK') {
                d.resolve(results);
            }
            else
              {
                d.reject(status);
              }
        });
        return d.promise;
    };

    this.addMarker = function(res) {
        // if(this.marker) this.marker.setMap(null);
        // this.marker = new google.maps.Marker({
        //     map: this.map,
        //     position: res.geometry.location,
        //     animation: google.maps.Animation.DROP
        // });
        for (var i = 0; i < this.infoWindows.length; i++) {
          this.infoWindows[i].close();
        }
        this.infoWindows = [];
        var max = (res.length > 5 ? 5 : res.length);
        var b = new google.maps.LatLngBounds();
        for (i = 0; i < max; i++) {
          var r = res[i];
          // if(this.infoWindow) this.infoWindow.close();
          var contentString = '' + r.name + ' <button class="btn btn-primary btn-xs" ng-click="console.log(\'click\');"><i class="fa fa-check"></i></button>';
          this.infoWindows[i] = new google.maps.InfoWindow({content: contentString, position: r.geometry.location});
          this.infoWindows[i].open(this.map);
          if (b.isEmpty()) {
            b = new google.maps.LatLngBounds(r.geometry.location, r.geometry.location);
          } else {
            b = b.union(new google.maps.LatLngBounds(r.geometry.location, r.geometry.location));
          }
          console.log(b.toString());
        }
        // this.map.setCenter(res[0].geometry.location);
        console.log(b);
        this.map.panToBounds(b);
    };

}]);

angular.module('applyMyRideApp').controller('NewPlaceController', ['$scope', '$window', 'Map', function($scope, $window, Map) {

    $scope.place = {};

    $scope.search = function() {
        $scope.apiError = false;
        Map.search($scope.searchPlace)
        .then(
            function(res) { // success
                Map.addMarker(res);
                // $scope.place.name = res.name;
                // $scope.place.lat = res.geometry.location.lat();
                // $scope.place.lng = res.geometry.location.lng();
            },
            function(status) { // error
                $scope.apiError = true;
                $scope.apiStatus = status;
            }
        );
    };

    $scope.send = function() {
        $window.alert($scope.place.name + ' : ' + $scope.place.lat + ', ' + $scope.place.lng);
    };

    Map.init();
}]);
