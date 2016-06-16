'use strict';

var app = angular.module('applyMyRideApp');

app.directive('csTimeInput', function() {
    var unwatch=false;
    return {
        restrict: "E",
        templateUrl: "views/cs-time-input.html",
        link: function(scope, element, attrs){ //, ngModelController) {
            scope.hour = '8';
            scope.minute = '00';
            scope.isAM = true;

            //update the displayed time when from Moment updates
            scope.$parent.$watch('fromMoment', function( newStartTime ){
                if(unwatch || !newStartTime || !newStartTime._isAMomentObject ){ unwatch=false; return; }
                scope.hour = newStartTime.format('h');
                scope.minute = newStartTime.format('mm');
                scope.isAM = ('am' === newStartTime.format('a'));
                console.log('startTime', newStartTime)
            });

            scope.updateTime = function() {
                var hour, minute;
                unwatch = true;
                setTimeout(function(){unwatch = false;}, 200);
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
                scope.$parent.fromMoment = scope.$parent.fromMoment.clone().hour(hour).minute(minute);
            }
            //end updateTime
        }
    };
});
