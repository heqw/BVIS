//保存一天的trip数据，map画轨迹也会用到

sendspiralReq();

function sendspiralReq() {
    $.ajax({
        url: "http://localhost:3000/spiralLineData",
        dataType: 'json',
        crossDomain: false,
        //  data: { 
        //      sstartyear: a.weekStartYear,
        //      sstartmonth: a.weekStartMonth,
        //      sstartday:a.weekStartDay,
        //      sendyear:a.weekEndYear,
        //      sendmonth:a.weekEndMonth,
        //      sendday:a.weekEndDay
        // },
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
            // console.log(a.getyear, a.getmonth, a.getday, a.endYear, a.endMonth, a.endDay);
            // console.log(data);
            handleSpiralTime(data);
        },
        complete: function() {},
        error: function() {}
    });
}

function handleSpiralTime(data) {
    // console.log('data'); //console.log(data);
    var memberspiral = [];
    var shortspiral = [];
    data.forEach(function(d) {
        if (d.user_type == "Member") memberspiral.push({ start_time: d.start_time });
        else shortspiral.push({ start_time: d.start_time });
    })
    spiralData = [];
    spiralData.push(memberspiral);
    spiralData.push(shortspiral);
    //dayTripInfo = data; console.log('dayTripInfo'); console.log(dayTripInfo);
    var nest = d3.nest().key(function(d) {
        return d.start_time;
    });
    var spiralNest = nest.entries(memberspiral);
    // 在某个时间点所有单车的使用次数
    spiralNest.forEach(function(d, i) {
        d.values = d.values.length;
    });
    // console.log('spiralNest');console.log(spiralNest);

    // dateExtent 例：[[6:30],[22:30]]
    var dateExtent = d3.extent(spiralNest, function(d) {
        // getDate() setMinute()这些函数的对象是Date对象，所以要将UTC转为date,中国时间
        return new Date(d.key);
    }); //console.log(dateExtent);
    // 开始时间的分设为0
    dateExtent[0].setMinutes(0);
    // 结束时间分设为0
    dateExtent[1].setMinutes(0);
    // 设置结束时间的时加一，也就是时向上取整时 [[6:00],[23:00]
    dateExtent[1].setHours(dateExtent[1].getHours() + 1);

    var data_10min = [];
    // getTime()	返回 1970 年 1 月 1 日至今的毫秒数。 1000毫秒=1秒 以10分为一个增长，暂称为刻度时间
    for (var i = dateExtent[0].getTime(); i <= dateExtent[1].getTime(); i += 1000 * 60 * 10) {
        var sum = 0;
        // 如果nest后的数组(test)的start_time在刻度开始时间和刻度结束时间内，对刻度高度和刻度个数进行操作
        spiralNest.forEach(function(d) {
            if (new Date(d.key).getTime() >= i && new Date(d.key).getTime() < i + 1000 * 60 * 10) {
                // 计算xx时x0分的值，也就是刻度高度
                sum += d.values;
            }
        });
        // 存储时分向上取整处理后的时间和values值  
        //console.log(new Date(i).setHours(new Date(i).getHours()-8));
        var oldDate = new Date(i);
        var newDate = oldDate;

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
        data_10min.push({ date: newDate, value: sum });
    }

    drawSpiral(data_10min);

    // console.log("data_10min:");
    // console.log( data_10min);
}

function drawSpiral(data_10min) {
    var spiralLine = $("#spiralLine");
    var width = spiralLine.width();
    var height = spiralLine.height();
    var start = 0,
        stop = 2.25,
        numSpirals = 3;
    var theta = function(r) {
        return numSpirals * Math.PI * r;
    };
    var r = d3.min([width, height]) / 2 - 25;
    // start = 0,stop = 2.25
    var radius = d3.scale.linear()
        .domain([start, stop])
        .range([20, r + 3]);


    // 设置svg画布
    var svg = d3.select("#spiralLine").append("svg")
        .attr("id", "spiral_svg")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(0," + 0 + ")");

    var g = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 1.8 + ")");

    // .range(start,stop,step)
    // 以start为起点，以stop为终点，以step为前后项的差值 等差数列
    // points是一个等差数列
    var points = d3.range(start, stop + 0.001, (stop - start) / 1000);

    // d3.svg.line.radial()放射式线段生成器
    // 那一圈细线？ 角度是一个theta函数？半径是刻度尺，输入为[0,2.25]([start,stop]),输出为[20,spiral_line宽高最小的一半 ]（[20,r]）
    var spiral = d3.svg.line.radial()
        .interpolate("cardinal")
        .angle(theta)
        .radius(radius);

    // 往svg添加螺旋线
    var path = g.append("path")
        // .datum( )绑定一个数据到选择集上
        .datum(points)
        .attr("id", "spiral")
        .attr("d", spiral)
        .style("fill", "none")
        .style("stroke", "#9d2933");

    // getTotalLength()在节点上工作,但路径是D3选择,而不是DOM元素本身.所以,你必须使用path.node().
    // getTotalLength() 获取路径总长度
    var spiralLength = path.node().getTotalLength(),
        N = data_10min.length,
        // 为森么要-1？？？？？？
        barWidth = (spiralLength / N) - 1;

    // 根据螺旋线长度设定x比例尺
    // d3.time.scale()针对日期和时间值的一个比例尺方法，可以对日期刻度作特殊处理。
    var timeScale = d3.time.scale()
        // 输入间隔十分钟的数组
        .domain(d3.extent(data_10min, function(d) {
            return d.date;
        }))
        .range([0, spiralLength]);

    // 矩形的比例尺
    var yScale = d3.scale.linear()
        .domain([0, d3.max(data_10min, function(d) {
            return d.value;
        })])
        // r为宽高最小值的一半 numSpirals=3
        .range([0, (r / numSpirals) - 10]);
    g.selectAll("rect")
        .data(data_10min)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {

            var linePer = timeScale(d.date),
                //使用 getPointAtLength 获取当前坐标
                posOnLine = path.node().getPointAtLength(linePer),
                angleOnLine = path.node().getPointAtLength(linePer - barWidth);

            d.linePer = linePer;
            d.x = posOnLine.x;
            d.y = posOnLine.y;
            // Math.atan2() 返回从原点(0,0)到(x,y)点的线段与x轴正方向之间的平面角度(弧度值),也就是Math.atan2(y,x)
            // *180/Math.PI  转换为角度
            // 为什么要 -90？？
            d.a = (Math.atan2(angleOnLine.y, angleOnLine.x) * 180 / Math.PI) - 90;
            return d.x;
        })
        .attr("y", function(d) {
            return d.y;
        })
        .attr("width", function(d) {
            return barWidth;
        })
        .attr("height", function(d) {
            return yScale(d.value);
        })
        .style({
            "fill": "#9d2933",
            "stroke": "none"
        })
        .attr("transform", function(d) {
            return "rotate(" + d.a + "," + d.x + "," + d.y + ")";
        })

    var tF = d3.time.format("%H:%M"),
        firstInMonth = {};

    //显示几点几点 
    g.selectAll("text")
        .data(data_10min)
        .enter()
        .append("text")
        .attr("dy", 10)
        .style("text-anchor", "start")
        .style("font", "10px arial")
        .append("textPath")
        // ？？？
        .filter(function(d) {
            var Format = d3.time.format("%H");
            var sd = Format(d.date);
            if (!firstInMonth[sd]) {
                firstInMonth[sd] = 1;
                return true;
            }
            return false;
        })
        .text(function(d) {
            return tF(d.date);
        })
        .attr("xlink:href", "#spiral")
        .style("fill", "#2F4F4F")
        .attr("startOffset", function(d) {
            return ((d.linePer / spiralLength) * 100) + "%";
        });
}