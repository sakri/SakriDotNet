/**
 * DEPENDENCIES:
 * utils MathLib, Rectangle, AppData (not good)
 */



(function() {

    window.PieChart = function(bgColor){

        var _bgColor = bgColor || "#FFFFFF";

        //TODO: hardcoded dependency on AppData, move to param
        this.render = function(canvas){
            if(!canvas || !AppData.cards || !AppData.cards.length){
                console.log("PieChart.render() skipping, invalid parameters");
                return;
            }
            var context = canvas.getContext("2d");
            //context.clearRect(0, 0, canvas.width, canvas.height);
            context.fillStyle = _bgColor;
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.save();
            context.lineWidth = 3;

            var i, data, radian1, radian2, x1, y1, rgb,
                center = Math.round(canvas.width * .5),
                innerRadius = center * .05, reducedRadius = center * .95, innerRadian, innerX, innerY;
            for(i=0; i<AppData.cards.length ; i++){
                context.beginPath();
                data = AppData.cards[i];
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

                radian1 = i / AppData.cards.length * MathUtil.PI2;
                radian2 = (i + 1) / AppData.cards.length * MathUtil.PI2;
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