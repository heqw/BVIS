var station_id = "PS-04";
sendRadarReq(station_id);

function sendRadarReq(station_id) {
    // 请求某天的trips数据
    $.ajax({
        url: "http://localhost:3000/spiralLineData",
        dataType: 'json',
        crossDomain: false,
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
        success: function(data, textStatus) {
            handleRadarData(station_id, data);
        },
        complete: function() {},
        error: function() {}
    });
}

function handleRadarData(station_id, data) {
    // 分别存放作为O、D时的信息
    var fromStation = [];
    var toStation = [];
    data.forEach(function(d) {
            if (d.from_station_id == station_id)
                fromStation.push({ time: new Date(d.start_time), id: station_id });
            else if (d.to_station_id == station_id)
                toStation.push({ time: new Date(d.stop_time), id: station_id });
        })
        // console.log(fromStation);
        // console.log(toStation);
    drawRadar(fromStation, toStation);
}



function drawRadar(fromStation, toStation) {
    // 添加radar的div？ 应该是站点标签的？？
    var legend = d3.select("#radar")
        .append("div")
        .style({
            "position": "absolute",
            "top": "26px",
            "right": "5px"
        })
        .append("span")
        .attr("id", "radar_main_id")
        .attr("class", "label label-default legend_label")
        // #07a6ff" 蓝色
        .style("background-color", "#696969")
        .html(fromStation[0].id);

    //下方 站点颜色的div？
    var route_legend = d3.select("#radar")
        .append("div")
        .style({
            "position": "absolute",
            "top": "48px",
            "right": "5px"
        })
        .append("span")
        .attr("id", "radar_route_id")
        .attr("class", "label label-default legend_label")
        .style({
            // 深蓝色
            "background-color": "#1a163c",
            "display": "none"
        });

    // function update_radar(station_id) {

    var radarChart = {};
    // // 找到经过该站点的路线信息
    // station_info.forEach(function(d) {
    //     if (d.station_id == station_id)
    //         radarChart.station_data = d;
    // });

    // 给标签加内容
    // var station_name = radarChart.station_data.station_name;

    // d3.select("#radar_main_id").html(station_name)

    // var routes_id = radarChart.station_data.sub_routes_id.split(",");

    var radarData = [];
    // routes_id.forEach(function(route_id) {
    var fromData = [];
    var toData = [];
    // 存储24小时对应的开始骑行次数
    var fromCount = [24];
    for (var i = 0; i < 24; i++) fromCount[i] = 0;
    var toCount = [24];
    for (var i = 0; i < 24; i++) toCount[i] = 0;
    // 通过station_id,route_id,date_extent请求数据
    // var route_data = route_query(station_id, route_id, date_extent);

    // fromStation.forEach(function(d) {
    //     // 分：29舍，30入  秒：0
    //     if (d.time.getMinutes() >= 30) {
    //         d.time.setHours(d.time.getHours() + 1);
    //         d.time.setMinutes(0, 0);
    //     } else
    //         d.time.setMinutes(0, 0);
    //     // 累积求和该小时段的开始骑行次数
    //     fromCount[d.time.getHours()]++;
    // });
    // for (i = 0; i < 24; i++) {
    //     fromData.push({
    //         // 处理个位小时 即8点变为08点
    //         axis: (i < 10) ? ("0" + i) : i,
    //         value: fromCount[i],
    //         route_id: fromStation[0].id
    //     });
    // }

    // toStation.forEach(function(d) {
    //     // 分：29舍，30入  秒：0
    //     console.log(d.time);
    //     if (d.time.getMinutes() >= 30) {
    //         d.time.setHours(d.time.getHours() + 1);
    //         d.time.setMinutes(0, 0);
    //     } else
    //         d.time.setMinutes(0, 0);
    //     // 累积求和该小时段的开始骑行次数
    //     toCount[d.time.getHours()]++;
    // });
    // for (i = 0; i < 24; i++) {
    //     toData.push({
    //         // 处理个位小时 即8点变为08点
    //         axis: (i < 10) ? ("0" + i) : i,
    //         value: toCount[i],
    //         route_id: toStation[0].id
    //     });
    // }

    fromStation.forEach(function(d) {
        // 分：29舍，30入  秒：0
        // if (d.time.getMinutes() >= 30) {
        //     d.time.setHours(d.time.getHours() + 1);
        //     d.time.setMinutes(0, 0);
        // } else
        d.time.setMinutes(0, 0);
        // 累积求和该小时段的开始骑行次数
        var hour = d.time.getHours();
        if (hour >= 8) hour -= 8;
        else if (hour < 8) hour += 16;
        fromCount[hour]++;
    });
    for (i = 0; i < 24; i++) {
        fromData.push({
            // 处理个位小时 即8点变为08点
            axis: (i < 10) ? ("0" + i) : i,
            value: fromCount[i],
            route_id: fromStation[0].id,
            key: "借出"
        });
    }

    // 注意：数据中的时间和本来时间相差八小时
    toStation.forEach(function(d) {
        // 分：29舍，30入  秒：0
        // console.log(d.time);
        // if (d.time.getMinutes() >= 30) {
        //     d.time.setHours(d.time.getHours() + 1);
        //     d.time.setMinutes(0, 0);
        // } else
        // d.time.setMinutes(0, 0);
        // // 累积求和该小时段的开始骑行次数
        // toCount[d.time.getHours()]++;
        var hour = d.time.getHours();
        if (hour >= 8) hour -= 8;
        else if (hour < 8) hour += 16;
        toCount[hour]++;
    });
    for (i = 0; i < 24; i++) {
        toData.push({
            // 处理个位小时 即8点变为08点
            axis: (i < 10) ? ("0" + i) : i,
            value: toCount[i],
            route_id: toStation[0].id,
            key: "归还"
        });
    }

    radarData.push(fromData);
    radarData.push(toData);
    console.log(radarData);
    console.log(fromStation.length);
    console.log(toStation.length);
    // });radar_data

    var COLOR = ["#1F77B4", "#AEC7E8", "#00A0B0", "#ff5a29", "#2f71b0", "#55ff30", "#570eb0", "#883378"];
    var radar = $("#radarView");
    var width = radar.width();
    var height = radar.height();

    var margin = { top: 10, right: 10, bottom: 10, left: 10 };

    var radarChartOptions = {
        w: width,
        h: height,
        levels: 5,
        roundStrokes: true,
        color: COLOR
    };

    // //Call function to draw the Radar chart
    // RadarChart("#radar_main", radar_data, radarChartOptions);

    // function RadarChart(id, data, options) {

    var cfg = {
        w: 600,
        h: 600,
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
        levels: 3,
        maxValue: 0,
        labelFactor: 1.25,
        wrapWidth: 60,
        opacityArea: 0.15,
        dotRadius: 4,
        opacityCircles: 0.2,
        strokeWidth: 2,
        roundStrokes: false,
        color: d3.scale.category10()
    };

    //Put all of the options into a variable called cfg
    if ('undefined' !== typeof radarChartOptions) {
        for (var i in radarChartOptions) {
            if ('undefined' !== typeof radarChartOptions[i]) {
                cfg[i] = radarChartOptions[i];
            }
        } //for i
    } //if

    // map() 方法返回一个新数组， 数组中的元素为原始数组元素调用函数处理后的值。
    // map() 方法按照原始数组元素顺序依次处理元素。
    // 注意： map() 不会对空数组进行检测。
    // 注意： map() 不会改变原始数组。
    // maxValue应该是停留时间的最大值
    //If the supplied maxValue is smaller than the actual one, replace by the max in the data
    var maxValue = Math.max(cfg.maxValue, d3.max(radarData, function(i) { return d3.max(i.map(function(o) { return o.value; })) }));

    // allAxis存储时间？08 09 10
    var allAxis = (radarData[0].map(function(i, j) { return i.axis })), //Names of each axis
        total = allAxis.length, //The number of different axes
        radius = Math.min((cfg.w / 2 - 2 * (cfg.margin.right + cfg.margin.left)), (cfg.h / 2 - 2 * (cfg.margin.top + cfg.margin.bottom))), //Radius of the outermost circle
        // angleSlice每一小份的角度
        angleSlice = Math.PI * 2 / total; //The width in radians of each "slice"

    //Scale for the radius
    var rScale = d3.scale.linear()
        .range([0, radius])
        .domain([0, maxValue]);

    d3.select("#radarView").select("svg").remove();

    //Initiate the radar chart SVG
    var svg = d3.select("#radarView").append("svg")
        .attr("width", cfg.w)
        .attr("height", cfg.h)
        .attr("class", "radar" + "#radarView");
    //Append a g element
    var g = svg.append("g").attr("transform", "translate(" + (cfg.w / 2) + "," + (cfg.h / 2) + ")");

    // 这翻译为 外部辉光过滤器
    //Filter for the outside glow
    var filter = g.append('defs').append('filter').attr('id', 'glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '1').attr('result', 'coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Wrapper 包装
    //Wrapper for the grid & axes
    var axisGrid = g.append("g").attr("class", "axisWrapper");

    // 画圆环？
    //Draw the background circles
    axisGrid.selectAll(".levels")
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter()
        .append("circle")
        .attr("class", "gridCircle")
        .attr("r", function(d, i) { return radius / cfg.levels * d; })
        .style({
            "fill": "none",
            // #ffffff白色
            "stroke": "#696969",
            "stroke-opacity": 0.5,
            "fill-opacity": cfg.opacityCircles,
            // "filter": "url(#glow)"
        });

    // 圆环外圈的时间
    var axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");

    // 直线
    //Append the lines
    axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function(d, i) { return rScale(maxValue) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr("y2", function(d, i) { return rScale(maxValue) * Math.sin(angleSlice * i - Math.PI / 2); })
        .attr("class", "line")
        .style({
            // 较深的灰色
            "stroke": "	#696969",
            "stroke-width": "1px",
            "stroke-opacity": 0.5
        })

    // ？？干嘛的  加上时间标签？？
    axis.append("text")
        .attr("class", "axis_legend")
        .style("font-size", "8px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.15em")
        .attr("x", function(d, i) { return rScale(maxValue * 0.88 * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr("y", function(d, i) { return rScale(maxValue * 0.88 * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); })
        .text(function(d) { return d })
        .call(wrap, cfg.wrapWidth);

    // 画 时间-停留时间 那一圈线
    // 曲线构造器
    var radarLine = d3.svg.line.radial()
        // basis-closed - B样条插值，连接起点终点形成多边形
        .interpolate("cardinal-closed")
        .radius(function(d) { return rScale(d.value); })
        .angle(function(d, i) { return i * angleSlice; });

    if (cfg.roundStrokes) {
        radarLine.interpolate("cardinal-closed");
    }
    // 彩色标注的提示信息
    var legend_id = [];

    // 按每根曲线最大停留时间升序排列？
    // radarData.sort(function(a, b) {
    //     return d3.max(a, function(o) { return o.value; }) - d3.max(b, function(o) { return o.value; })
    // }).reverse();

    radarData.forEach(function(d) {
        legend_id.push(d[0].key);
    });

    console.log(legend_id);

    // blobWrapper每一条曲线的 g，包括透明部分和边缘的彩线
    //Create a wrapper for the blobs
    var blobWrapper = g.selectAll(".radar")
        .data(radarData)
        .enter()
        .append("g")
        .attr("class", function(d, i) {
            return "radar_" + d[0].key;
        });

    //Append the backgrounds
    blobWrapper
        .append("path")
        .attr("class", "radarArea")
        // 画每一条线，radarLine是曲线生成器
        .attr("d", function(d, i) { return radarLine(d); })
        .style("fill", function(d, i) { return cfg.color[i % 8]; })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function(d, i) {
            //Bring back the hovered over blob
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", 0.7);
            // radar_route_id是添加的span
            d3.select("#radar_route_id").transition().duration(200).style("display", "block");
            $("#radar_route_id")[0].innerHTML = d[0].key;
            //visibility:hidden;
        })
        .on('mouseout', function() {
            d3.select("#radar_route_id").transition().duration(200).style("display", "none");
            //Bring back all blobs
            d3.select(this)
                .transition().duration(200)
                .style("fill-opacity", cfg.opacityArea);
        });



    //Create the outlines
    blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", function(d, i) { return radarLine(d); })
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", function(d, i) { return COLOR[i % 8]; })
        .style("fill", "none")
        //添加滤镜模糊效果
        // .style("filter", "url(#glow)");

    // 画下方彩色方块
    var legendElementWidth = 15;
    var gridSize = 10;
    var legend_g = svg.append("g");

    var legend = legend_g.selectAll(".radar_legend")
        .data(legend_id)
        .enter()
        .append("rect")
        .attr("id", function(d) {
            return "rect_legend_" + d
        })
        .attr("class", "radar_legend")
        .attr("x", function(d, i) {
            return i * 20;
        })
        .attr("y", function(d, i) {
            return cfg.h - cfg.margin.bottom;
        })
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("width", legendElementWidth)
        .attr("height", gridSize)
        .attr("opacity", 1)
        .style("fill", function(d, i) { return radarChartOptions.color[i % 8]; })
        .on("mouseover", function(d, i) {
            d3.select("#radar_route_id").transition().duration(200).style("display", "block");
            //.innerHTML  也可以对某对象插入内容，如 document.getElementById(‘abc’).innerHTML=’这是被插入的内容’
            $("#radar_route_id")[0].innerHTML = d;
            if (d3.select(this).attr("opacity") == 1) {
                legend_id.forEach(function(value) {
                    if (d != value)
                        d3.select(".radar_" + value).attr("opacity", 0.3);
                });
            }
        })
        .on("mouseout", function(d) {
            d3.select("#radar_route_id").transition().duration(200).style("display", "none");
            legend_id.forEach(function(value) {
                d3.select(".radar_" + value).attr("opacity", 1);
            });
        })
        .on("click", function(d) {
            if (d3.select(this).attr("opacity") == 1) {
                d3.select(this).transition().duration(200).attr("opacity", 0.2);
                d3.select(".radar_" + d).transition().duration(200).attr("visibility", "hidden");
            } else {
                d3.select(this).transition().duration(200).attr("opacity", 1);
                d3.select(".radar_" + d).transition().duration(200).attr("visibility", "visible");
            }
        });
    // 这是？？
    var offset_legend = cfg.w / 2 - d3.select("#rect_legend_" + legend_id[parseInt(legend_id.length / 2)]).attr("x");
    if (legend_id.length % 2)
        legend_g.attr("transform", "translate(" + (offset_legend - legendElementWidth / 2) + ",-10)");
    else
        legend_g.attr("transform", "translate(" + (offset_legend + 2.5) + ",-10)");
    //Wraps SVG text
    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
                y = text.attr("y"),
                x = text.attr("x"),
                dy = parseFloat(text.attr("dy")),
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    } //wrap

    // } //RadarChart
    // }
}