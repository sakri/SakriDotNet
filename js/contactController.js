/**
 * Created by sakri on 12-8-14.
 */

function contactController($scope, $http, analyticsService) {

    $scope.mailSent = false;
    $scope.sender = "";
    $scope.message = "Hi Sakri,";

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function showEmailErrorMessage(message){
        alert(message);//yes yes, not the most creative solution
    }

    $scope.submitForm = function() {
        //console.log("posting data....", JSON.stringify($scope.data));
        if(!validateEmail($scope.sender)){
            showEmailErrorMessage("Your email doesn't seem to be valid, double check?");
            return;
        }
        if($scope.message=="Hi Sakri," || $scope.message==""){
            showEmailErrorMessage("Would be nice if you actually left a message...");
            return;
        }
        var sender =  encodeURIComponent($scope.sender);
        var message = encodeURIComponent($scope.message);
        var params = "sender="+sender+"&message="+message;
        $http.defaults.headers.post = { 'Content-Type' : "application/x-www-form-urlencoded" };
        $http.post('http://www.sakri.net/sendMail.php', params).success(successHandler).error(errorHandler);
        analyticsService.logContactMessage();
    };

    function successHandler(data, status){
        //console.log("email success!");
        $scope.message = "Hi Sakri,";
        $scope.mailSent = true;
    }

    function errorHandler(data, status){
        console.log("not sure why, but I always get an error!");
        $scope.message = "Hi Sakri,";
        $scope.mailSent = true;
    }

}
