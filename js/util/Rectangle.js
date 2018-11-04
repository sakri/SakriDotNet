//TODO: Belongs in geom, not util
(function (){

    window.Rectangle = function(x, y, width, height) {

        this.update = function(x, y, width, height){
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        };

        this.inflate = function(value){
            this.update(this.x - value, this.y - value, this.width + value * 2, this.height + value * 2);
        };

        this.updateToRect = function(rect){
            this.update(rect.x, rect.y, rect.width, rect.height);
        };

        this.right = function(){
            return this.x + this.width;
        };

        this.bottom = function(){
            return this.y + this.height;
        };

        this.centerX = function(){
            return this.x + this.width / 2;
        };

        this.centerY = function(){
            return this.y + this.height / 2;
        };

        this.containsPoint = function(x, y){
            return x >= this.x && y >= this.y && x <= this.right() && y <= this.bottom();
        };

        this.containsRect = function(rect){
            return this.containsPoint(rect.x, rect.y) && this.containsPoint(rect.right(), rect.bottom());
        };

        this.getArea = function(){
            return this.width * this.height;
        };

        this.isLandscape = function(){
            return this.width > this.height;
        };

        this.isPortrait = function(){
            return !this.isLandscape();
        };

        this.isSquareish = function(maxDiffNormal){
            if(this.isLandscape()){
                return this.width / this.height - 1 < maxDiffNormal;
            }
            return this.height / this.width - 1 < maxDiffNormal;
        }

        this.smallerSide = function(){
            return Math.min(this.width, this.height);
        };

        this.biggerSide = function(){
            return Math.max(this.width, this.height);
        };

        this.clone = function(){
            return new Rectangle(this.x, this.y, this.width, this.height);
        };

        this.equals = function(rect){
            return this.x == rect.x && this.y == rect.y && this.width == rect.width && this.height == rect.height;
        };

        this.round = function(){
            this.update(Math.round(this.x), Math.round(this.y), Math.round(this.width), Math.round(this.height))
        };

        this.isSet = function(){
            //console.log("Rectangle.isSet()", isNaN(this.x) , isNaN(this.y) , isNaN(this.width) , isNaN(this.height));
            return !(isNaN(this.x) || isNaN(this.y) || isNaN(this.width) || isNaN(this.height));
        };

        this.getNumberOfSetItems = function(){
            var setItems = isNaN(this.x) ? 0 : 1;
            setItems += (isNaN(this.y) ? 0 : 1);
            setItems += (isNaN(this.width) ? 0 : 1);
            return setItems + (isNaN(this.height) ? 0 : 1);
        };

        this.replaceNullValuesFrom = function(source){
            this.x = isNaN(this.x) ? source.x : this.x;
            this.y = isNaN(this.y) ? source.y : this.y;
            this.width = isNaN(this.width) ? source.width : this.width;
            this.height = isNaN(this.height) ? source.height : this.height;
        };

        this.toString = function(){
            return "Rectangle{x:"+this.x+" , y:"+this.y+" , width:"+this.width+" , height:"+this.height+"}";
        };

        this.update(isNaN(x) ? 0 : x, isNaN(y) ? 0 : y, isNaN(width) ? 0 : width, isNaN(height) ? 0 : height);

    };


}());