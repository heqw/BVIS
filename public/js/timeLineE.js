
var trendData = [

    [{ 'x': '2018-02-01', 'y': 1 }, { 'x': '2018-02-02', 'y': 6 }, { 'x': '2018-02-03', 'y': 11 }, { 'x': '2018-02-04', 'y': 15 }, { 'x': '2018-02-05', 'y': 16 }],

    [{ 'x': '2018-02-01', 'y': 2 }, { 'x': '2018-02-02', 'y': 7 }, { 'x': '2018-02-03', 'y': 12 }, { 'x': '2018-02-04', 'y': 17 }, { 'x': '2018-02-05', 'y': 18 }],

    [{ 'x': '2018-02-01', 'y': 3 }, { 'x': '2018-02-02', 'y': 8 }, { 'x': '2018-02-03', 'y': 13 }, { 'x': '2018-02-04', 'y': 11 }, { 'x': '2018-02-05', 'y': 10 }],

    [{ 'x': '2018-02-01', 'y': 4 }, { 'x': '2018-02-02', 'y': 9 }, { 'x': '2018-02-03', 'y': 14 }, { 'x': '2018-02-04', 'y': 30 }, { 'x': '2018-02-05', 'y': 20 }]

];
console.log(trendData);
//    曲线颜色

var trendColor = ['#0c88ff', '#0000ff', '#1d2088', '#009944'];

// 设置上面lable标签

var trendLable = ['开门总数', '手机开门时', '刷卡开门时', '人脸识别开门时']



//step2: 画曲线

var draw = {

    openDoorTrend: {

        // 初始化数据

        openDoorData: {

            w3: $("#trendSvg").width(),  // 获取装曲线div 盒子的宽度，自适应屏幕大小

            h3: $("#trendSvg").height(),  // 获取装曲线div盒子的高度，自适应屏幕大小

            svg3: d3.select("#trendSvg").append("svg"),

            svg1: d3.select("#table-border").append("svg") // 在装label标签的div盒子里添加一个svg，注意一个盒子里只能装一个svg，不能添加多个

        },



        /*  label */

        openDoorTrendLabel: function () {

            var svg3 = draw.openDoorTrend.openDoorData.svg1

            var w3 = $("#table-border").width()

            var h3 = $("#table-border").height()

            var a = 0.72,

                b = 0.72,

                c = 0.063;

            if (trendLable.length <= 4) {

                a = 0.72;

                b = 0.77;

                c = 0.70;

            } else {

                a = 0.68;

                b = 0.72;

                c = 0.063;

            }

            var x_rect = 0,

                y_rect = h3 * a,

                x_text = w3 * 0.06,

                y_text = h3 * b;

            var color = d3.scale.ordinal().range(trendColor);

            var gg = svg3.append("g").attr("class", "legend1").attr("transform", "translate(" + (w3 * 0.12) + "," + (-h3 * 0.62) + ")"); // 把label的 svg 添加到盒子里



            // 生成多个矩形label标签

            for (var i = 0; i < trendLable.length; i++) {

                gg.append("g")

                    .append("rect")

                    .attr("x", x_rect)

                    .attr("y", y_rect)

                    .attr("width", w3 * 0.045)

                    .attr("height", h3 * 0.05)

                    .attr("fill", color(i));



                gg.append("g")

                    .append("text")

                    .attr("x", x_text)

                    .attr("y", y_text)

                    .attr("class", "sub_title")

                    .style("font-size", "14px")

                    .attr("fill", text_color01)

                    .text(trendLable[i]);



                x_rect += h3 * 0.5;

                x_text += h3 * 0.5;

            }

        },

        /* 曲线图 */

        openDoorTrendChart: function () {

            var svg3 = d3.select("#trendSvg").append("svg")

            var w3 = draw.openDoorTrend.openDoorData.w3

            var h3 = draw.openDoorTrend.openDoorData.h3

            // 设置上下左右曲线图的间距

            var margin = {

                top: 30,

                right: 20,

                bottom: 20,

                left: 70

            },

                width = w3 - margin.left - margin.right,

                height = h3 - margin.top - margin.bottom;

            var parseDate = d3.time.format("%Y-%m-%d"); // 使用d3.time格式化返回数据的x(时间), 得到d3.js能接受的时间格式

            var x = d3.time.scale()

                .domain([parseDate.parse(trendData[0][0].x),

                parseDate.parse(trendData[0][trendData[0].length - 1].x)

                ])  // 设置区间大小

                .range([0, width]);





            var y = d3.scale.linear()

                .domain([0, d3.max(trendData, function (s) {

                    return d3.max(s, function (d) {

                        return d.y;

                    });

                }) * 1.3])

                .range([height, 0]);



            //x轴设置

            var xAxis = d3.svg.axis()

                .scale(x)

                .orient("bottom")

                .ticks(d3.time.day, 2) // 注意：设置隔两天显示一个刻度，否则会重复，因为他会一直遍历返回的数据，就会得到重复的x轴的值

                .tickFormat(d3.time.format("%m-%d")); //设置x轴刻度的格式



            //y轴设置

            var yAxis = d3.svg.axis()

                .scale(y)

                .orient("left");

            var svg = svg3.attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + (margin.left) + "," + (margin.top - 15) + ")");

            svg.append("g")

                .attr("class", "x axis")

                .attr("transform", "translate(0," + height + ")")

                .call(xAxis)

            svg.append("g")

                .attr("class", "y axis")

                .call(yAxis);

            // Define the line

            var line = d3.svg.line()

                .interpolate("linear")

                .x(function (d) {

                    return x(parseDate.parse(d.x))

                })

                .y(function (d) {

                    return y(d.y)

                })



            svg.append("clipPath")

                .attr("id", "clip")

                .append("rect")

                .attr("width", width)

                .attr("height", height);



            var path = svg.selectAll('.line')

                .data(trendData)

                .enter()

                .append("path")

                .attr("class", "line")

                .attr("clip-path", "url(#clip)")

                .attr('stroke', function (d, i) {

                    return trendColor[i % trendColor.length];

                })

                .attr("d", line);



            // 定义圆点

            var points = svg.selectAll('.dots')

                .data(trendData)

                .enter()

                .append("g")

                .attr("class", "dots")



            points.selectAll('.dot')

                .data(function (d, index) {

                    var a = [];

                    d.forEach(function (point, i) {

                        a.push({

                            'index': index,

                            'point': point

                        });

                    });

                    return a;

                })

                .enter()

                .append('circle')

                .attr('class', 'dot')

                .attr("r", 2)

                .attr('fill', function (d, i) {

                    return trendColor[d.index % trendColor.length];

                })

                .attr("cx", function (d) {

                    return x(parseDate.parse(d.point.x));

                })

                .attr("cy", function (d) {

                    return y(d.point.y);

                })



                .on("mouseover", function (d, i) {

                    $('#tooltip').remove()

                    var div02 = d3.select("body").append('div').attr({

                        "class": "tooltip03",

                        'id': 'tooltip'

                    }).style("opacity", 0);

                    div02.transition()

                        .duration(200)

                        .style("opacity", 1);

                    div02.html(function () {

                        return '<div style="color:#fff">' + '日期：' + d.point.x + '<br>值: ' + d.point.y + '</div>';

                    })

                        .style("left", (d3.event.pageX) + "px")

                        .style("top", (d3.event.pageY - 60) + "px");

                    d3.select(this)

                        .attr("r", "6")

                        .attr("opacity", "0.8");

                })

                .on("mouseout", function (d, i) {

                    d3.select('#tooltip').transition() // 通过d3.select 选择Dom元素

                        .duration(500)

                        .style("opacity", 0)

                        .remove();

                    d3.select(this)

                        .attr("r", "3")

                        .attr("opacity", "1.0");

                });

        }

    }
    

}
draw;
