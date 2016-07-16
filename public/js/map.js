var app = angular.module("map",[]);
app.controller("mapController",function ($scope,$http) {
    //$scope.serverStr = "http://localhost:3000";  // for work which localhost server
    $scope.serverStr =  "https://mapcollege.herokuapp.com";  // for work which heroku server
    $scope.updateMapInProgress = false;
    $scope.userName = localStorage.getItem("name");
    $scope.message = "";
    $scope.messageToUser = "";
    $scope.messageHeader = "";
    $scope.commentsInput = "";
    $scope.mapData = null;
    $scope.classes = null;
    $scope.rooms = null;
    $scope.readyToSendClassStatusUpdate = false;
    $scope.inputFrom = "";
    $scope.inputTo = "";
    $scope.classToReport = {
        status:"",
        name:"",
        id :-1
    };
    $scope.roomTo = {
        status:"",
        name:"",
        id :-1
    };
    $scope.roomFrom = {
        status:"",
        name:"",
        id :-1
    };
    
    var updateMapToDisplayInProgress = false;
    var updateMapInProgress  = false;
    var waitCount = 0;
    
    $scope.bindIdToRoomName = function (roomObject) {
        var size = $scope.rooms.length;
        for(var i = 0; i <  size; i++){
            if( $scope.rooms[i].name === roomObject.name) {
                roomObject.id =  $scope.rooms[i].id;
                return;
            }
        }
        roomObject.id = -1;
    };


    $scope.bindIdToClassName = function () {
        var size = $scope.classes.length;
        for(var i = 0; i <  size; i++){
            if( $scope.classes[i].name ===   $scope.classToReport.name) {
                $scope.classToReport.id =   $scope.classes[i].id;
                $scope.readyToSendClassStatusUpdate = true;
                return;
            }
        }
        $scope.readyToSendClassStatusUpdate = false;
        $scope.classToReport.id = -1;
    };

    $scope.refreshMapData = function () {
        updateMapToDisplayInProgress = true;
        updateMapInProgress  = true;
        $http.get( $scope.serverStr+"/getMapToDisplay").success(function (data) {
            $scope.mapData = data;
            updateMapToDisplayInProgress = false;
        });
        $http.get( $scope.serverStr+"/getMap").success(function (data) {
            var size = data.length;
            $scope.rooms = [];
            $scope.classes = [];
            for(var i = 0; i < size; i++){
                if(data[i].type == "class" || data[i].type == "office"){
                    $scope.rooms.push(data[i]);

                }
                if(data[i].type == "class"){
                    $scope.classes.push(data[i]);
                }
            }
            updateMapInProgress  = false;
        });
    };

    $scope.sendReportClassRequest = function () {
        $scope.userName = localStorage.getItem("name");
        if($scope.userName === "Guest" ||  $scope.userName === null ||  $scope.userName === undefined){
            messageToUser( "You need to log in to do to this action.","Input error");
            return;
        }
        if($scope.readyToSendClassStatusUpdate) {
            $http.get($scope.serverStr + "/setStatusRoom/" + $scope.classToReport.id + "/" + $scope.classToReport.status).success(function (data) {
                $scope.classToReport = {
                    status:"",
                    name:"",
                    id :-1
                };
                $scope.message = data[0].message;
                messageToUser("Your status has successfully save.","Done");
                $scope.refreshMapData();
            });
        }
        else{
            messageToUser("Your status don't save","Fail");
        }

    };

    $scope.sendFindPatchRequest = function(){
        if($scope.roomTo.id === -1 ||  $scope.roomFrom.id === -1){
            return;
        }
        $scope.refreshMapData();
        findPatchRequest();
    };

    function findPatchRequest() {
        var intervalObject = setTimeout(function () {
            if (!updateMapToDisplayInProgress || !updateMapInProgress) {
                $http.get($scope.serverStr + "/getPath/" + $scope.roomFrom.id + "/" + $scope.roomTo.id).success(function (data) {
                    var count = 0;
                    angular.forEach(data.path, function (hallway) {
                        angular.forEach($scope.mapData, function (row) {
                            angular.forEach(row, function (cell) {
                                count++;
                                if (hallway == cell.place_id) {
                                    cell.status = "inPatch";
                                }
                            });
                        });
                    });
                    $scope.inputFrom = "";
                    $scope.inputTo = "";
                    $scope.roomTo = {
                        status: "",
                        name: "",
                        id: -1
                    };
                    $scope.roomFrom = {
                        status: "",
                        name: "",
                        id: -1
                    }
                });
            }
            else{
                console.log(waitCount);
                waitCount++;
                if(waitCount < 5) { //try 5 attempts
                    findPatchRequest();
                }
                else{
                    messageToUser("Connection error.Try again later", "Connection error");
                }
            }
        },500);
    }

    $scope.onRoomClicked = function (box) {
        if(box.type === "hallway"){
            return;
        }
        $http.get( $scope.serverStr+"/getRoomStatus/"+box.place_id).success(function (data) {
            $scope.roomToShow = data[0];
            if($scope.roomToShow.description === undefined || $scope.roomToShow.description === ""){
                $scope.roomToShow.description = "No description found"
            }
            $("#roomInformation").modal();
        });
    };

    $scope.sendCommentsToServer = function () {
        $scope.userName = localStorage.getItem("name");
        if($scope.userName === "Guest" ||  $scope.userName === null ||  $scope.userName === undefined){
            messageToUser("You need to log in to do to this action.","Input error");
            return;
        }
        if($scope.commentsInput !== undefined && $scope.commentsInput !== ""){
            $http.get($scope.serverStr + "/addComments/" + $scope.roomToShow.id + "/" + $scope.userName + "/"+$scope.commentsInput).success(function (data) {
                messageToUser("Your comment has successfully added.","Done");
                $scope.commentsInput= "";
            });
        }
        else {
            messageToUser("You can't add empty comment.","Input error");
        }
    };

    function messageToUser(message,headerMessage) {
        $scope.messageToUser = message;
        $scope.messageHeader  = headerMessage;
        $("#messageToUser").modal();
    }
    
    $scope.refreshMapData();
});

