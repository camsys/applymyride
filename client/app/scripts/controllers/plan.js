'use strict';

angular.module('clientApp')
  .controller('PlanController', ['$scope', '$location', '$routeParams',
    function($scope, $location, $routeParams) {
    }
  ]);

  var app = angular.module('myApp', []);

angular.module('clientApp').service('Map', function($q) {
    
    this.init = function() {
        var options = {
            // center: new google.maps.LatLng(40.7127837, -74.00594130000002),
            center: new google.maps.LatLng(39.9647747,-76.7291728),
            zoom: 13,
            disableDefaultUI: false    
        }
        this.map = new google.maps.Map(
            document.getElementById("map"), options
        );
        this.places = new google.maps.places.PlacesService(this.map);
    }
    
    this.search = function(str) {
        var d = $q.defer();
        this.places.textSearch({query: str,
          location: new google.maps.LatLng(39.9647747,-76.7291728),
          radius: 10000}, function(results, status) {
            if (status == 'OK') {
                d.resolve(results[0]);
            }
            else d.reject(status);
        });
        return d.promise;
    }
    
    this.addMarker = function(res) {
        if(this.marker) this.marker.setMap(null);
        this.marker = new google.maps.Marker({
            map: this.map,
            position: res.geometry.location,
            animation: google.maps.Animation.DROP
        });
        this.map.setCenter(res.geometry.location);
    }
    
});

angular.module('clientApp').controller('newPlaceCtrl', function($scope, Map) {
    
    $scope.place = {};
    
    $scope.search = function() {
        $scope.apiError = false;
        Map.search($scope.searchPlace)
        .then(
            function(res) { // success
                Map.addMarker(res);
                $scope.place.name = res.name;
                $scope.place.lat = res.geometry.location.lat();
                $scope.place.lng = res.geometry.location.lng();
            },
            function(status) { // error
                $scope.apiError = true;
                $scope.apiStatus = status;
            }
        );
    }
    
    $scope.send = function() {
        alert($scope.place.name + ' : ' + $scope.place.lat + ', ' + $scope.place.lng);    
    }
    
    Map.init();
});
