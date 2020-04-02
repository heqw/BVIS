sendTimeReq();
function sendTimeReq() {
    $.ajax({

        url: "http://localhost:3000/timeLineData",
        dataType: 'json',
        crossDomain: false,
        data: {},
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function () { },
        success: function (data, textStatus) {
            console.log("timeREQ");
            data.forEach(function (d) {
                d.week = new Date(d.start_time).getUTCDay();
            });
            handleData(data);
        },
        complete: function () { },
        error: function () { }
    });
}

function handleData(data) {
    var nest = d3.nest().key(function (d) {
        if (d.week == 0) d.week = 7;
        return d.week
    })

    var drawData = nest.entries(data);

    var i = 0;
    var Data = [];
    drawData.forEach(function (d) {

        Data.push({ key: d.key, daySum: d.values.length });
    });

    drawtime(Data);
    console.log(drawData);
    console.log(Data);
}

function drawtime(data) {
    console.log("time1");

    var time_line_wh = $("#timeLineView");

    var margin = { top: 20, right: 20, bottom: 20, left: 0 },
        width = time_line_wh.width() - margin.left - margin.right,
        height = time_line_wh.height() - margin.top - margin.bottom;

    var date_extent = d3.extent([1, 2, 3, 4, 5, 8]);

    var x_scale = d3.scale.linear()
        .domain(date_extent)
        .range([0, width]);

    var y_scale = d3.scale.linear()
        .domain([200, 800])
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
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top * 2 + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + (margin.left + 30) + "," + (height - 20) + ")")
        .call(x_axis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(30,20)")
        .call(y_axis);


    var line = d3.svg.line().x(function (d) {
        return x_scale(parseInt(d.key));
    }).y(function (d) {
        return y_scale(d.daySum);

    }).interpolate("basis");

    var routes_g = svg.append("g")
        .attr("transform", "translate(" + (margin.left + 30) + ",20)");

    var routes = routes_g.selectAll(".route_line")
        .data(data)
        .enter()
        .append("g")
        .attr("class", function (d) { return "routes_line route_" + parseInt(d.key) });

    routes.append("path")
        .attr('fill', "none")
        .attr('opacity', 0.6)
        .attr('stroke', "#9d2933")
        .attr("stroke-width", 2)
        .attr("d", function (d) {
            return line(data)
        })
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