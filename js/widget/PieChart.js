/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle
 */



(function() {

    window.PieChart = function(bgColor){

        var _bgColor = bgColor || "#FFFFFF";

        this.render = function(canvas, cards){
            if(!canvas || !cards || !cards.length){
                console.log("PieChart.render() skipping, invalid parameters", cards, canvas);
                return;
            }
            //console.log("PieChart render()", cards.length, canvas.width, canvas.height);
            var context = canvas.getContext("2d");
            //context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = _bgColor;
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.save();
            context.lineWidth = 3;

            var i, data, radian1, radian2, x1, y1, rgb,
                center = Math.round(canvas.width * .5),
                innerRadius = center * .05, reducedRadius = center * .95, innerRadian, innerX, innerY;
            for(i=0; i<cards.length ; i++){
                context.beginPath();
                data = cards[i];
                if(!data.themeColorLight){
                    rgb = MathUtil.hexToRgb(data.themeColor);
                    data.themeColorLight = "rgba(" + rgb.r + " ," + rgb.g + " ," + rgb.b + ", .3)";
                }
                if(data.visited){
                    context.fillStyle = data.storyReadComplete ? data.themeColor : data.themeColorLight;
                    context.strokeStyle = "#FFFFFF";
                }else{
                    context.fillStyle = "#FFFFFF";
                    context.strokeStyle = data.themeColorLight;
                }

                radian1 = i / cards.length * MathUtil.PI2;
                radian2 = (i + 1) / cards.length * MathUtil.PI2;
                innerRadian = radian1 + (radian2 - radian1) * .5;
                innerX = center + Math.cos(innerRadian) * innerRadius;
                innerY = center + Math.sin(innerRadian) * innerRadius;
                context.moveTo(innerX, innerY);
                x1 = innerX + Math.cos(radian1) * reducedRadius;
                y1 = innerY + Math.sin(radian1) * reducedRadius;
                context.lineTo(x1, y1);
                context.arc(innerX, innerY, reducedRadius, radian1, radian2);
                context.closePath();
                context.fill();
                context.stroke();
            }
            context.restore();
        };

    };
}());