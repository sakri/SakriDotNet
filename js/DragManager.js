/**
 * DEPENDENCIES:
 * MathLib
 */


(function() {

    window.DragManager = function() {

        //PUBLIC VARIABLES

        //PRIVATE VARIABLES
        var _dragHistory = [],
            _dragStartTimeStamp = 0,
            _maxDragUpdateDuration = 1000,
            _dragStartPosition = {x:0, y:0}
        ;

        this.startDrag = function (pointer) {
            //console.log("DragManager.startDrag()", pointer.x, pointer.y);
            _dragStartTimeStamp = new Date().getTime();
            _dragHistory.length = 0;
            _dragStartPosition.x = pointer.x;
            _dragStartPosition.y = pointer.y;
            this.updateDrag(pointer);
        };

        this.updateDrag = function (pointer) {
            if (_dragStartTimeStamp == 0) {
                return false;//no dragging going on
            }
            _dragHistory.push(pointer.x, pointer.y, new Date().getTime());//x, y, timestamp
            if (_dragHistory.length >= 15) {
                _dragHistory.splice(0, 3);
            }
            return true;
        };

        this.dragConsideredClick = function () {
            var dist = getTotalYDragDistance();
            var shortDistance = Math.abs(dist) < 5;//arbitrary number
            var shortDuration = (new Date().getTime() - _dragStartTimeStamp) < 300;//arbitrary number
            //console.log("DragManager.dragConsideredClick() dist:", dist, " ,shortDist:", shortDistance, ", shortDuration : ", shortDuration, ", condi:", shortDistance && shortDuration);
            return shortDistance && shortDuration;
        };

        //calculates average distance of moves performed within last second
        this.getYScrollSpeed = function () {
            if (_dragHistory.length < 4) {
                return 0;//need at least 2 moves
            }
            var i, numMoves = 0, total = 0, now = new Date().getTime();
            for (i = 3; i < _dragHistory.length; i += 3) {
                if (now - _dragHistory[i - 1] < 1000) {
                    total += (_dragHistory[i + 1] - _dragHistory[i - 2]);
                    numMoves++;
                }
            }
            return total / numMoves;
        };

        this.getYDragDistance = function () {
            if (_dragHistory.length < 3) {
                return 0;
            }
            var index = _dragHistory.length - 6;//older drag position, each entry is 3 long, so 2 * 3 = 6
            return _dragHistory[index + 4] - _dragHistory[index + 1];
        };

        this.reset = function () {
            _dragStartTimeStamp = 0;
            _dragHistory.length = 0;
        };

        //PRIVATE METHODS

        var getTotalYDragDistance = function () {
            //_dragHistory is in the format : [x, y, timestamp]
            if (_dragHistory.length < 3) {
                return 0;
            }
            return _dragHistory[_dragHistory.length - 2] - _dragStartPosition.y;
        };
    }
}());