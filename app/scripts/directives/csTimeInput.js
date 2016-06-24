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

            //update the displayed time when from Moment updates
            scope.$parent.$watch('fromMoment', function( newStartTime ){
                if(unwatch || !newStartTime || !newStartTime._isAMomentObject ){ unwatch=false; return; }
                //setup the local vars when fromMoment changes
                scope.hour = newStartTime.format('h');
                scope.minute = newStartTime.format('mm');
                scope.isAM = ('am' === newStartTime.format('a'));
            });

            scope.updateTime = function() {
                var from, hour, minute;
                unwatch = true;
                from = scope.$parent.fromMoment.clone();
                setTimeout(function(){unwatch = false;}, 200);
                //limit minute to less than 60
                hour = parseInt(scope.hour);
                minute = parseInt(scope.minute);
                hour = (true === scope.isAM)
                      ? hour
                      : (12 + hour);
                //12AM become 24, make it 0
                hour = (hour == 24) ? 0 : hour;
                from.hour(hour).minute(minute);
                if(hour > -1 && minute > -1){
                    scope.$parent.fromMoment = from;
                }else{
                    scope.$parent.showNext = false;
                }
            }
            
            var key = {left: 37, up: 38, right: 39, down: 40 , enter: 13, esc: 27, tab: 9, backspace:8};
            var lastVal = {};
            element[0].addEventListener("keydown", function(e)
            {
                var lvIndex = e.srcElement.classList.contains('cs-hour') ? 'hour' : 'minute';
                lastVal[lvIndex] = e.srcElement.value;
            });
            element[0].addEventListener("keyup", function(e)
            {
                var keycode = e.keyCode || e.which;
                //check if hour field, otherwise is minute (return if it's not minute)
                var isHour = e.srcElement.classList.contains('cs-hour');
                if(!isHour && !e.srcElement.classList.contains('cs-minute') ){ return; }
                var lvIndex = isHour ? 'hour' : 'minute';
                var resetField = function(){ e.srcElement.value = parseInt(lastVal[lvIndex].substr(0,2) || 0) || '0'; }
                var value = parseInt(e.srcElement.value) > -1 ? parseInt(e.srcElement.value) : '';
                if(e.srcElement.value != value){
                    e.srcElement.value = value;
                    scope[lvIndex] = value;
                }

                if( e.key > -1 && e.key < 10 && e.key !== ' ' ){
                    //range check the input with the key
                    if(isHour){
                        var hour = parseInt(e.srcElement.value);
                        if( 12 < hour){
                            resetField();
                            return;
                        }else if(hour > 1){
                            setTimeout(function(){
                                $('.cs-time-input input.cs-minute').focus();
                                $('.cs-time-input input.cs-minute').click();
                            }, 1);
                        }
                    }else{
                        if( 60 < parseInt(e.srcElement.value)){
                            resetField();
                            return;
                        }
                    }
                }else{
                    //only allow numbers
                    if(1  == e.key.length ){
                        resetField();
                        return;
                    }
                }
            }, true)

            function getSelectionText() {
                var text = "";
                if (window.getSelection) {
                    text = window.getSelection().toString();
                } else if (document.selection && document.selection.type != "Control") {
                    text = document.selection.createRange().text;
                }
                return text;
            }
            //end updateTime
        }
    };
});
