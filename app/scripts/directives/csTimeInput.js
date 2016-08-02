'use strict';

var app = angular.module('applyMyRideApp');

app.directive('csTimeInput', function() {
    var unwatch=false;
    return {
        restrict: "E",
        templateUrl: "views/cs-time-input.html",
        link: function(scope, element, attrs){
            scope.hour = '8';
            scope.minute = '00';
            scope.isAM = true;
            var lastVal = {hour: scope.hour, minute: scope.minute};

            //update the displayed time when from Moment updates
            scope.$parent.$watch('fromMoment', function( newStartTime ){
                if(unwatch || !newStartTime || !newStartTime._isAMomentObject ){ unwatch=false; return; }
                //setup the local vars when fromMoment changes
                scope.hour = newStartTime.format('h');
                scope.minute = newStartTime.format('mm');
                scope.isAM = ('am' === newStartTime.format('a'));
            });

            function validHour(){
                var hour = parseInt(scope.hour);
                //ok if hour is '', or between 1 and 12. reset if out of range
                if(scope.hour == ''){
                    return false;
                }
                if(hour < 1 || hour > 12 || isNaN(hour) ){
                    scope.hour = lastVal.hour;
                    return false;
                }
                scope.hour = ''+hour;
                return true;
            }
            function validMinute(){
                var minute = parseInt(scope.minute);
                //ok if minute is '', or between 0 and 59. reset if out of range
                if(scope.minute == ''){ 
                    return false;
                }
                if(minute < 0 || minute > 59 || isNaN(minute) ){
                    scope.minute = lastVal.minute;
                    return false;
                }
                scope.minute = '' + scope.minute;
                //handle leading zeros
                if( scope.minute.substr(0,1) == '0' && scope.minute.length > 1){
                    if(scope.minute == '00'){ return; }
                    scope.minute = '0'+minute;
                    return true;
                }
                scope.minute = ''+minute;
                return true;
            }

            scope.updateTime = function(updatingElement) {
                var from, hour, minute;
                //validate the time
                if(updatingElement === 'hour'){
                    if( !validHour() ){
                        return;
                    }
                }
                else if(updatingElement === 'minute'){
                    if( !validMinute() ){
                        return;
                    }
                }
                else if(updatingElement === 'ampm'){
                    //nothing
                }

                from = scope.$parent.fromMoment.clone();
                hour = parseInt(scope.hour);
                minute = parseInt(scope.minute);

                //if it's 12AM, set hour to 0. If it's PM, add 12 to hour (unless it's 12PM, then do nothing)
                if(true === scope.isAM){
                    if(hour == 12){
                        hour = 0;
                    }
                }else{
                    if(hour != 12){
                        hour += 12;
                    }
                }

                //finally, update the time
                from.hour(hour).minute(minute);
                if(hour > -1 && minute > -1){
                    //flag for above fromMoment watch to ignore this value change
                    unwatch = true;
                    setTimeout(function(){unwatch = false;}, 200);
                    scope.$parent.fromMoment = from;
                }else{
                    scope.$parent.showNext = false;
                }

                // if the hour was updated, and the number is greater than 1, focus on the minute input
                if(updatingElement === 'hour' && scope.hour > 1){
                    setTimeout(function(){
                        $('.cs-time-input input.cs-minute').focus();
                        $('.cs-time-input input.cs-minute').click();
                    }, 1);
                }
            }
            
            element[0].addEventListener("keydown", function(e)
            {
                var lvIndex = e.srcElement.classList.contains('cs-hour') ? 'hour' : 'minute';
                lastVal[lvIndex] = e.srcElement.value;
            });

        }
    };
});
