/**
 * Created by sakri on 23-6-14.
 */

function navigationController($rootScope, $scope, $location, colorService){

    var canvas, context, activeItem, rolloverTarget;

    var menuItemNames = ["home", "portfolio", "cv", "contact", "blog"];//TODO DEFINE OUTSIDE, IN A SERVICE?
    var menuItems = [];

    this.initialize = function(element) {
        canvas = element[0];
        context = canvas.getContext("2d");

        canvas.addEventListener("touchstart", startSwipeHandler, false);
        canvas.addEventListener("touchend", endSwipeHandler, false);
        canvas.addEventListener("touchleave", swipeLeaveHandler, false);
        canvas.addEventListener("touchmove", swipeMoveHandler, false);

        canvas.addEventListener("mousedown", mouseDownHandler, false);
        canvas.addEventListener("mouseup", mouseUpHandler, false);
        canvas.addEventListener("mousemove", mouseMoveHandler, false);

    }

    $scope.$on("resize-start", function(){
        context.clearRect(0,0,canvas.width,canvas.height);
        rolloverTarget = undefined;
    });

    $scope.$on("commit-resize", function(event , containerRect){
        canvas.width = Math.ceil(containerRect.width);
        context.font = "bold 24px sans-serif";
        context.textBaseline = "top";
        createMenuItems();
        renderBG();
        if(activeMenuItemName){
            activateMenuItem();
            render();
        }
    });

    var activeMenuItemName;

    $scope.$on("navigate", function(event, target){
        activeMenuItemName = target;
        //console.log("navControl on navigate :", activeMenuItemName);
        renderBG();
        rolloverTarget = undefined;
        if(menuItems.length && activeMenuItemName){
            activateMenuItem();
            render();
        }
    });

    function activateMenuItem(){
        for(var i=0; i<menuItems.length; i++){
            var item = menuItems[i];
            if(item.name == activeMenuItemName){
                activeItem = item;
                //console.log("activateMenuItem()", activeItem);
                return;
            }
        }
    }

    var spacer = 18;
    var itemBGHeight = 50;
    var highLightX, highLightWidth;

    function createMenuItems(){
        //console.log("navigationController.createMenuItems()");
        menuItems = [];
        var totalWidth = 0;
        for(var i=0; i<menuItemNames.length; i++){
            menuItems[i]={name:menuItemNames[i], width:context.measureText(menuItemNames[i].toUpperCase()).width};//TODO use TextUtil or so to get real measurements
            totalWidth += menuItems[i].width;
        }
        totalWidth += (menuItems.length-1)*spacer;
        var x = Math.floor(canvas.width/2 - totalWidth/2);
        for(i=0; i<menuItems.length; i++){
            menuItems[i].x = x;
            x += menuItems[i].width + spacer;
        }
    }

    //TODO : set rect to only render relevant bits

    function renderBG(){
        context.fillStyle = colorService.LIGHT;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    function renderActiveItemBG(){
        context.fillStyle = colorService.WHITE;
        context.fillRect(activeItem.x - spacer/2, 0, activeItem.width + spacer, itemBGHeight);
    }

    function renderHighLight(item){
        context.fillStyle = colorService.DARK;
        context.fillRect(item.x - spacer/2, 0, item.width + spacer, itemBGHeight);
    }

    function render(){
        renderActiveItemBG();
        context.fillStyle = colorService.DARK;
        var i, item;
        for(i=0; i<menuItems.length; i++){
            item = menuItems[i];
            if(item!=rolloverTarget){
                context.fillText(item.name.toUpperCase(), item.x, 10);
            }
        }
        if(rolloverTarget){
            context.fillStyle = colorService.WHITE;
            context.fillText(rolloverTarget.name.toUpperCase(), rolloverTarget.x, 10);
        }
    }

    function updateRollover(){
        renderBG();
        renderHighLight(rolloverTarget);
        render();
    }

    function mouseOverItem(item){
        return mousePosition.x>item.x && mousePosition.x<item.x+item.width;
    }

    function mouseOverInactiveItem(){
        for(i=0; i<menuItems.length; i++){
            if(mouseOverItem(menuItems[i]) && menuItems[i]!=activeItem){
                return menuItems[i];
            }
        }
        return undefined;
    }

    //===========================================
    //==============::GESTURES::=================
    //===========================================

    function mouseDownHandler(event){
        //do something pretty?
    }
    function mouseUpHandler(event){
        handleGestureUp(event);
    }
    function mouseMoveHandler(event){
        gestureMoveHandler(event);
    }

    var swiping = false;
    function startSwipeHandler(event){
        swiping = true;
    }

    function swipeLeaveHandler(event){
        swiping = false;
        event.preventDefault();
    }

    function swipeMoveHandler(event){
        if(swiping){
            gestureMoveHandler(event);
        }
        event.preventDefault();
    }

    function endSwipeHandler(event){
        event.preventDefault();
        if(!swiping){
            return;
        }
        handleGestureUp(event);
    }

    function handleGestureUp(event){
        setMousePosition(event);
        var item = mouseOverInactiveItem();
        if(item){
            $scope.$evalAsync(function() {
                $location.path(item.name);
            });
        }
        rolloverTarget = undefined;
    }

    function gestureMoveHandler(event){
        setMousePosition(event);
        if(mousePosition.x<0 || mousePosition.x>canvas.width || mousePosition.y<0 || mousePosition.y>canvas.height){
            if(rolloverTarget!=undefined){
                rolloverTarget = undefined;
                renderBG();
                render();
            }
            return;
        }
        rolloverTarget = mouseOverInactiveItem();
        if(rolloverTarget!=undefined){
            updateRollover();
        }else{
            renderBG();
            render();
        }
    }

    var mousePosition = {};
    function setMousePosition(event) {
        var rect = canvas.getBoundingClientRect();
        if(event.touches && event.touches.length>0){
            mousePosition.x = event.touches[0].clientX - rect.left;
            mousePosition.y = event.touches[0].clientY - rect.top;
        }else{
            mousePosition.x = event.clientX - rect.left;
            mousePosition.y = event.clientY - rect.top;
        }
        return mousePosition;
    }

}
