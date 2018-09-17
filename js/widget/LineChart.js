/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle
 */

(function() {

    window.LineChart = function(bgColor){

        var _bgColor = bgColor || "#FFFFFF";

        this.lineColor = appConfig.themeColor;//make into parameter
        this.hMargin = .1;
        this.vMargin = .05;
        this.lineWidth = 2;

        var _chartBounds = new Rectangle();

        this.render = function(canvas, values){
            if(!canvas || !values || !values.length){
                console.log("LineChart.render() skipping, invalid parameters");
                return;
            }

            var context = canvas.getContext("2d");
            _chartBounds.x = Math.floor(canvas.width * this.hMargin);
            _chartBounds.y = Math.floor(canvas.height * this.vMargin);
            _chartBounds.width = Math.floor(canvas.width - _chartBounds.x * 2);
            _chartBounds.height = Math.floor(canvas.height - _chartBounds.y * 5);

            var barWidth = Math.floor(_chartBounds.width / (values.length - 1));

            //clear canvas
            context.fillStyle = _bgColor;
            context.fillRect(0, 0, canvas.width, canvas.height);


            //render lines
            context.save();
            context.beginPath();
            context.lineWidth = this.lineWidth;
            context.strokeStyle = this.lineColor;

            var dataPointRadius = 4;//TODO: This shouldn't be hardcoded!!! BELOW NEITHER!!!
            var pointBounds = new Rectangle(_chartBounds.x + 4, _chartBounds.y + 10, _chartBounds.width - 8, _chartBounds.height - 22);
            var barWidthReduced = pointBounds.width / (values.length-1);
            var maxValue = Math.max(Math.max.apply(null, values), 1), i;
            var x = pointBounds.x;
            var y =  pointBounds.bottom() - pointBounds.height * (values[0] / maxValue);
            var circleGraphicPositions = [];
            circleGraphicPositions.push(x, y);
            context.moveTo(x, y);
            for(i=1; i<values.length; i++){
                x = pointBounds.x + barWidthReduced * i;
                y =  pointBounds.bottom() - pointBounds.height * (values[i] / maxValue);
                circleGraphicPositions.push(x, y);
                context.lineTo(x, y);
            }
            context.stroke();

            //render circles on top of lines
            context.beginPath();
            context.fillStyle = "#FFFFFF";

            for(i=0; i<circleGraphicPositions.length; i+=2){
                x = circleGraphicPositions[i];
                y = circleGraphicPositions[i + 1];
                context.moveTo(x + dataPointRadius, y);
                context.arc(x, y, dataPointRadius, 0, MathUtil.PI2);
            }
            context.fill();
            context.stroke();
            context.restore();

            context.fillStyle = appConfig.themeColor;
            context.font="14px Helvetica,Arial,sans-serif";//TODO: This cannot be hardcoded!!!!
            context.textBaseline = "top";//top, bottom, middle, alphabetic, hanging
            context.fillText(String(maxValue), Math.round(canvas.width * .92) , Math.round(canvas.height * this.vMargin));
            //context.textBaseline = "bottom";//top, bottom, middle, alphabetic, hanging
            context.fillText("0", Math.round(canvas.width * .92) , Math.round(canvas.height - canvas.height * (this.vMargin * 3)));
            context.fillText("1 minute ago", _chartBounds.x , Math.round(canvas.height - canvas.height * (this.vMargin * 3)));
        };

    };
}());