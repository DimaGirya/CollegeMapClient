var app = angular.module("map",[]);
app.controller("mapController",function ($scope,$http) {
    $scope.mapData = null;
    $scope.classes = null;
    $scope.rooms = null;
    $scope.readyToSendClassStatusUpdate = false;
    $scope.serverStr = "http://localhost:3000";
    $scope.inputFrom = "";
    $scope.inputTo = "";
    $scope.message = "";
    $scope.classToReport = {
        status:"",
        name:"",
        id :-1
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
        if($scope.readyToSendClassStatusUpdate) {
            $http.get($scope.serverStr + "/setStatusRoom/" + $scope.classToReport.id + "/" + $scope.classToReport.status).success(function (data) {
                ///room status update done
                $scope.message = data[0].message;
                console.log($scope.message);
                $scope.refreshMapData();
            });
        }else{
            console.log("not ready to send");
        }
    };
    $scope.sendFindPatchRequest = function(){   //todo
        $http.get( $scope.serverStr+"/getPath/"+$scope.inputFrom+"/"+$scope.inputTo).success(function () {
           console.log(data); 
        });
        $scope.inputFrom = "";
        $scope.inputTo = "";
    };
    $scope.refreshMapData();
});