var flag = "bar";
var from = "PS-04";
var to = "PS-04";
sendBarReq(from, to, flag);

function sendBarReq(from, to, flag) {
    $.ajax({
        url: "http://localhost:3000/spiralLineData",
        dataType: "json",
        crossDomain: false,
        data: {
            sstartyear: a.getyear,
            sstartmonth: a.getmonth,
            sstartday: a.getday,
            sendyear: a.endYear,
            sendmonth: a.endMonth,
            sendday: a.endDay,
        },
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function() {},
        success: function(data, textStatus) {
            //console.log("timeREQ");
            // data.forEach(function (d) {
            //     // 获得星期几并并插入到数组中，以week来存储
            //     // getUTCDay() 方法以世界时为标准，返回一个指定的日期对象为一星期中的第几天，0 代表星期天
            //     d.week = new Date(d.start_time).getUTCDay();
            // }); //console.log(data);
            barData(data, from, to, flag);
        },
        complete: function() {},
        error: function() {},
    });
}

function barData(data, from, to, flag) {
    var getData = [];
    var limit = 2;
    if (flag == "map") {
        data.forEach(function(d) {
            if (d.from_station_id == from && d.to_station_id == to)
                getData.push({
                    start_time: d.start_time,
                    from_station_id: d.from_station_id,
                    to_station_id: d.to_station_id,
                    user_type: d.user_type
                })
        })
        limit = 0;
    } else getData = data;

    var memberBar = [];
    //   var memberTo = [];
    console.log("getData:根据flag处理后的数据");
    console.log(getData);
    getData.forEach(function(d) {
        if (d.user_type == "Member")
            memberBar.push({ start_time: d.start_time, from_station: d.from_station_id, to_station: d.to_station_id });
    });
    // console.log(memberBar.length);
    var nest = d3.nest().key(function(d) {
        return d.start_time;
    });
    var timeNest = nest.entries(memberBar);
    console.log("timeNest");
    console.log(timeNest);
    // // 在某个时间点,OD分别的使用次数
    // spiralNest.forEach(function (d, i) {
    //   d.values = d.values.length;
    // });
    // console.log('spiralNest');console.log(spiralNest);

    // dateExtent 例：[[6:30],[22:30]]
    // 如果全是普通会员，timeNest就会为空，ateExtent[0]则报错
    if (timeNest.length >= 2)
        var dateExtent = d3.extent(timeNest, function(d) {
            // getDate() setMinute()这些函数的对象是Date对象，所以要将UTC转为date,中国时间
            return new Date(d.key);
        });
    else if (timeNest.length == 1) var dateExtent = [new Date(timeNest[0].key), new Date(timeNest[0].key)];
    else var dateExtent = [a.getdate, a.getdate];
    // 开始时间的分设为0
    dateExtent[0].setMinutes(0);
    // 结束时间分设为0
    dateExtent[1].setMinutes(0);
    // 设置结束时间的时加一，也就是时向上取整时 [[6:00],[23:00]
    dateExtent[1].setHours(dateExtent[1].getHours() + 1);
    console.log(dateExtent);
    //保存三十分钟内的OD
    var data_30min = [];
    // getTime()	返回 1970 年 1 月 1 日至今的毫秒数。 1000毫秒=1秒 以10分为一个增长，暂称为刻度时间
    for (var j = dateExtent[0].getTime(); j <= dateExtent[1].getTime(); j += 1000 * 60 * 30) {
        // var sum = 0;
        // // 如果nest后的数组(test)的start_time在刻度开始时间和刻度结束时间内，对刻度高度和刻度个数进行操作
        // spiralNest.forEach(function (d) {
        //   if (new Date(d.key).getTime() >= i &&new Date(d.key).getTime() < i + 1000 * 60 * 10 ) {
        //     // 计算xx时x0分的值，也就是刻度高度
        //     sum += d.values;
        //   }
        // });
        // // 存储时分向上取整处理后的时间和values值
        // //console.log(new Date(i).setHours(new Date(i).getHours()-8));

        // 解决北京时间和UTC时间的差异
        var oldDate = new Date(j);
        var newDate = oldDate;
        // 返回某天
        var gotDate = oldDate.getDate();
        // changeDate.setHours(new Date(i).getHours() - 8)
        var gotHours = oldDate.getHours();
        if (gotHours > 15) gotHours -= 8;
        else if (gotHours < 15) {
            gotHours += 16;
            newDate.setDate(gotDate - 1);
        }
        // console.log("gotHours:"); console.log(gotHours);
        //console.log("newDate:");console.log(newDate);
        newDate.setHours(gotHours);
        //console.log("lastDate:"); console.log(newDate);
        //console.log(newDate);
        // 每三十分钟的放一个
        //console.log(i);
        timeNest.forEach(function(d) {
            //console.log(new Date(d.key).getTime());

            if (new Date(d.key).getTime() >= j && new Date(d.key).getTime() < j + 1000 * 60 * 30) {
                //console.log(d.values[i].from_station);
                var i = 0;
                var s = 0;
                for (i = 0; i < d.values.length; i++) {
                    // s = d.values[i].length;
                    data_30min.push({ date: newDate, from: d.values[i].from_station, to: d.values[i].to_station });
                }
            }
        });
    }
    console.log(data_30min);
    // 为了统计三十分钟内O D的最大值
    var nest = d3.nest()
        .key(function(d) { return d.date; })
        .key(function(d) { return d.from; });
    var from_30min = nest.entries(data_30min);

    var nest = d3.nest()
        .key(function(d) { return d.date; })
        .key(function(d) { return d.to; });
    var to_30min = nest.entries(data_30min);
    console.log(from_30min);
    console.log(to_30min);
    // 半小时内 OD最大值和ID
    var from = [];
    var to = [];
    // 统计 30分钟时间内和起点站的个数   时间，id,个数
    from_30min.forEach(function(d) {
        var i = 0;
        var maxSum = 0;
        var maxID = 'PS-04';
        for (i = 0; i < d.values.length; i++) {
            if (d.values[i].values.length > maxSum) {
                maxSum = d.values[i].values.length;
                maxID = d.values[i].key;
            }
        }
        var hour = new Date(d.key).getHours().toString();
        // console.log("hour1");
        // console.log(hour);
        if (hour.length == 1) hour = '0' + hour;
        // console.log("hour2");
        // console.log(hour);
        var minute = new Date(d.key).getMinutes().toString();
        if (minute == "0") minute = "00";
        from.push({
            timeinFrom: d.key,
            fromStation: maxID,
            fromSum: maxSum,
            hminFrom: hour + ':' + minute
        });
    });
    // 存开始时间 toStation，toSum 字符串型的时分到to数组
    to_30min.forEach(function(d) {
        var i = 0;
        var maxSum = 0;
        var maxID = 'P';
        for (i = 0; i < d.values.length; i++) {
            if (d.values[i].values.length > maxSum) {
                maxSum = d.values[i].values.length;
                maxID = d.values[i].key;
            }
        }
        var hour = new Date(d.key).getHours().toString();
        //console.log(hour);
        if (hour.length == 1) hour = '0' + hour;
        var minute = new Date(d.key).getMinutes().toString();
        if (minute == "0") minute = "00";
        to.push({ timeinTo: d.key, toStation: maxID, toSum: maxSum, hminTo: hour + ':' + minute });
        // for (i = 0; i < d.values.length; i++)
        //     to.push({ time: d.key, station: d.values[i].key, Sum: d.values[i].values.length });
    });
    // 整合相同时间的to from数据到一个数组
    var ftdata = [];

    for (var i = 0; i < to_30min.length; i++) {
        console.log("limit");
        console.log(limit);
        if (from[i].hminFrom == to[i].hminTo && (from[i].fromSum > limit || to[i].toSum > limit)) {
            //console.log(from_30min[i]);
            // if (from[i].fromSum < 3) from[i].fromSum = 0;
            // if (to[i].toSum < 3) to[i].toSum = 0;
            ftdata.push({
                time: from[i].hminFrom,
                fromID: from[i].fromStation,
                fromSum: from[i].fromSum,
                toID: to[i].toStation,
                toSum: to[i].toSum
            });
        }
    }
    //有出现15:30在8:00前等类似的情况，所以sort一下
    ftdata.sort(function(a, b) {
        if (a.time < b.time) {
            return -1;
        } else if (a.time == b.time) {
            return 0;
        } else {
            return 1;
        }
    });
    // ftdata.push(from);
    // ftdata.push(to);
    // console.log(from);
    // console.log(to);
    // console.log(typeof(from[0].hm));
    //console.log(ftdata);
    drawBar(ftdata);
}



//   var i = 0;
//   var Data = [];
//   drawData.forEach(function (d) {
//     // var useTime = d.values.length;
//     // drawData.push({ key: d.key, useTime: useTime})
//     //d.values[i].dayTotal=useTime;
//     //   var useTime = d.values.length;
//     // for (i = 0; i < useTime;i++)
//     //     d.values[i].daySum = useTime;

//     Data.push({ key: d.key, daySum: d.values.length });
//   });

// drawtime(ftdata);
//   console.log(drawData);
//   console.log(Data);
// }

function drawBar(data) {
    console.log("Bardata:画bar的数据");
    console.log(data);
    if (d3.select("#bar_svg")) d3.select("#bar_svg").remove();
    var time_line_wh = $("#barView");
    //#time_line 各个方向减20
    var margin = { top: 0, right: 0, bottom: 10, left: 0 },
        width = time_line_wh.width() - margin.left - margin.right,
        height = time_line_wh.height() - margin.top - margin.bottom;

    var colorRange = d3.scale.category20();
    var color = d3.scale.ordinal()
        .range(colorRange.range());

    // number of samples
    var n = data.length;
    // number of series
    var m = 2;
    // options存储变量名不为time ID的(即fromSum,toSum)的变量名
    var options = d3.keys(data[0]).filter(function(key) { return (key !== "time" && key !== "fromID" && key !== "toID"); });

    data.forEach(function(d) {
        d.valores = options.map(function(name) { return { name: name, value: +d[name] }; });

        // for (var i = 0; i < d.valores.length; i++) {
        d.valores[0].OD = d.fromID;
        d.valores[1].OD = d.toID;
        //}
    });
    console.log("data：统计了valores的画bar的数据");
    console.log(data);
    // console.log(data[0].valores);
    // console.log(data[1].valores);
    var y = d3.scale.linear()
        .domain([0, d3.max(data, function(d) {
            return d3.max(d.valores, function(d) { return d.value; });
        })])
        .range([height - 40, 0]);

    //设置X轴的比例尺
    var x0 = d3.scale.ordinal()
        .domain(data.map(function(d) { return d.time; }))
        // .2为每个时刻之间 矩形组的间距
        .rangeBands([0, width - 50], .2);

    ///console.log(x0.rangeBand()); //上面每一个区间间隔的长度

    //设置一个比例尺来求得四个小rect在一个区间的占的长度
    var x1 = d3.scale.ordinal()
        .domain(options)
        // .rangeBands([0, x0.rangeBand()]);
        .rangeRoundBands([0, x0.rangeBand()]);
    //设置颜色的比例尺
    var z = d3.scale.category10();



    //x轴的比例尺
    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");
    //y轴比例尺
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    //添加svg并且设置宽高并且添加一个g和偏移
    var svg = d3.select("#barView").append("svg")
        .attr("id", "bar_svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + 13 + ")");








    //添加一个y轴的分组标签
    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(30,10)")
        .call(yAxis);
    //
    //添加一个x周到分组标签
    svg.append("g")
        .attr("class", "x axis")

    .attr("transform", "translate(" + (margin.left + 30) + "," + (height - 30) + ")")
        .call(xAxis)
        .selectAll("text")
        .style("font-size", "10px");
    // .style("text-anchor", "start")
    // .attr("transform", "rotate(45 -10 10)");
    // var color = ["#FFD700", "#9d2933", "#FFD700", "#9d2933", "#FFD700", "#9d2933"];

    // svg.append('g') //添加一个分组g标签
    //     .selectAll('g') //选择所有g元素
    var bar = svg.selectAll(".bar")
        .data(data) //绑定数据	即二维数组中的个数4
        .enter() //添加数据的标志
        .append("g") //添加g元素，也就是数据绑定元素
        .attr("class", "rect")
        // .style('fill', function(d) { //4个元素添加不同颜色。
        //     return z(d.name);
        // })
        .attr("transform", function(d) { //然后移动g标签	
            // console.log(i);
            return "translate(" + x0(d.time) + ",-20)"; //x1比例尺的范围是x0的rangeband即一个的区间范围
        })

    bar.selectAll("rect") //选择所有的rect，下面将要在每一个g标签里面开始添加20个rect
        .data(function(d) {
            return d.valores; //这里面的每一个d都是一个长度为20的一维数组。
        })
        .enter() //根据数据开始添加rect
        .append("rect")
        .attr("width", x1.rangeBand()) //设置x1的rangBand()宽度。
        .attr("height", function(d) { return (height - y(d.value) - 40); }) //设置rect高度 
        .attr("x", function(d) { return x1(d.name) + 30; }) //设置rect的x坐标。
        .attr("y", function(d) { return y(d.value) + 30; }) //设置y的所在位置
        .attr("value", function(d) { return d.name; })
        .on("click", function(d) {
            mainChart.data_point.features.forEach(function(s) {
                if (s.properties.station_id === d.OD) {
                    map.flyTo({ center: s.geometry.coordinates });
                    if (mainChart.Msg_pop)
                        mainChart.Msg_pop.remove();
                    var description = 'NAME:' + s.properties.description + '<p>' + 'ID:' + s.properties.station_id;
                    mainChart.Msg_pop = new mapboxgl.Popup()
                        .setLngLat(s.geometry.coordinates)
                        .setHTML(description)
                        .addTo(map);
                }
            });
        })
        .style("fill", function(d) { return color(d.name); });



    var texts = bar.selectAll(".MyText")
        .data(function(d) {
            return d.valores; //这里面的每一个d都是一个长度为20的一维数组。
        })
        .enter()
        .append("text")
        .attr("class", "MyText")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("x", function(d) { return x1(d.name) + 30; }) //设置rect的x坐标。
        .attr("y", function(d) { return y(d.value) + 30; }) //设置y的所在位置
        // .attr("dx", function() {
        //     return (xScale.rangeBand() - rectPadding) / 2;
        // })
        // .attr("dy", function(d) {
        //     return 20;
        // })
        .attr("font-size", 7)
        .on("click", function(d) {
            mainChart.data_point.features.forEach(function(s) {
                if (s.properties.station_id === d.OD) {
                    map.flyTo({ center: s.geometry.coordinates });
                    if (mainChart.Msg_pop)
                        mainChart.Msg_pop.remove();
                    var description = 'NAME:' + s.properties.description + '<p>' + 'ID:' + s.properties.station_id;
                    mainChart.Msg_pop = new mapboxgl.Popup()
                        .setLngLat(s.geometry.coordinates)
                        .setHTML(description)
                        .addTo(map);
                }
            });
        })
        .text(function(d) {
            return d.OD;
        });

    var Color = ["#1F77B4", "#AEC7E8"];
    var labels = ["O", "D"];
    var legend_div = d3.select("#bar").append("div")
        .attr("id", "bar_label")
        .style({
            "position": "absolute",
            "z-index": "999",
            "right": "5px",
            "top": "15px"
        })
        .selectAll("label label-default legend_label")
        .data(labels)
        .enter()
        .append("span")
        .attr("class", "label label-default legend_label")
        .style({
            "background-color": function(d, i) {
                return Color[i];
            },
            "cursor": "pointer",
            "margin": "7px",
            "curos-events": "none"
        })
        .html(function(d) {
            return d;
        });

    // var tooltip = d3.select("#bar")
    //     .append("div")
    //     .attr("class", "tooltip")
    //     .style("opacity", 0.0);

    // bar.on("mouseover", function(d) {
    //         /*
    //         鼠标移入时，
    //         	（1）通过 selection.html() 来更改提示框的文字
    //         	（2）通过更改样式 left 和 top 来设定提示框的位置
    //         	（3）设定提示框的透明度为1.0（完全不透明）
    //         	*/

    //         tooltip.html(d.data[0] + "的出货量为" + "<br />" +
    //                 d.data[1] + " 百万台")
    //             .style("left", (d3.event.pageX) + "px")
    //             .style("top", (d3.event.pageY + 20) + "px")
    //             .style("opacity", 1.0);
    //     })
    //     .on("mousemove", function(d) {
    //         /* 鼠标移动时，更改样式 left 和 top 来改变提示框的位置 */

    //         tooltip.style("left", (d3.event.pageX) + "px")
    //             .style("top", (d3.event.pageY + 20) + "px");
    //     })
    //     .on("mouseout", function(d) {
    //         /* 鼠标移出时，将透明度设定为0.0（完全透明）*/

    //         tooltip.style("opacity", 0.0);
    //     })
    // // console.log(width);
    // // console.log(height);
    // //console.log(new Date(2016, 0, 1));
    // // 定制时间比例尺
    // //??? d3.extent()返回装有最大值和最小值的数组：data中 start_date_time 的最大值和最小值
    // var date_extent = d3.extent(data, function(d) {
    //     //console.log(d.time);
    //     // 不new Date则送到date_extent里面的是string,d3.time.scale()处理的是date2
    //     return new Date(d.time);
    // });
    // // console.log(typeof(date_extent[0]));
    // // console.log(new Date(2016, 0, 1));
    // //x轴比例尺
    // var sum_extent = d3.extent(data, function(d) {
    //     return d.Sum;
    // });
    // var x_scale = d3.time.scale()
    //     .domain(date_extent)
    //     .range([0, width]);
    // //x_scale(new Date());
    // var y_scale = d3.scale.linear()
    //     .domain(sum_extent)
    //     .range([height - 40, 0]);

    // var x_axis = d3.svg.axis()
    //     .scale(x_scale)
    //     .tickFormat(d3.time.format("%H:%M"))
    //     .orient("bottom");

    // var y_axis = d3.svg.axis()
    //     .scale(y_scale)
    //     .orient("left");

    // // 添加画布
    // var svg = d3.select("#barView")
    //     .append("svg")
    //     .attr("id", "bar_svg")
    //     .attr("width", width)
    //     .attr("height", height)
    //     //transform 属性向元素应用 2D 或 3D 转换。该属性允许我们对元素进行旋转、缩放、移动或倾斜。
    //     //translate(x,y)：元素在水平方向和垂直方向同时移动（X轴和Y轴同时移动）；
    //     //x表示图形在x方向上移动的距离，默认单位是px。当x为正时，图形向x轴正方向移动；反之；y同理
    //     .attr("transform", "translate(" + margin.left + "," + margin.top + 10 + ")");

    // // svg绑定xy轴
    // // timeLineView.axis_g =
    // svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(" + (margin.left + 30) + "," + (height - 30) + ")")
    //     .call(x_axis);

    // svg.append("g")
    //     .attr("class", "y axis")
    //     .attr("transform", "translate(30,10)")
    //     .call(y_axis);

    // // 总结：设置并添加曲线
    // // d3.svg.line() 曲线构造器
    // // .x() .y() 构造器会将数据集中的每一个数据传入访问器函数，并使用其返回值作为 x坐标或y坐标：
    // var line = d3.svg.line()
    //     .x(function(d) {
    //         // console.log(typeof(new Date(d.time)));
    //         // console.log(new Date(d.time));
    //         return x_scale(new Date(d.time));
    //     })
    //     .y(function(d) {
    //         //console.log(d.Sum);
    //         return y_scale(d.Sum);
    //         //.interpolate()定义插值模式，该模式是线性插值，所以我们看到一些直线段将我们提供的各个点连接起来。basis - B样条插值
    //     })
    //     .interpolate("basis"); //console.log(line);
    // //添加曲线
    // var routes_g = svg.append("g")
    //     .attr("transform", "translate(" + (margin.left + 30) + ",10)");
    // var color = ["#FFD700", "#9d2933"];
    // var COLOR = [
    //     "#CC333F",
    //     "#EDC951",
    //     "#00A0B0",
    //     "#ff5a29",
    //     "#2f71b0",
    //     "#55ff30",
    //     "#570eb0",
    //     "#883378",
    // ];
    // // 总结：根据传回的数据添加 g?设置曲线颜色，设置显示区域
    // // route_line 是什么？ 整个项目只出现了这一次,指图中的曲线
    // var routes = routes_g.selectAll("._line")
    //     .data(data)
    //     .enter()
    //     .append("g")
    //     .attr("class", function(d) {
    //         return "_line _" + new Date(d.time);
    //     });
    // // 给曲线加颜色透明度那些
    // routes.append("path")
    //     .attr('fill', "none")
    //     .attr('opacity', 0.6)
    //     .attr('stroke', function(d, i) {
    //         return color[i];
    //     })
    //     .attr("stroke-width", 2)
    //     .attr("d", function(d) {
    //         return line(data)
    //     });
    // // clip-path CSS 属性可以创建一个只有元素的部分区域可以显示的剪切区域。
    // // 区域内的部分显示，区域外的隐藏。剪切区域是被引用内嵌的URL定义的路径或者外部svg的路径，
    // // 就是设置clip_path（下面定义了）的图在区域内显示，区域外不显示？
    // //.attr("clip-path", "url(#clip_path)");
    // // 定义clip_path（显示区域？）
    // // var line_g = svg.append("g")
    // //     .attr("transform", "translate(" + margin.left + "," + (margin.top) + ")");
    // // line_g.append("clipPath")
    // //     .attr("id", "clip_path")
    // //     .append("rect")
    // //     .attr({
    // //         width: width,
    // //         height: height
    // //     });

    // // svg.append('path')
    // //     .attr('d', line(data))
    // //     .attr('stroke', 'green')
    // //     .attr('stroke-width', 2)
    // //     .attr('fill', 'none');
    // // console.log("time");
}