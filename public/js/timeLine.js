sendTimeReq();

function sendTimeReq() {
    $.ajax({

        url: "http://localhost:3000/timeLineData",
        dataType: 'json',
        crossDomain: false,
        data: {
            tstartyear: a.weekStartYear,
            tstartmonth: a.weekStartMonth,
            tstartday: a.weekStartDay,
            tendyear: a.weekEndYear,
            tendmonth: a.weekEndMonth,
            tendday: a.weekEndDay
        },
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function() {},
        success: function(data, textStatus) {
            // console.log("data");
            // console.log(data);
            data.forEach(function(d) {
                d.week = new Date(d.start_time).getUTCDay();
            });
            weatherInTime(data);
            // handleData(data);
        },
        complete: function() {},
        error: function() {}
    });
}

function weatherInTime(data) {
    $.ajax({

        url: "http://localhost:3000/timeLineWeather",
        dataType: 'json',
        crossDomain: false,
        data: {
            tstartyear: a.weekStartYear,
            tstartmonth: a.weekStartMonth,
            tstartday: a.weekStartDay,
            tendyear: a.weekEndYear,
            tendmonth: a.weekEndMonth,
            tendday: a.weekEndDay
        },
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function() {},
        success: function(weatherdata, textStatus) {

            handleData(data, weatherdata);
        },
        complete: function() {},
        error: function() {}
    });
}

function handleData(data, weatherdata) {
    var nest = d3.nest().key(function(d) {
        if (d.week == 0) d.week = 7;
        return d.week
    })

    var drawData = nest.entries(data);

    var i = 0;
    var memberData = [];
    var shortData = [];
    drawData.forEach(function(d) {
        var memberSum = 0;
        var shortSum = 0;
        for (var i = 0; i < d.values.length; i++) {
            if (d.values[i].user_type == "Member") memberSum++;
            else shortSum++;
        }
        memberData.push({ key: d.key, daySum: memberSum });
        shortData.push({ key: d.key, daySum: shortSum });
        // console.log("data.length"); console.log(data.length);
        // console.log("d.values.length"); console.log(d.values.length);
        // console.log("memberData"); console.log(memberData);
        // console.log("shortData"); console.log(shortData);
    });
    var userData = [];
    userData.push(memberData);
    userData.push(shortData);

    var rain = ["降雨："];
    var wind = ["阵风："];
    var i = 1,
        j = 1;
    weatherdata.forEach(function(d) {
            // 都有天气事件或有降水量
            if (d.Event != null || d.Precipitation_In != 0) {
                // 小雨 RainIndex=1
                if (d.Precipitation_In <= 0.39) rain[i] = "小";
                // 中雨 RainIndex=2
                else if (d.Precipitation_In > 0.39 && d.Precipitation_In <= 0.98) rain[i] = "中";
                // 大雨，RainIndex=3
                else if (d.Precipitation_In > 0.98 && d.Precipitation_In <= 1.96) rain[i] = "大";
                // 暴雨，RainIndex=4
                else if (d.Precipitation_In > 1.96) rain[i] = "暴";
            } else rain[i] = "无";
            i++;
            // 7、8级风骑车不安全;6级风没体力顶不动,5级风骑车尚可
            // 0-5级风 WindIndex=5
            if (d.Max_Gust_Speed_MPH <= 25 || d.Max_Gust_Speed_MPH == "-") wind[j] = "0-5级";
            // 6级风 WindIndex=6
            else if (d.Max_Gust_Speed_MPH > 25 && d.Max_Gust_Speed_MPH <= 31) wind[j] = "6级";
            // 7风 树枝摇动 WindIndex=7
            else if (d.Max_Gust_Speed_MPH > 31 && d.Max_Gust_Speed_MPH <= 38) wind[j] = "7级";
            // 8风，WindIndex=8
            else if (d.Max_Gust_Speed_MPH > 38 && d.Max_Gust_Speed_MPH <= 46) wind[j] = "8级";
            // 9风，WindIndex=9
            else if (d.Max_Gust_Speed_MPH > 47) wind[j] = "9级";
            else wind[j] = "0";
            j++;
        })
        // console.log(weatherIndex);
    drawtime(userData, wind, rain);
    // drawtime(memberData);
    // drawtime(shortData);
    //console.log(userData);
    // console.log(memberData);
    // console.log(shortData);
}

function drawtime(data, wind, rain) {
    //console.log("time1");
    var color = ["#FFD700", "#B57766"];
    var time_line_wh = $("#timeLineView");

    var margin = { top: 20, right: 0, bottom: 40, left: 0 },
        width = time_line_wh.width() - margin.left - margin.right,
        height = time_line_wh.height() - margin.top - margin.bottom;

    var date_extent = d3.extent([1, 2, 3, 4, 5, 8]);

    var x_scale = d3.scale.linear()
        .domain(date_extent)
        .range([0, width]);

    var y_scale = d3.scale.linear()
        .domain([0, 700])
        .range([height - 40, 0]);

    var x_axis = d3.svg.axis()
        .scale(x_scale)
        .orient("bottom");

    var y_axis = d3.svg.axis()
        .scale(y_scale)
        .orient("left");

    var svg = d3.select("#timeLineView").append("svg")
        .attr("id", "time_line_svg")
        .attr("width", width)
        .attr("height", height + 50)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + (margin.left + 30) + "," + (height - 20) + ")")
        .call(x_axis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(30,20)")
        .call(y_axis);


    var line = d3.svg.line().x(function(d, i) {
        return x_scale(d.key);
    }).y(function(d) {
        return y_scale(d.daySum);

    }).interpolate("linear");
    //console.log(line(data[0]));
    var routes_g = svg.append("g")
        .attr("transform", "translate(" + (margin.left + 30) + ",20)");
    // var routes_s = svg.append("g")
    //     .attr("transform", "translate(" + (margin.left + 30) + ",20)");

    // for (i = 0; i < 2; i++) {
    //     var arr = data[i];
    //     var routes = routes_g.selectAll(".useLine")
    //         .data(arr)
    //         .enter()
    //         .append("g")
    //         .attr("class", function(d, i) { return "useLine use" + parseInt(i) });

    //     routes.append("path")
    //         .attr('fill', "none")
    //         .attr('opacity', 0.6)
    //         .attr('stroke', function(d, i) {
    //             return color[i];
    //         })
    //         .attr("stroke-width", 2)
    //         .attr("d", function(d) {
    //             return line(arr)
    //         })
    //         .attr("daySum", function(d) {
    //             return (d.daySum);
    //         })
    //         .on('mouseover', function(d) {
    //             // d3.select("#timeLineView").selectAll("g")
    //             //     .style("opacity", 0.3);
    //             // d3.select(this)
    //             //     .style("opacity", 1);

    //             var daySum = d3.select(this).attr("daySum");
    //             console.log(daySum);
    //             var dd = d3.select(this).attr("d");
    //             //console.log(d);
    //             // var x = d3.select(this).attr("x");
    //             // var y = d3.select(this).attr("y");
    //             var tip = routes_g.append("text")
    //                 .attr("id", "messenge")
    //                 .text("次数：" + daySum)
    //                 .attr("fill", "black")
    //                 .attr("font-size", "11px")
    //                 .attr("transform", "translate(2,21)");
    //             //.attr("transform", "translate(" + (x - 45) + "," + (y - 10) + ")")
    //         })
    //         .on('mousemove', function(d) {})
    //         .on('mouseout', function(d) {
    //             // d3.select("#timeLineView").selectAll("g")
    //             //     .style("opacity", 1);
    //             d3.select("#messenge").remove();
    //         });
    // }

    // 画点
    var group = svg.append("g")
        .attr("transform", "translate(" + (margin.left + 30) + ",20)");
    group.selectAll("circle")
        .data(data[0])
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {
            return x_scale(d.key);
        })
        .attr("cy", function(d) {
            return y_scale(d.daySum);
        })
        .attr("r", 3)
        .attr("fill", function(d, i) {
            return color[0];
        })
        .attr("daySum", function(d) {
            return d.daySum;
        })
        .attr("key", function(d) {
            return d.key;
        })
        .on('mouseover', function(d) {
            var daySum = d3.select(this).attr("daySum");
            var key = d3.select(this).attr("key");
            var cx = d3.select(this).attr("cx");
            var cy = d3.select(this).attr("cy");
            if (key == 6 || key == 7) cx -= 50;
            // console.log(daySum);
            // var dd = d3.select(this).attr("d");
            //console.log(d);
            // var x = d3.select(this).attr("x");
            // var y = d3.select(this).attr("y");
            var tip = routes_g.append("text")
                .attr("id", "messenge")
                .text("次数：" + daySum)
                .attr("fill", "black")
                .attr("font-size", "11px")
                .attr("transform", "translate(" + cx + "," + (cy - 20) + ")")
                //.attr("transform", "translate(" + (x - 45) + "," + (y - 10) + ")")
        })
        .on('mousemove', function(d) {})
        .on('mouseout', function(d) {
            // d3.select("#timeLineView").selectAll("g")
            //     .style("opacity", 1);
            d3.select("#messenge").remove();
        });

    var group2 = svg.append("g")
        .attr("transform", "translate(" + (margin.left + 30) + ",20)");
    group2.selectAll("circle")
        .data(data[1])
        .enter()
        .append("circle")
        .attr("cx", function(d, i) {
            return x_scale(d.key);
        })
        .attr("cy", function(d) {
            return y_scale(d.daySum);
        })
        .attr("r", 3)
        .attr("fill", function(d, i) {
            return color[1];
        })
        .attr("daySum", function(d) {
            return d.daySum;
        })
        .attr("key", function(d) {
            return d.key;
        })
        .on('mouseover', function(d) {
            var daySum = d3.select(this).attr("daySum");
            var key = d3.select(this).attr("key");
            var cx = d3.select(this).attr("cx");
            var cy = d3.select(this).attr("cy");
            if (key == 6 || key == 7) cx -= 50;
            // console.log(daySum);
            // var dd = d3.select(this).attr("d");
            //console.log(d);
            // var x = d3.select(this).attr("x");
            // var y = d3.select(this).attr("y");
            var tip = routes_g.append("text")
                .attr("id", "messenge")
                .text("次数：" + daySum)
                .attr("fill", "black")
                .attr("font-size", "11px")
                .attr("transform", "translate(" + cx + "," + (cy - 20) + ")")
                //.attr("transform", "translate(" + (x - 45) + "," + (y - 10) + ")")
        })
        .on('mousemove', function(d) {})
        .on('mouseout', function(d) {
            // d3.select("#timeLineView").selectAll("g")
            //     .style("opacity", 1);
            d3.select("#messenge").remove();
        });

    // member
    var routes = routes_g.selectAll(".useLine")
        .data(data)
        .enter()
        .append("g")
        .attr("class", function(d, i) { return "useLine use" + parseInt(i) });

    routes.append("path")
        .attr('fill', "none")
        .attr('opacity', 0.6)
        .attr('stroke', function(d, i) {
            return color[i];
        })
        .attr("stroke-width", 2)
        .attr("d", function(d, i) {
            return line(data[i])
        })
        .attr("daySum", function(d) {
            d.forEach(function(s) {
                //console.log(s.daySum);
                return s.daySum;
            })
        })


    var labels = ["会员", "普通用户"];
    var legend_div = d3.select("#timeLine").append("div")
        .attr("id", "time_line_label")
        .style({
            "position": "absolute",
            "z-index": "999",
            "right": "10px",
            "top": "30px"
        })
        .selectAll("label label-default legend_label")
        .data(labels)
        .enter()
        .append("span")
        .attr("class", "label label-default legend_label")
        // .on("mouseover", function(d) {
        //     d3.selectAll(".useLine").style("opacity", 0.3);
        //     d3.select(".use" + d).style("opacity", 1);
        // })
        // .on("mouseout", function(d) {
        //     d3.selectAll(".useLine").style("opacity", 1)
        // })
        // .on("click", function(d) {
        //     spiral_line(d.key, [new Date(2016, 0, 1, 0, 0, 0),
        //         new Date(2016, 0, 2, 0, 0, 0)
        //     ]);

    //message_cloud(d.key)
    //})
    .style({
            "background-color": function(d, i) {
                return color[i];
            },
            "cursor": "pointer",
            "margin": "7px",
            "curos-events": "none"
        })
        .html(function(d) {
            return d;
        });



    // var weather = ['rain', 'rain', 'sunny', 'frog', 'rain', 'rain', 'rain'];
    svg.selectAll(".text1")
        .data(rain)
        .enter()
        .append("text")
        .text(function(d) {
            return d;
        })
        .attr("fill", "black")
        .attr("font-size", "8px")
        .attr("x", function(d, i) {
            // return i * (100 / weather.length);
            return i * 36;
        })
        .attr("y", function(d) {
            return 165;
        });
    svg.selectAll(".text2")
        .data(wind)
        .enter()
        .append("text")
        .text(function(d) {
            return d;
        })
        .attr("fill", "black")
        .attr("font-size", "8px")
        .attr("x", function(d, i) {
            // return i * (100 / weather.length);
            return i * 35;
        })
        .attr("y", function(d) {
            return 180;
        });

    // short user
    // var sroutes = routes_s.selectAll(".route_line")
    //     .data(sdata)
    //     .enter()
    //     .append("g")
    //     .attr("class", function (d) { return "routes_line route_" + parseInt(d.key) });

    // sroutes.append("path")
    //     .attr('fill', "none")
    //     .attr('opacity', 0.6)
    //     .attr('stroke', "#9d2933")
    //     .attr("stroke-width", 2)
    //     .attr("d", function (d) {
    //         return line(sdata)
    //     })
}















// sendTimeReq();
// function sendTimeReq() {
//     $.ajax({

//         url: "http://localhost:3000/timeLineData",
//         dataType: 'json',
//         crossDomain: false,
//         data: {},
//         async: true,
//         type: "GET",
//         contentType: "application/json",
//         beforeSend: function () { },
//         success: function (data, textStatus) {
//             console.log("timeREQ");
//             data.forEach(function (d) {
//                 // 获得星期几并并插入到数组中，以week来存储
//                 // getUTCDay() 方法以世界时为标准，返回一个指定的日期对象为一星期中的第几天，0 代表星期天
//                 d.week = new Date(d.start_time).getUTCDay();
//             }); //console.log(data);
//             handleData(data);
//         },
//         complete: function () { },
//         error: function () { }
//     });
// }

// function handleData(data){
//     var nest = d3.nest().key(function (d) {
//         if (d.week == 0) d.week = 7;
//         return d.week
//     })

//     var drawData = nest.entries(data);

//     var i=0;
//     var Data = [];
//     drawData.forEach(function (d){
//         // var useTime = d.values.length;
//         // drawData.push({ key: d.key, useTime: useTime})
//         //d.values[i].dayTotal=useTime;
//         //   var useTime = d.values.length;
//         // for (i = 0; i < useTime;i++)
//         //     d.values[i].daySum = useTime;

//         Data.push({ key: d.key, daySum: d.values.length });
//     });

//     drawtime(Data); 
//     console.log(drawData);
//     console.log(Data);
// }

// function drawtime(data) {console.log("time1");

//     var time_line_wh = $("#timeLineView");
//     //#time_line 各个方向减20
//     var margin = { top: 20, right: 20, bottom: 20, left: 0 },
//         width = time_line_wh.width() - margin.left - margin.right,
//         height = time_line_wh.height() - margin.top - margin.bottom;




//     // 定制时间比例尺
//     //??? d3.extent()返回装有最大值和最小值的数组：data中 start_date_time 的最大值和最小值
//     var date_extent = d3.extent([1,2,3,4,5,8]);
//     //x轴比例尺
//     var x_scale = d3.scale.linear()
//         .domain(date_extent)
//         .range([0, width]);
//     //y轴比例尺
//     var y_scale = d3.scale.linear()
//         .domain([200, 800])
//         .range([height - 40, 0]);




//     //总结：定义坐标轴
//     //d3.svg.axis() ：D3 中坐标轴的组件，能够在 SVG 中生成组成坐标轴的元素。
//     var x_axis = d3.svg.axis()
//         //scale()：指定比例尺
//         .scale(x_scale)
//         // ticks()：指定刻度的数量。
//         //.tickFormat(d3.time.format("%A"))
//         //orient():指定刻度的朝向,bottom 表示在坐标轴的下方显示
//         .orient("bottom");

//     var y_axis = d3.svg.axis()
//         .scale(y_scale)
//         .orient("left");




//     // 添加画布
//     var svg = d3.select("#timeLineView").append("svg")
//         .attr("id", "time_line_svg")
//         .attr("width", width)
//         .attr("height", height)
//         //transform 属性向元素应用 2D 或 3D 转换。该属性允许我们对元素进行旋转、缩放、移动或倾斜。
//         //translate(x,y)：元素在水平方向和垂直方向同时移动（X轴和Y轴同时移动）；
//         //x表示图形在x方向上移动的距离，默认单位是px。当x为正时，图形向x轴正方向移动；反之；y同理
//         .attr("transform", "translate(" + margin.left + "," + margin.top * 2 + ")");



//     // svg绑定xy轴
//     // timeLineView.axis_g = 
//     svg.append("g")
//         .attr("class", "x axis")
//         .attr("transform", "translate(" + (margin.left + 30) + "," + (height - 20) + ")")
//         .call(x_axis);

//     svg.append("g")
//         .attr("class", "y axis")
//         .attr("transform", "translate(30,20)")
//         .call(y_axis);







//     // 总结：设置并添加曲线
//     // d3.svg.line() 曲线构造器
//     // .x() .y() 构造器会将数据集中的每一个数据传入访问器函数，并使用其返回值作为 x坐标或y坐标：
//     var line = d3.svg.line().x(function (d) {
//         //console.log(parseInt(d.key));
//         return x_scale(parseInt(d.key));
//     }).y(function (d) {
//         //console.log(d.daySum);
//         return y_scale(d.daySum);
//         //.interpolate()定义插值模式，该模式是线性插值，所以我们看到一些直线段将我们提供的各个点连接起来。basis - B样条插值
//     }).interpolate("basis"); //console.log(line);
//     //添加曲线
//     var routes_g = svg.append("g")
//         .attr("transform", "translate(" + (margin.left + 30) + ",20)");

//     var COLOR = ["#CC333F", "#EDC951", "#00A0B0", "#ff5a29", "#2f71b0", "#55ff30", "#570eb0", "#883378"];
//     // 总结：根据传回的数据添加 g?设置曲线颜色，设置显示区域
//     // route_line 是什么？ 整个项目只出现了这一次,指图中的曲线
//     var routes = routes_g.selectAll(".route_line")
//         .data(data)
//         .enter()
//         .append("g")
//          .attr("class", function (d) { return "routes_line route_" + parseInt(d.key)});
//     // 给曲线加颜色透明度那些
//     routes.append("path")
//         .attr('fill', "none")
//         .attr('opacity', 0.6)
//         // stroke() 定义一条线、文本或元素轮廓颜色
//         //颜色选择根据数据的索引按顺序给
//         .attr('stroke', "#9d2933")
//         .attr("stroke-width", 2)
//         .attr("d", function (d) {
//             //console.log(data);
//             // line 是坐标轴的名字 d.values现在存了些什么？
//             return line(data)
//         })
//         // clip-path CSS 属性可以创建一个只有元素的部分区域可以显示的剪切区域。
//         // 区域内的部分显示，区域外的隐藏。剪切区域是被引用内嵌的URL定义的路径或者外部svg的路径，
//         // 就是设置clip_path（下面定义了）的图在区域内显示，区域外不显示？
//         //.attr("clip-path", "url(#clip_path)");
//     // 定义clip_path（显示区域？）
//     // var line_g = svg.append("g")
//     //     .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");
//     // line_g.append("clipPath")
//     //     .attr("id", "clip_path")
//     //     .append("rect")
//     //     .attr({
//     //         width: width,
//     //         height: height
//     //     });

//     // svg.append('path')
//     //     .attr('d', line(data))
//     //     .attr('stroke', 'green')
//     //     .attr('stroke-width', 2)
//     //     .attr('fill', 'none');
//     console.log("time");
// }