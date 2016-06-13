'use strict';

var app = angular.module('applyMyRideApp');

app.directive('csTimeInput', function() {
    return {
        restrict: "E",
        templateUrl: "views/cs-time-input.html",
        scope: {
            startTime: "=startTime",
            class: "=class",
            id: "=id"
        },
        link: function(scope) {
            //startTime is the 
            var startTime = scope.startTime || moment();
            if(true !== startTime._isAMomentObject){
                var testDate = new Date(startTime);
                if( false === isNaN(testDate.getTime()) ){
                  //date is valid, use it
                  startTime = moment( testDate );
                }else{
                  startTime = moment();
                }
            }
            scope.hour = startTime.format('h');
            scope.minute = startTime.format('mm');
            scope.isAM = ('am' === startTime.format('a'));
            scope.startTime = startTime;

            scope.updateTime = function() {
              //update the time with the new AM/PM
              var hour, minute;
              //limit minute to less than 60
              scope.minute = (scope.minute.match(/[0-5]?[0-9]/) || ['0'])[0];
              if(parseInt(scope.minute) > 59){
                if( scope.minute.match(/^0/) && parseInt( scope.minute.substr(1) ) < 59 ){
                  scope.minute = scope.minute.substr(1);
                }else{
                  scope.minute = scope.minute.substr(0, scope.minute.length-1);
                }
              }else{
                if(scope.minute.length > 2 && null !== scope.minute.match(/^0/) ){
                  //trim off the front if the lenght is long and 0 is first char
                  scope.minute = scope.minute.substr(1, 2);
                }else{
                  //limit to two chars
                  scope.minute = scope.minute.substr(0, 2);
                }
              }

              //limit hour to less than 12
              if(parseInt(scope.hour) > 12){
                scope.hour = scope.hour.substr(0, 1);
              }else{
                scope.hour = scope.hour.substr(0, 2);
              }
              hour = parseInt(scope.hour);
              minute = parseInt(scope.minute);
              hour = (true === scope.isAM)
                    ? hour
                    : (12 + hour);
              startTime.hour( hour )
              startTime.minute( minute );
              console.log( startTime.format() );
              scope.startTime = startTime;
            }

            console.log(scope);
        }
    };
});
