'use strict';

angular.module('applyMyRideApp')
  .controller('PlanController', ['$scope', '$location', '$routeParams',
    function($scope, $location, $routeParams) {
    }
  ]);

angular.module('applyMyRideApp').service('Map', ['$q', function($q) {
    
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
        this.infoWindows = [];
    }
    
    this.search = function(str) {
        var d = $q.defer();
        this.places.textSearch({query: str,
          location: new google.maps.LatLng(39.9647747,-76.7291728),
          radius: 5000}, function(results, status) {
            if (status == 'OK') {
                d.resolve(results);
            }
            else d.reject(status);
        });
        return d.promise;
    }
    
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
        for (var i = 0; i < max; i++) {
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
    }
    
}]);

angular.module('applyMyRideApp').controller('NewPlaceController', ['$scope', 'Map', function($scope, Map) {
    
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
    }
    
    $scope.send = function() {
        alert($scope.place.name + ' : ' + $scope.place.lat + ', ' + $scope.place.lng);    
    }
    
    Map.init();
}]);
