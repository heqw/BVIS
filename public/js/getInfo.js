var stationInfo;
var tripInfo;
var weatherInfo;
//var dayTripInfo;
getStationInformation(); 
getTripInformation();
getWeatherInformation();
//getdayTripInfo();
// console.log(stationInfo);
function getStationInformation() {

    $.ajax({
        url: "http://localhost:3000/sInfo",
        dataType: 'json',
        //crossDomain: false,
        //data: {},
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function () { },
        success: function (sInfo, textStatus) {
            // console.log(sInfo);
            handlesInfo(sInfo);
        },
        complete: function () { },
        error: function () {  }
    });
}

function handlesInfo(sinfo){
    stationInfo = sinfo; 
    // console.log(stationInfo);
}

function getTripInformation(){
    $.ajax({
        url: "http://localhost:3000/tInfo",
        dataType: 'json',
        //crossDomain: false,
        //data: {},
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function () { },
        success: function (tInfo, textStatus) {
            tripInfo = tInfo;
        },
        complete: function () { },
        error: function () { }
    });
}


function getWeatherInformation(){
    $.ajax({
        url: "http://localhost:3000/wInfo",
        dataType: 'json',
        //crossDomain: false,
        //data: {},
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function () { },
        success: function (wInfo, textStatus) {
            weatherInfo = wInfo;
        },
        complete: function () { },
        error: function () { }
    });
}


function getdayTripInfo() {


}