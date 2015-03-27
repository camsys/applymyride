'use strict';

var app = angular.module('applyMyRideApp');

app.directive('csTime', function() {

    return {
        templateUrl: '/views/time-grid.html',
        restrict: 'E',
        scope: {
            selected: '=stime'
        },
        link: function(scope) {
            scope.times = [
                {display: '1:00', isSelected: false},
                {display: '1:30', isSelected: true},
                {display: '2:00', isSelected: false},
                {display: '2:30', isSelected: false},
                {display: '3:00', isSelected: false},
                {display: '3:30', isSelected: false},
                {display: '4:00', isSelected: false},
                {display: '4:30', isSelected: false},
                {display: '5:00', isSelected: false},
                {display: '5:30', isSelected: false},
                {display: '6:00', isSelected: false},
                {display: '6:30', isSelected: false},
                {display: '7:00', isSelected: false},
                {display: '7:30', isSelected: false},
                {display: '8:00', isSelected: false},
                {display: '8:30', isSelected: false},
                {display: '9:00', isSelected: false},
                {display: '9:30', isSelected: false},
                {display: '10:00', isSelected: false},
                {display: '10:30', isSelected: false},
                {display: '11:00', isSelected: false},
                {display: '11:30', isSelected: false},
                {display: '12:00', isSelected: false},
                {display: '12:30', isSelected: false}
            ];

            scope.meridians = [
                {display: 'am', isSelected: false},
                {display: 'pm', isSelected: true},
            ];

            scope.timeSelected = scope.times[1];
            scope.merSelected = scope.meridians[1];

            scope.selected = scope.timeSelected.display + ' ' + scope.merSelected.display;

            scope.select = function(time) {
                scope.timeSelected = time;
                scope.selected = scope.timeSelected.display + ' ' + scope.merSelected.display;
                scope.times.forEach(function(entry) {
                    entry.isSelected = false;
                });
                time.isSelected = true;
            };

            scope.selectMeridian = function(mer) {
                scope.merSelected = mer;
                scope.selected = scope.timeSelected.display + ' ' + scope.merSelected.display;
                scope.meridians.forEach(function(entry) {
                    entry.isSelected = false;
                });
                mer.isSelected = true;
            };

        }
    };
    
});
