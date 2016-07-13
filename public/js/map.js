var app = angular.module("map",[]);
app.controller("mapController",function ($scope,$http) {
    $scope.serverStr = "http://localhost:3000";  // for work which localhost server
    //  $scope.serverStr =  "https://mapcollege.herokuapp.com";  // for work which heroku server
    $scope.mapData = null;
    $scope.classes = null;
    $scope.rooms = null;
    $scope.readyToSendClassStatusUpdate = false;
    $scope.inputFrom = "";
    $scope.inputTo = "";
    $scope.message = "";
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
        $http.get( $scope.serverStr+"/getMapToDisplay").success(function (data) {
            console.log(data);
            $scope.mapData = data;
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
        });
    };
    $scope.sendReportClassRequest = function () {
        console.log("sendReportClassRequest");
        if($scope.readyToSendClassStatusUpdate) {
            $http.get($scope.serverStr + "/setStatusRoom/" + $scope.classToReport.id + "/" + $scope.classToReport.status).success(function (data) {
                ///room status update done
                console.log("sendReportClassRequest done");
                console.log(data);
                $scope.message = data[0].message;
                console.log($scope.message);
                $scope.refreshMapData();
            });
        }else{
            console.log("not ready to send");
        }

    };

    $scope.sendFindPatchRequest = function(){
        if($scope.roomTo.id === -1 ||  $scope.roomFrom.id === -1){
            console.log($scope.roomTo);
            console.log($scope.roomFrom);
            return;
        }
       // $scope.refreshMapData();
        $http.get( $scope.serverStr+"/getPath/"+ $scope.roomFrom.id+"/"+ $scope.roomTo.id).success(function (data) {
            console.log(data);
            var count = 0;
            angular.forEach(data.path,function (hallway) {
                angular.forEach($scope.mapData,function (row) {
                    angular.forEach(row,function (cell) {
                        count++;
                        if(hallway == cell.place_id){
                            cell.status = "inPatch";
                        }
                    });
                });
            });
            console.log(count);
        });
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
    };
    $scope.refreshMapData();
});