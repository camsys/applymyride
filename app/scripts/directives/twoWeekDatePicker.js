'use strict';

var app = angular.module('applyMyRideApp');

app.directive('twoWeekDatePicker', function() {
    return {
        restrict: "E",
        templateUrl: "views/two-week-date-picker.html",
        scope: {
            selected: "="
        },
        link: function(scope) {
            scope.selected = _removeTime(scope.selected || moment());
            var month = scope.selected.clone();
            var start = scope.selected.clone();

            _removeTime(start);
            _buildTwoWeeks(scope, start, month);

            scope.select = function(day) {
                scope.selected = day.date.clone();
            };

            scope.next = function() {
                var next = month.clone();
                _removeTime(next.month(next.month()+1).date(1));
                month.month(month.month()+1);
                _buildMonth(scope, next, month);
            };

            scope.previous = function() {
                var previous = month.clone();
                _removeTime(previous.month(previous.month()-1).date(1));
                month.month(month.month()-1);
                _buildMonth(scope, previous, month);
            };
        }
    };

    function _removeTime(date) {
        return date.hour(0).minute(0).second(0).millisecond(0);
    }

    function _buildTwoWeeks(scope, start, month) {
        var date, weeksToShow, i, monthI;
        scope.months = [{
                name: scope.selected.clone(),
                weeks: []
                }];
        monthI = 0;
        scope.weeks = [];
        date = start.clone();
        date.weekday(0);
        //show 3 weeks, unless it's sunday then show 2
        weeksToShow = (0 == start.day() ) ? 2 : 3;
        for(i=0; i < weeksToShow; i+=1){
            scope.months[monthI].weeks.push({ days: _buildWeek(date.clone(), month) });
            date.add(1, "w");
            if(date.month() !== month.month() ){
                scope.months.push({
                    name: date.clone(),
                    weeks: []
                });
                //clone to first day of month
                month = date.clone().date(1);
                monthI +=1;
                //if the first falls on a sunday, no extra rows
                if(1 !== date.date()){
                    //redraw this week
                    date.add(-1, "w");
                    date.day(0);
                    scope.months[monthI].weeks.push({ days: _buildWeek(date.clone(), month) });
                    date.add(1, "w");
                }
            }
        }
    }

    function _buildWeek(date, month) {
        var days = [];
        for (var i = 0; i < 7; i++) {
            days.push({
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                date: date.clone()
            });
            date = date.clone();
            date.add(1, "d");
        }
        return days;
    }
});
