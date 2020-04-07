//mapbox
//var bounds = [[104.57336425, 31.32255387], [104.91016387, 31.59725256]];

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hlbmhvbmdpc3NreSIsImEiOiJjaXlzanRtNGswMDB3MzNvNDh3NzJqNmNnIn0.8LvCg1s5Qb88lwItbSFOzg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',

    //A zoom level determines how much of the world is visible on a map，缩放级别
    zoom: 11.7,
    //Default map center in longitude and latitude.经度 纬度
    center: [-122.319407, 47.630748],
    //pitch in degrees倾斜度
    //pitch: 50
});
// var dayTripInfo;
//console.log(stationInfo);

DrawStation();
function DrawStation() {
    var daytripInfo;

    $.ajax({
        url: "http://localhost:3000/fromStation",
        dataType: 'json',
        //crossDomain: false,
        //data: {},
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function () { },
        success: function (Info, textStatus) {
            daytripInfo = Info; //console.log(dayTripInfo);
        },
        complete: function () { },
        error: function () { }
    });




    $.ajax({
        url: "http://localhost:3000/stationData",
        dataType: 'json',
        //crossDomain: false,
        //data: {},
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function () { },
        //success: function(StrContent)里的这个参数，
        //任意命名的，在这个函数有用到。参数值是在Ajax提交成功后所返回的内容
        success: function (mapInfo, textStatus) {
            //stationInfo=mapInfo;
            drawMap(mapInfo, daytripInfo);
        },
        complete: function () { },
        error: function () { console.log("maperror") }
    });
    //console.log(stationFeatures); console.log(typeof (stationFeatures));

}

function drawMap(station, dayTripInfo) {
    //console.log(station);
    //console.log(typeof(station));
    // stationData = station;


    // 存储单车站id、long、lat
    var stationLongLat = [];
    // 存储from_station_id to_station_id
    var trips = [];
    // 存储O的long lat,D的long lat,绘制路线
    var od = [];
    //给每一个单车数据添加feature
    var stationFeatures = [];

    station.forEach(function (d) {
        stationFeatures.push({
            "type": "Feature",//则该对象必须有属性 geometry，其值为一个几何对象；此外还有一个属性 properties，可以是任意 JSON 或 null
            //properties里面可以封装各种属性，例如名称、标识颜色
            "properties": {
                "station_id": d.station_id,
                // 	描写(文字); 形容; 说明; 类型
                "description": d.name,
                "color": "#eae33f",
                //透明度
                "opacity": 0.2,
                //半径
                "radius": 1
            },
            //geometry,几何，几何图形
            //把这些要素封装到geometry，作为一个个的Feature（也就是要素），要素放到一个要素集合里
            //geojson点对象
            "geometry": {
                //geojson的地理要素
                "type": "Point",
                "coordinates": [d.long, d.lat]
            }
        });

        // data_10min.push({ date: newDate, value: sum });
        stationLongLat.push({ stationID: d.station_id, stationLONG: d.long, stationLAT: d.lat });
    }); //console.log('stationLongLat:'); console.log(stationLongLat);




    // 反应很慢，打不开   
    // var a = 1;
    // trips.push({ tripsFrom: dayTripInfo[0].from_station_id, tripsTo: dayTripInfo[0].to_station_id, tripsSum: a });
    // // console.log(trips);
    // // console.log(typeof (trips[0].tripsSum));
    // // console.log(trips[0].tripsSum);
    // // console.log(typeof (trips[0].tripsFrom));
    // // console.log(typeof(trips[0].tripsSum));

    // dayTripInfo.forEach(function (d) {
    //     var sum = 1;
    //     trips.forEach(function (s) {
    //         if (s.tripsFrom == d.from_station_id && s.tripsTo == d.to_station_id)
    //         {
    //             // s.tripsSum=Number(s.tripsSum)++;
    //             s.tripsSum++;
    //             console.log(s.tripsSum);
    //         }

    //         else trips.push({ tripsFrom: d.from_station_id, tripsTo: d.to_station_id, tripsSum: sum });
    //     })
    // });
    // console.log(trips);





    // trips计算sum
    dayTripInfo.forEach(function (d) {
        var sum = 1;
        od.push({ odFrom: d.from_station_id, odTo: d.to_station_id, odSum: sum });
    });
    var nest = d3.nest()
        .key(function (d) { return d.odFrom; })
        .key(function (d) { return d.odTo; });
    var odnest = nest.entries(od);
    // console.log('odnest:');
    // console.log(odnest);

    odnest.forEach(function (d) {
        var i = 0;
        for (i = 0; i < d.values.length; i++)
            trips.push({ tripsFrom: d.key, tripsTo: d.values[i].key, tripsSum: d.values[i].values.length });
    }); console.log(trips);



    // // trips未计算sum
    // dayTripInfo.forEach(function (d) {
    //     var sum = 1;
    //     trips.push({ tripsFrom: d.from_station_id, tripsTo: d.to_station_id, tripsSum: sum });
    // }); console.log(trips);


    trips.forEach(function (d) {
        //console.log(stationLongLat.length);
        for (var i = 0; i < stationLongLat.length; i++) {
            // console.log("ssss");
            if (stationLongLat[i].stationID == d.tripsFrom) {
                d.fromLong = stationLongLat[i].stationLONG;
                d.fromLat = stationLongLat[i].stationLAT;
                // d.push({ fromLong: stationLongLat[i].stationLONG, fromLat: stationLongLat[i].stationLAT});
            }
            if (stationLongLat[i].stationID == d.tripsTo) {
                d.toLong = stationLongLat[i].stationLONG;
                d.toLat = stationLongLat[i].stationLAT;
                // d.push({ toLong: stationLongLat[i].stationLONG, toLat: stationLongLat[i].stationLAT });
            }
        }
    });
    //  console.log("trips:");console.log(trips);


    //data_point是车站的集合？画站点位置用
    var data_point = {
        "type": "FeatureCollection",//则该对象必须有属性 features，其值为一个数组，每一项都是一个 Feature 对象。
        "features": stationFeatures
    }; //console.log(stationFeatures);



    //              黄色、    淡暗红色、 雾霾蓝色、  橘色、     蓝紫色（偏蓝） 荧光绿、  蓝紫（偏紫） 紫色
    // var colors = ["#EDC951", "#CC333F", "#00A0B0", "#ff5a29", "#2f71b0", "#55ff30", "#570eb0", "#883378"];
    //           2-3           4-7        8-11        12-15       16-19
    //             深卡其布    黄色         纯红        耐火砖       栗色
    var colors = ["#BDB76B","#EDC951",  "#FF0000", "#B22222", "#800000"];
    var buildLines = function () {
        var features = [];
        var curveness = 0.3;
        for (var i = 0; i < trips.length; i++) {
            if (trips[i].tripsSum > 2) {
                var startLong = Number(trips[i].fromLong);
                var startLat = Number(trips[i].fromLat);
                var endLong = Number(trips[i].toLong);
                var endLat = Number(trips[i].toLat); //console.log(typeof(endLat));
                var control = [
                    (startLong + endLong) / 2 - (startLat - endLat) * curveness,
                    (startLat + endLat) / 2 - (startLong - endLong) * curveness
                ];//console.log(control);

                var t = 0;
                var points = [];
                while (t < 1) {
                    t += 0.001;
                    var x = Math.pow((1 - t), 2) * startLong + 2 * t * (1 - t) * control[0] + Math.pow(t, 2) * endLong;
                    var y = Math.pow((1 - t), 2) * startLat + 2 * t * (1 - t) * control[1] + Math.pow(t, 2) * endLat;

                    points.push([x, y]);
                }
                features.push({
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": points,
                    },
                    "properties": {
                        "color": colors[Math.floor(trips[i].tripsSum / 4)],
                        "line-width": trips[i].tripsSum
                    },
                }); //console.log(Math.floor(trips[i].tripsSum / 4));
            }
        }
        return features;
    };

    // 画贝塞尔的运动点
    var buildPoints = function (time) {
        var features = [];
        var curveness = 0.3;
        for (var i = 0; i < trips.length; i++) {
            if (trips[i].tripsSum > 2) {
                var startLong = Number(trips[i].fromLong);
                var startLat = Number(trips[i].fromLat);
                var endLong = Number(trips[i].toLong);
                var endLat = Number(trips[i].toLat); //console.log(typeof(endLat));
                var control = [
                    (startLong + endLong) / 2 - (startLat - endLat) * curveness,
                    (startLat + endLat) / 2 - (startLong - endLong) * curveness
                ];//console.log(control);

                // 为了绘制彗星尾迹，需要同时画出count个半径递增的圆点
                var count = 200;
                // 最大圆点的半径
                var maxRadius = 2;
                // 求出当前时间点小圆点的坐标
                var t = time;
                for (var j = 0; j < count; j++) {
                    t += 0.001;
                    if (t > 1) break;
                    var x = Math.pow((1 - t), 2) * startLong + 2 * t * (1 - t) * control[0] + Math.pow(t, 2) * endLong;
                    var y = Math.pow((1 - t), 2) * startLat + 2 * t * (1 - t) * control[1] + Math.pow(t, 2) * endLat;

                    features.push({
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": [x, y],
                        },
                        // Math.floor(trips[i].tripsSum / 4 有的是0，所以+1保证非零
                        "properties": { "radius": (Math.floor(trips[i].tripsSum / 4)+1)*2.8 * j / count, "color": colors[Math.floor(trips[i].tripsSum / 4)] },
                    });
                }
            }
        }
        return features;
    };




    //画贝塞尔曲线的source 
    var data_line = {
        "type": "FeatureCollection",//则该对象必须有属性 features，其值为一个数组，每一项都是一个 Feature 对象。
        "features": buildLines()
    };//console.log(data_line);


    // 加载站点
    map.on('load', function () {
        //map.addSource(id,source)id为数据源id，这些数据源名叫id;source数据源对象,描述数据？
        map.addSource("station_source", {
            "type": "geojson",
            'data': data_point
        });
        // addLayer(layer,beforeid) layer需要添加的样式图层;beforeid 用来插入新图层的现有图层 ID
        map.addLayer({
            "id": "station",
            "source": "station_source",
            //地图缩放的最小比列
            "minzoom": 2,
            "type": "circle",
            "paint": {
                //点的属性
                "circle-radius": 6,
                "circle-color": "#DC143C",
                "circle-opacity": 1,
                //点外层一圈的属性
                "circle-stroke-color": "#9c9c9c",
                "circle-stroke-width": 3,
                "circle-opacity": 1
            }
        }, 'waterway-label');

        // map.addLayer({
        //     "id": "station-hover",
        //     "source": "station_source",
        //     "type": "circle",
        //     "paint": {
        //         "circle-radius": 10,
        //         "circle-color": "#FF00FF", "circle-opacity": 1,
        //         "circle-stroke-color": "#000080",
        //         "circle-stroke-width": 0.5
        //     },
        //     //过滤条件
        //     "filter": ["==", "station_id", ""]
        // }, 'waterway-label');





        // 加载贝塞尔曲线
        map.addSource("chart-lines", {
            "type": "geojson",           /* geojson类型资源 */
            "data": data_line
        });

        map.addLayer({
            "id": "route",
            "type": "line",
            "source": "chart-lines",
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": ["get", "color"],
                // 根据tripsSum设定线的宽度
                "line-width": ["get", "line-width"]
            }
        });




        // 加载贝塞尔曲线运动点
        map.addSource("chart-points", {
            "type": "geojson",           /* geojson类型资源 */
            "data": {                    /* geojson数据 */
                "type": "FeatureCollection",
                "features": buildPoints(0.1)
            }
        });
        map.addLayer({
            "id": "chart-points",
            "type": "circle",          /* circle类型表示一个圆，一般比较小 */
            "source": "chart-points",
            "paint": {
                "circle-radius": ["get", "radius"],
                "circle-color": ["get", "color"],  /* 圆的颜色 */
                "circle-stroke-width": 1,  /* 边框宽度 */
                "circle-stroke-color": ["get", "color"],  /* 边框的颜色 */
                "circle-opacity": 0.5,
                "circle-pitch-alignment": "map"
            }
        });






        // Create a popup, but don't add it to the map yet.
        var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        map.on('mouseenter', 'station', function (e) {
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = 'pointer';

            var coordinates = e.features[0].geometry.coordinates.slice();
            var description = 'NAME:' + e.features[0].properties.description + '<p>' + 'ID:' + e.features[0].properties.station_id;
            // var id = e.features[0].properties.station_id;

            // Ensure that if the map is zoomed out such that multiple
            // copies of the feature are visible, the popup appears
            // over the copy being pointed to.
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Populate the popup and set its coordinates
            // based on the feature found.
            popup
                .setLngLat(coordinates)
                .setHTML(description)
                //.setHTML(id)
                .addTo(map);
        });

        map.on('mouseleave', 'station', function () {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });
    });
}

























//mapbox eg2
// mapboxgl.accessToken = 'pk.eyJ1IjoiaGVxdyIsImEiOiJjazdvZ2xhNm0wM3B5M2xtdm9zb2Frcm5oIn0.B1NqPdk5Rdsvh0dR7-FpmA';
// var map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/light-v10',
//     center: [-96, 37.8],
//     zoom: 3
// });

// map.on('load', function () {
//     map.addSource('points', {
//         'type': 'geojson',
//         'data': {
//             'type': 'FeatureCollection',
//             'features': [
//                 {
//                     // feature for Mapbox DC
//                     'type': 'Feature',
//                     'geometry': {
//                         'type': 'Point',
//                         'coordinates': [
//                             -77.03238901390978,
//                             38.913188059745586
//                         ]
//                     },
//                     'properties': {
//                         'title': 'Mapbox DC',
//                         'icon': 'monument'
//                     }
//                 },
//                 {
//                     // feature for Mapbox SF
//                     'type': 'Feature',
//                     'geometry': {
//                         'type': 'Point',
//                         'coordinates': [-122.414, 37.776]
//                     },
//                     'properties': {
//                         'title': 'Mapbox SF',
//                         'icon': 'harbor'
//                     }
//                 }
//             ]
//         }
//     });
//     map.addLayer({
//         'id': 'points',
//         'type': 'symbol',
//         'source': 'points',
//         'layout': {
//             // get the icon name from the source's "icon" property
//             // concatenate the name to get an icon from the style's sprite sheet
//             'icon-image': ['concat', ['get', 'icon'], '-15'],
//             // get the title name from the source's "title" property
//             'text-field': ['get', 'title'],
//             'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
//             'text-offset': [0, 0.6],
//             'text-anchor': 'top'
//         }
//     });
// });

//mapbox example 1
// mapboxgl.accessToken = 'pk.eyJ1Ijoic2hlbmhvbmdpc3NreSIsImEiOiJjaXlzanRtNGswMDB3MzNvNDh3NzJqNmNnIn0.8LvCg1s5Qb88lwItbSFOzg';
// var map = new mapboxgl.Map({
//     container: 'map',
//     style: 'mapbox://styles/mapbox/streets-v9',
//     center: [108, 33],
//     zoom: 4,
//     touchZoomRotatez: true
// });

// map.on('load', function () {
//     map.addLayer({
//         id: 'terrain-data',
//         type: 'line',
//         source: {
//             type: 'vector',
//             url: 'mapbox://mapbox.mapbox-terrain-v2'
//         },
//         'source-layer': 'contour'
//     });
// });

// map.addSource('eggwalkathon', {
//     "type": "geojson",
//     "data": geoobject
// });

//map.addLayer({
    // 'id': 'eggwalkathon_card',
    // 'type': 'symbol',
    // 'source': 'eggwalkathon',
    // "layout": {
    //     "visibility": "visible",
    //     "icon-image": "embassy-15",
    //     "icon-size": 1.4,
    //     "icon-allow-overlap": true
    // },
    // "paint": {
    //     "circle-radius": 3,
    //     "circle-color": "#000000"
    // }
    // ,
    // "filter": ["==", "type", Point]
//});