//mapbox
//var bounds = [[104.57336425, 31.32255387], [104.91016387, 31.59725256]];

mapboxgl.accessToken = 'pk.eyJ1Ijoic2hlbmhvbmdpc3NreSIsImEiOiJjaXlzanRtNGswMDB3MzNvNDh3NzJqNmNnIn0.8LvCg1s5Qb88lwItbSFOzg';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',

    //A zoom level determines how much of the world is visible on a map，缩放级别
    zoom: 11.7,
    //Default map center in longitude and latitude.经度 纬度
    center: [-122.328407, 47.630748],
    //pitch in degrees倾斜度
    //pitch: 50
});

var stationData;
DrawStation();
function DrawStation() {

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
        success: function (station, textStatus) {
            //console.log(station);
            //console.log(typeof(station));
            // stationData = station;

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
            });

            //data_point是车站的集合？
            var data_point = {
                "type": "FeatureCollection",//则该对象必须有属性 features，其值为一个数组，每一项都是一个 Feature 对象。
                "features": stationFeatures
            }; //console.log(stationFeatures);
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


                // Create a popup, but don't add it to the map yet.
                var popup = new mapboxgl.Popup({
                    closeButton: false,
                    closeOnClick: false
                });

                map.on('mouseenter', 'station', function (e) {
                    // Change the cursor style as a UI indicator.
                    map.getCanvas().style.cursor = 'pointer';

                    var coordinates = e.features[0].geometry.coordinates.slice();
                    var description = 'NAME:'+ e.features[0].properties.description + '<p>'+'ID:'+e.features[0].properties.station_id;
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
        },
        complete: function () { },
        error: function () { console.log("maperror") }
    });
    //console.log(stationFeatures); console.log(typeof (stationFeatures));


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