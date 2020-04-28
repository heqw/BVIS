//mapbox
//var bounds = [[104.57336425, 31.32255387], [104.91016387, 31.59725256]];

mapboxgl.accessToken = 'pk.eyJ1Ijoic2lsZW50bGwiLCJhIjoiY2o4NGEycGN2MDZ4ZDMza2Exemg4YmtkaCJ9.LaSV_2wU1XbulGlrDiUgTw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    // style: 'mapbox://styles/mapbox/streets-v9',

    //A zoom level determines how much of the world is visible on a map，缩放级别
    zoom: 11.7,
    //Default map center in longitude and latitude.经度 纬度
    center: [-122.319407, 47.623748],
    //pitch in degrees倾斜度
    pitch: 40
});
//  var daytripInfo;
//console.log(stationInfo);

var mainChart = {};
//flag判断日期数据来源
var flag = "first";
// var hour, time, minute;
mainChart.map_view = {
    "OD": true,
    "heatmap": false
};
DrawStation(flag, a.getdate);
// DrawStation();

function DrawStation(flag, date) {
    console.log(flag);
    // var daytripInfo;
    // 请求的是所选当天的trip数据
    $.ajax({
        url: "http://localhost:3000/spiralLineData",
        dataType: 'json',
        //crossDomain: false,
        //data: {},
        data: {
            sstartyear: a.getyear,
            sstartmonth: a.getmonth,
            sstartday: a.getday,
            sendyear: a.endYear,
            sendmonth: a.endMonth,
            sendday: a.endDay
        },
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function() {},
        success: function(Info, textStatus) {
            // var daytripInfo = Info; console.log(daytripInfo);
            // console.log(Info);
            var tripInfo = [];
            if (flag == "spiral") {
                mainChart.spiralHour = date.getHours();
                mainChart.spiralMinute = date.getMinutes();
                if (mainChart.spiralMinute == '0') mainChart.spiralMinute = "00";
                Info.forEach(function(d) {
                        //trips数据的时间
                        var time = new Date(d.start_time);
                        // console.log(time);
                        var hour = time.getHours() - 8;
                        if (hour < 0) hour += 24;
                        var minute = time.getMinutes();
                        if (mainChart.spiralHour == hour && minute >= mainChart.spiralMinute &&
                            minute <= (mainChart.spiralMinute + 9) && d.user_type == "Member") {
                            tripInfo.push({ from_station_id: d.from_station_id, to_station_id: d.to_station_id });
                            // odFrom: d.from_station_id, odTo: d.to_station_id, odSum: sum
                        }
                        // console.log("spiral时间 if里");
                        // console.log(mainChart.spiralHour);
                        // console.log(mainChart.spiralMinute);
                    })
                    // console.log("spiral时间");
                    // console.log(mainChart.spiralHour);
                    // console.log(mainChart.spiralMinute);
                senddaytripInfo(tripInfo, flag);
                console.log(tripInfo);
            } else senddaytripInfo(Info, flag);
            console.log(Info);

        },
        complete: function() {},
        error: function() {}
    });

    //console.log(daytripInfo);
}

function senddaytripInfo(In, flag) {
    // 请求的是station的数据，为了获得站点经纬度那些信息
    $.ajax({
        url: "http://localhost:3000/stationData",
        dataType: 'json',
        //crossDomain: false,
        //data: {},
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function() {},
        //success: function(StrContent)里的这个参数，
        //任意命名的，在这个函数有用到。参数值是在Ajax提交成功后所返回的内容
        success: function(mapInfo, textStatus) {
            //stationInfo=mapInfo;
            drawMap(mapInfo, In, flag); //console.log(daytripInfo);
            initHeatMap(mapInfo, In);
        },
        complete: function() {},
        error: function() { console.log("maperror") }
    });
    //console.log(stationFeatures); console.log(typeof (stationFeatures));

}

function drawMap(station, dayTripInfo, flag) {
    console.log("骑行数据");
    console.log(dayTripInfo);
    //console.log(typeof(station));
    // stationData = station;


    // 存储单车站id、long、lat
    var stationLongLat = [];
    // 存储from_station_id to_station_id
    var trips = [];
    // 存储O的long lat,D的long lat,绘制路线
    var od = [];
    var limit = 2;
    if (flag == "spiral") {
        limit = 0;
        // map.removeLayer("station");
        // map.removeLayer('route');
        // map.removeLayer('chart-point');
        // // // map.removeLayer('heatMap');
        // // map.removeSource("chart-lines");
        // // map.removeSource("station_source");
        // map.removeSource('chart-points');
        map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v9',
            // style: 'mapbox://styles/mapbox/streets-v9',

            //A zoom level determines how much of the world is visible on a map，缩放级别
            zoom: 11.7,
            //Default map center in longitude and latitude.经度 纬度
            center: [-122.319407, 47.623748],
            //pitch in degrees倾斜度
            pitch: 40
        });

        d3.selectAll('#time_div').remove();
        //map添加一个div,作用？应该是左下角那个透明的颜色
        var main_time = d3.select("#map")
            .append("div")
            .attr("id", "time_div")
            .style({
                "position": "absolute",
                "pointer-events": "none",
                "z-index": "999",
                "bottom": "2%",
                "left": '2%'
            })
            .attr("width", 100)
            .attr("height", 30);
        //该div添加一个 a?，显示时间？  
        main_time.append("a")
            .attr("id", "map_date")
            .attr("align", "center")
            .style("display", "block")
            .text(mainChart.spiralHour + ":" + mainChart.spiralMinute)
            .style({
                "font-size": '30px',
                "opacity": 0.6,
                // #ffffff白色
                "color": "#ffffff",
                "text-align": "center",
            });




        // map.setLayoutProperty('station', 'visibility', 'none');
        // map.setLayoutProperty('route', 'visibility', 'none');
        // map.setLayoutProperty('chart-points', 'visibility', 'none');
        // map.setLayoutProperty('heatMap', 'visibility', 'none');
    }
    console.log("limit");
    console.log(limit);
    //给每一个单车数据添加feature
    mainChart.stationFeatures = [];

    station.forEach(function(d) {
        mainChart.stationFeatures.push({
            "type": "Feature", //则该对象必须有属性 geometry，其值为一个几何对象；此外还有一个属性 properties，可以是任意 JSON 或 null
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
    dayTripInfo.forEach(function(d) {
        var sum = 1;
        od.push({ odFrom: d.from_station_id, odTo: d.to_station_id, odSum: sum });
    });
    var nest = d3.nest()
        .key(function(d) { return d.odFrom; })
        .key(function(d) { return d.odTo; });
    var odnest = nest.entries(od);
    // console.log('odnest:');
    // console.log(odnest);

    odnest.forEach(function(d) {
        var i = 0;
        for (i = 0; i < d.values.length; i++)
            trips.push({ tripsFrom: d.key, tripsTo: d.values[i].key, tripsSum: d.values[i].values.length });
    }); //console.log(trips);



    // // trips未计算sum
    // dayTripInfo.forEach(function (d) {
    //     var sum = 1;
    //     trips.push({ tripsFrom: d.from_station_id, tripsTo: d.to_station_id, tripsSum: sum });
    // }); console.log(trips);


    trips.forEach(function(d) {
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
    console.log("trips:");
    console.log(trips);


    //data_point是车站的集合？画站点位置用
    mainChart.data_point = {
        "type": "FeatureCollection", //则该对象必须有属性 features，其值为一个数组，每一项都是一个 Feature 对象。
        "features": mainChart.stationFeatures
    };
    console.log(mainChart.data_point);



    //              黄色、    淡暗红色、 雾霾蓝色、  橘色、     蓝紫色（偏蓝） 荧光绿、  蓝紫（偏紫） 紫色
    // var colors = ["#EDC951", "#CC333F", "#00A0B0", "#ff5a29", "#2f71b0", "#55ff30", "#570eb0", "#883378"];
    //           2-3           4-7        8-11        12-15       16-19
    //             深卡其布    黄色         纯红        耐火砖       栗色
    // var colors = ["#BDB76B", "#EDC951", "#FF0000", "#B22222", "#800000"];
    var colors = ["#F8CF5F", "#F3B554", "#EB7E37", "#C25432", "#743D32"];
    var buildLines = function() {
        var features = [];
        var curveness = 0.3;
        for (var i = 0; i < trips.length; i++) {
            if (trips[i].tripsSum > limit) {
                var startLong = Number(trips[i].fromLong);
                var startLat = Number(trips[i].fromLat);
                var endLong = Number(trips[i].toLong);
                var endLat = Number(trips[i].toLat); //console.log(typeof(endLat));
                var control = [
                    (startLong + endLong) / 2 - (startLat - endLat) * curveness,
                    (startLat + endLat) / 2 - (startLong - endLong) * curveness
                ]; //console.log(control);

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
                        "color": colors[Math.floor(trips[i].tripsSum / 4) + Math.abs(limit - 2)],
                        "line-width": trips[i].tripsSum / 2,
                        "fromStation": trips[i].tripsFrom,
                        "toStation": trips[i].tripsTo
                    },
                }); //console.log(Math.floor(trips[i].tripsSum / 4));
            }
        }
        console.log("features");
        console.log(features);
        return features;
    };

    // 多少秒为一个周期
    //var cycle = 10000;
    var n = 0,
        N = 0;
    trips.forEach(function(d) {
            d.cycle = 10000;
        })
        // 画贝塞尔的动态点
    var buildPoints = function(time) {
        // console.log("diandiandiandiandian");
        var features = [];
        var curveness = 0.3;
        // console.log("time");
        // console.log(time);

        for (var i = 0; i < trips.length; i++) {
            if (trips[i].tripsSum > limit) {
                N++;
                var startLong = Number(trips[i].fromLong);
                var startLat = Number(trips[i].fromLat);
                var endLong = Number(trips[i].toLong);
                var endLat = Number(trips[i].toLat); //console.log(typeof(endLat));
                var control = [
                    (startLong + endLong) / 2 - (startLat - endLat) * curveness,
                    (startLat + endLat) / 2 - (startLong - endLong) * curveness
                ]; //console.log(control);

                // 求出当前时间点小圆点的坐标
                var t = time;
                if (time > trips[i].cycle) t = time % trips[i].cycle;
                var x = Math.pow((1 - t), 2) * startLong + 2 * t * (1 - t) * control[0] + Math.pow(t, 2) * endLong;
                var y = Math.pow((1 - t), 2) * startLat + 2 * t * (1 - t) * control[1] + Math.pow(t, 2) * endLat;
                //  获得周期时间 注意有些行程OD一样
                if (Math.abs(x - endLong) < 0.0001 && startLong != endLong) {
                    trips[i].cycle = time;
                    // n++;
                    //console.log(i);
                    // console.log(cycle);
                }
                // console.log("cycle");
                // console.log(trips[i].cycle);
                //console.log(n);

                //x要在OD间：Ox< x <Dx 或 Dx< x <Ox 不在OD间：x>Ox && x>Dx 或x<Ox && x<Dx 
                // var xlen, ylen, xout, yout, xchange, ychange;
                // if ((x > startLong && x > endLong) || (x < startLong && x < endLong)) {
                //     xlen = startLong - endLong;
                //     ylen = startLat - endLat;
                //     // while (x) x -= xlen;
                //     // while (y) y -= ylen;
                //     // x += xlen;
                //     // y += ylen;
                //     xout = endLong - x;
                //     yout = endLat - y;
                //     // 求多出来的x并且取正负号判断OD方向 xout为+代表是往左走，-是往右走 -xout
                //     x = Math.abs(xout) % Math.abs(xlen) * (-xout / Math.abs(xout)) + startLong;
                //     y = Math.abs(yout) % Math.abs(ylen) * (-yout / Math.abs(yout)) + startLat;
                // }
                features.push({
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [x, y],
                    },
                    // // Math.floor(trips[i].tripsSum / 4 有的是0，所以+1保证非零
                    // "properties": { "radius": (Math.floor(trips[i].tripsSum / 7) + trips[i].tripsSum * 0.3) * j / count, "color": colors[Math.floor(trips[i].tripsSum / 4)] },
                    "properties": {
                        "radius": (Math.floor(trips[i].tripsSum / 16) + trips[i].tripsSum * 0.3),
                        "color": colors[Math.floor(trips[i].tripsSum / 4)]
                    },
                });

            }
        }
        return { /* geojson数据 */
            "type": "FeatureCollection",
            "features": features
        };
    };

    // // 画贝塞尔的运动点
    // var buildPoints = function(time) {
    //     var features = [];
    //     var curveness = 0.3;
    //     for (var i = 0; i < trips.length; i++) {
    //         if (trips[i].tripsSum > 2) {
    //             var startLong = Number(trips[i].fromLong);
    //             var startLat = Number(trips[i].fromLat);
    //             var endLong = Number(trips[i].toLong);
    //             var endLat = Number(trips[i].toLat); //console.log(typeof(endLat));
    //             var control = [
    //                 (startLong + endLong) / 2 - (startLat - endLat) * curveness,
    //                 (startLat + endLat) / 2 - (startLong - endLong) * curveness
    //             ]; //console.log(control);

    //             // 为了绘制彗星尾迹，需要同时画出count个半径递增的圆点
    //             var count = 400;
    //             // 最大圆点的半径
    //             var maxRadius = 1;
    //             // 求出当前时间点小圆点的坐标
    //             var t = time;
    //             for (var j = 0; j < count; j++) {
    //                 t += 0.001;
    //                 if (t > 1) break;
    //                 var x = Math.pow((1 - t), 2) * startLong + 2 * t * (1 - t) * control[0] + Math.pow(t, 2) * endLong;
    //                 var y = Math.pow((1 - t), 2) * startLat + 2 * t * (1 - t) * control[1] + Math.pow(t, 2) * endLat;

    //                 features.push({
    //                     "type": "Feature",
    //                     "geometry": {
    //                         "type": "Point",
    //                         "coordinates": [x, y],
    //                     },
    //                     // Math.floor(trips[i].tripsSum / 4 有的是0，所以+1保证非零
    //                     "properties": { "radius": (Math.floor(trips[i].tripsSum / 7) + trips[i].tripsSum * 0.3) * j / count, "color": colors[Math.floor(trips[i].tripsSum / 4)] },
    //                 });
    //             }
    //         }
    //     }
    //     return features;
    // };




    //画贝塞尔曲线的source 
    var data_line = {
        "type": "FeatureCollection", //则该对象必须有属性 features，其值为一个数组，每一项都是一个 Feature 对象。
        "features": buildLines()
    }; //console.log(data_line);


    // 加载站点
    map.on('load', function() {
        //map.addSource(id,source)id为数据源id，这些数据源名叫id;source数据源对象,描述数据？
        map.addSource("station_source", {
            "type": "geojson",
            'data': mainChart.data_point
        });
        // addLayer(layer,beforeid) layer需要添加的样式图层;beforeid 用来插入新图层的现有图层 ID
        map.addLayer({
            "id": "station",
            "source": "station_source",
            //地图缩放的最小比列
            "minzoom": 2,
            "type": "circle",
            "layout": {
                'visibility': 'visible'
            },
            "paint": {
                //点的属性
                "circle-radius": 4,
                "circle-color": "#2C5F98",
                "circle-opacity": 1,
                //点外层一圈的属性
                "circle-stroke-color": "#CEE7CC",
                "circle-stroke-width": 1,
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
            "type": "geojson",
            /* geojson类型资源 */
            "data": data_line
        });
        console.log("data_line");
        console.log(data_line);

        map.addLayer({
            "id": "route",
            "type": "line",
            "source": "chart-lines",
            "layout": {
                'visibility': 'visible'
            },
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




        // // 加载贝塞尔曲线运动点
        // map.addSource("chart-points", {
        //     "type": "geojson",
        //     /* geojson类型资源 */
        //     "data": { /* geojson数据 */
        //         "type": "FeatureCollection",
        //         "features": buildPoints(0.1)
        //     }
        // });
        // map.addLayer({
        //     "id": "chart-points",
        //     "type": "circle",
        //     /* circle类型表示一个圆，一般比较小 */
        //     "source": "chart-points",
        //     "paint": {
        //         "circle-radius": ["get", "radius"],
        //         "circle-color": ["get", "color"],
        //         /* 圆的颜色 */
        //         "circle-stroke-width": 1,
        //         /* 边框宽度 */
        //         "circle-stroke-color": ["get", "color"],
        //         /* 边框的颜色 */
        //         "circle-opacity": 0.5,
        //         "circle-pitch-alignment": "map"
        //     }
        // });

        console.log("buildPoints");
        console.log(buildPoints(0));
        // 加载贝塞尔曲线动态点
        map.addSource("chart-points", {
            "type": "geojson",
            /* geojson类型资源 */
            "data": /* geojson数据 */

                buildPoints(0)

        });
        // console.log("chart-points");
        // console.log(chart - points);
        map.addLayer({
            "id": "chart-point",
            "type": "circle",
            /* circle类型表示一个圆，一般比较小 */
            "source": "chart-points",
            "layout": {
                'visibility': 'visible'
            },
            "paint": {
                "circle-radius": ["get", "radius"],
                "circle-color": ["get", "color"],
                /* 圆的颜色 */
                "circle-stroke-width": 1,
                /* 边框宽度 */
                "circle-stroke-color": ["get", "color"],
                /* 边框的颜色 */
                "circle-opacity": 0.5,
                "circle-pitch-alignment": "map"
            }
        });

        var t = 0;
        // console.log(chart - points);

        function animateMarker(timestamp) {
            // console.log(buildPoints(timestamp / 8000));
            // Update the data to a new position based on the animation timestamp. The
            // divisor in the expression `timestamp / 1000` controls the animation speed.
            map.getSource('chart-points').setData(buildPoints(timestamp / 8000));

            // Request the next frame of the animation.
            if (limit == 2) requestAnimationFrame(animateMarker);
        }
        animateMarker(0);
        // Start the animation.
        // if (flag == "spiral") {
        //     setTimeout(animateMarker(t), 5000);
        // } else animateMarker(t);




        // Create a popup, but don't add it to the map yet.
        var popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false
        });

        map.on('mouseenter', 'station', function(e) {
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

        map.on('mouseleave', 'station', function() {
            map.getCanvas().style.cursor = '';
            popup.remove();
        });

        map.on('mouseenter', 'route', function(e) {
            // Change the cursor style as a UI indicator.
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'route', function() {
            map.getCanvas().style.cursor = '';
            // popup.remove();
        });
        map.on('click', 'route', function(e) {
            if (mainChart.Msg_pop)
                mainChart.Msg_pop.remove();
            var from = e.features[0]._vectorTileFeature.properties.fromStation;
            var to = e.features[0]._vectorTileFeature.properties.toStation;
            console.log(from);
            console.log(to);
            var flag = "map";
            sendBarReq(from, to, flag);
            // mainChart.Msg_pop = new mapboxgl.Popup()
            //     .setLngLat(e.features[0].geometry.coordinates)
            //     .setHTML(e.features[0].properties.description)
            //     .addTo(map);

            // update_radar(e.features[0].properties.station_id, mainChart.date_extent);

        });
    });
    // map.setLayoutProperty('station', 'visibility', 'visible');
    // map.setLayoutProperty('route', 'visibility', 'visible');
    // map.setLayoutProperty('chart-points', 'visibility', 'visible');
    // map.setLayoutProperty('heatMap', 'visibility', 'none');
}

// 统计各站点OD中总的出现次数，和wordCloud方法一样。数据需要经纬度、该站点的总出次数
function initHeatMap(mapData, tripData) {

    var nest = d3.nest().key(function(d) { return d.from_station_id })
    var O = nest.entries(tripData);
    //计算每个车站O出现次数
    //console.log(s);
    // var sum=0;
    // var num=0;
    O.forEach(function(d) {
        // d.from_station_id = d.values[0].from_station_id;
        var useTime = d.values.length;
        d.fromSum = useTime;

    });

    var nest = d3.nest().key(function(d) { return d.to_station_id })
    var D = nest.entries(tripData);
    D.forEach(function(d) {
        d.toSum = d.values.length;
        d.flag = 0;
    });

    //console.log(O);
    var wordData = [];
    O.forEach(function(d) {
        d.flag = 0;
        for (i = 0; i < D.length; i++) {
            // 还没找到O D里两个相等
            if (d.flag == 0) {
                sumUse = d.fromSum + D[i].toSum;
                if (d.key == D[i].key && (sumUse) > 4) {
                    // 表示在O D中找到了匹配的值
                    D[i].flag = 1;
                    d.flag = 1;
                    wordData.push({ key: d.key, useTime: parseInt(sumUse), station_id: d.values[0].from_station_id });
                }
            }
        }
    })
    O.forEach(function(d) {
        if (d.flag == 0) {
            wordData.push({ key: d.key, useTime: parseInt(d.fromSum), station_id: d.values[0].from_station_id });
        }
    })

    D.forEach(function(d) {
            if (d.flag == 0) {
                wordData.push({ key: d.key, useTime: parseInt(d.toSum), station_id: d.values[0].to_station_id });
            }
        })
        // console.log(O);
        // console.log(D);
        // console.log(wordData);
        // console.log(mapData);
        // 将站点经纬度存入wordData
    wordData.forEach(function(d) {
            for (i = 0; i < mapData.length; i++) {
                if (d.station_id == mapData[i].station_id) {
                    d.lat = mapData[i].lat;
                    d.long = mapData[i].long;
                }
            }
        })
        // 热力图要根据相同点的个数来确定颜色
    wordData.forEach(function(d) {
        for (i = 0; i < d.useTime - 1; i++) {
            wordData.push({ key: d.key, useTime: d.useTime, station_id: d.station_id, lat: d.lat, long: d.long });
        }
    })
    console.log("热力图统计OD总出现次数");
    console.log(wordData);



    heatFeatures = [];
    var max = 1;
    wordData.forEach(function(d) {
        if (d.useTime > max) max = d.useTime;
        heatFeatures.push({
            "type": "Feature", //则该对象必须有属性 geometry，其值为一个几何对象；此外还有一个属性 properties，可以是任意 JSON 或 null
            //properties里面可以封装各种属性，例如名称、标识颜色
            "properties": {
                "sum": d.useTime
            },

            "geometry": {
                "type": "Point",
                "coordinates": [d.long, d.lat]
            }
        });
    });
    max *= 1.2;
    data_point = {
        "type": "FeatureCollection", //则该对象必须有属性 features，其值为一个数组，每一项都是一个 Feature 对象。
        "features": heatFeatures
    };

    map.on('load', function() {
        map.addSource('heat_source', {
            type: 'geojson',
            data: data_point
        });

        map.addLayer({
            "id": "heatMap",
            "type": "heatmap",
            "layout": {
                'visibility': 'none'
            },
            "source": "heat_source",
            "maxzoom": 14,
            "paint": {
                "heatmap-weight": [
                    "interpolate", ["linear"],
                    ["get", "sum"],
                    0, 0,
                    max, 1
                ],
                "heatmap-intensity": [
                    "interpolate", ["linear"],
                    ["zoom"],
                    7, 0,
                    14, 1
                ],
                "heatmap-color": [
                    "interpolate", ["linear"],
                    ["heatmap-density"],
                    0, "rgba(33,102,172,0)",
                    // 中蓝色
                    0.2, "rgb(65,105,255)",
                    // 荧光绿
                    0.4, "rgb(0,250,154)",
                    // 黄绿色
                    0.6, "rgb(175,255,43)",
                    // 亮黄色
                    0.8, "rgb(255,255,10)",
                    // 红色
                    1, "rgb(255,0,0)"
                ],
                "heatmap-radius": [
                    "interpolate", ["linear"],
                    ["zoom"],
                    7, 4,
                    14, 14
                ],
                "heatmap-opacity": [
                    "interpolate", ["linear"],
                    ["zoom"],
                    8, 0,
                    20, 1
                ]
            }
        }, 'waterway-label');
    });

}
initTool();

function initTool() {
    //加装btn的div
    var mainChart_tool = d3.select("#map")
        .append("div")
        .attr("class", "btn_div")
        .style({
            "position": "absolute",
            "float": "left",
            // z-index数值越大，显示地越靠前
            "z-index": "999",
            "left": "0.5%",
            "top": "6%"
        })
        //设置日历和刷新按钮
        .selectAll("btn btn-default")
        .data(["change"])
        .enter()
        .append("button")
        .attr({
            "id": function(d) {
                return d;
            },
            "type": "button",
            "class": "btn btn-default"
        })
        // 悬浮时的提示框
        .attr("title", "切换视图");

    //图标设置
    mainChart_tool.append("span")
        .attr("class", "glyphicon glyphicon-transfer")
        // 为了避免 屏幕识读设备抓取非故意的和可能产生混淆的输出内容（尤其是当图标纯粹作为装饰用途时），
        // 我们为这些图标设置了 aria-hidden="true" 属性。
        .attr("aria-hidden", true);

    // 点击那三个按钮的响应
    mainChart_tool.on("click", function(d) {
        mainChart.map_view.OD = !mainChart.map_view.OD;
        mainChart.map_view.heatmap = !mainChart.map_view.heatmap;

        // map.setLayoutProperty('section', 'visibility', 'visible');
        if (mainChart.map_view.OD) {
            map.setLayoutProperty('station', 'visibility', 'visible');
            map.setPaintProperty('station', 'circle-opacity', 1);
            map.setPaintProperty('station', 'circle-stroke-width', 1);
            map.setLayoutProperty('route', 'visibility', 'visible');
            map.setLayoutProperty('', 'visibility', 'visible');
        } else {
            map.setLayoutProperty('chart-point', 'visibility', 'none');
            map.setLayoutProperty('route', 'visibility', 'none');
            // map.setLayoutProperty('section', 'visibility', 'none');
            // map.setLayoutProperty('station', 'visibility', 'none');
            // map.setLayoutProperty('section-hover', 'visibility', 'none');
            // map.setLayoutProperty('station-hover', 'visibility', 'none');
            // d3.select(this).select("span").attr("class", "glyphicon glyphicon-eye-close");
        }
        if (mainChart.map_view.heatmap) {
            map.setLayoutProperty('station', 'visibility', 'visible');
            map.setPaintProperty('station', 'circle-opacity', 0);
            map.setPaintProperty('station', 'circle-stroke-width', 0);
            map.setLayoutProperty('heatMap', 'visibility', 'visible');
        } else {
            map.setLayoutProperty('heatMap', 'visibility', 'none');
        }

        if (mainChart.Msg_pop)
            mainChart.Msg_pop.remove();

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