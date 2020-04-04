sendwordReq();
function sendwordReq() {
    $.ajax({
        //参数url 发送请求的地址
        url: "http://localhost:3000/fromStation",
        //请求的数据类型
        //下面两行不加，报错Access to XMLHttpRequest at 'file:///F:/find' from origin 'null' has been blocked by CORS policy
        dataType: 'json',
        crossDomain: false,
        data: {},
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function () { },
        success: function (data, textStatus) { figureTime(data); },
        complete: function () { },
        error: function () { }
    });
}

//计算每个车站的出现次数
function figureTime(data) {
    //d3.nest().key() 指定嵌套结构的键,以station_name为标准来返回值
    var nest = d3.nest().key(function (d) {
        return d.from_station_id
    })

    //指定数组 data 将被用于构建嵌套结构。rank_data存的是数据信息
    //s是以station_name排序后的信息数组
    var s = nest.entries(data);

    //计算每个车站出现次数
    //console.log(s);
    // var sum=0;
    // var num=0;
    s.forEach(function (d) {
        d.from_station_id = d.values[0].from_station_id;
        var useTime = d.values.length;
        d.values = useTime;
        // sum+=useTime;
        // num ++;
        //console.log(useTime);
    });

    //画词云
    draw(s);
}

function draw(s) {
    var drawData = [];
    //根据按from_station_id 排序的s[]的每一个元素，将元素的key、values(data中为val)、station_id组成一个元素，再组成数组data[]
    s.forEach(function (d) {
        drawData.push({ key: d.key, useTime: parseInt(d.values), station_id: d.from_station_id })
    });

    //选出最小的次数
    var min_data = d3.min(drawData, function (d) {
        return d.useTime;
    });
    //选出最大的次数
    var max_data = d3.max(drawData, function (d) {
        return d.useTime;
    });

    // console.log(max_data,min_data);
    // console.log(drawData);

    // 定义了两个RGB颜色：红(255, 0, 0)和绿(0, 255, 0) 。
    //然后，以这两个颜色对象作为d3.interpolate(a, b)的参数。d3.interpolate返回一个函数，保存在变量compute里。
    //于是，compute可当做函数使用，参数是一个数值。
    // 当数值为0时，返回红色。 当数值为1时，返回绿色。
    // 当数值为0~1之间的值时，返回介于红色和绿色之间的颜色。
    // 如果数值超过1，则返回绿色：数值小于0，则返回红色。
    var a = d3.rgb(255, 0, 0);
    var b = d3.rgb(0, 255, 0);
    var compute = d3.interpolate(b, a);

    //d3.scale获取尺度生成器 linear
    var linear = d3.scale.linear()
        //domain函数设置此尺度的输入范围，参数以数组的形式传入
        .domain([min_data, max_data])
        //输出范围
        .range([0, 1]);

    var cloud = $("#wordCloudView");
    var width = cloud.width();
    var height = cloud.height();

    var cloud_div = d3.select("#wordCloudView")
        .append("div")
        .attr("id", "cloud_div")
        .attr("width", width)
        .attr("height", height)
        .style({
            "position": "relative",
            //"top": "50%",
            //一行满了截掉单词，比如ps-04,ps在第一行最末尾，-04换行
            //word- wrap:break-word 不会截掉单词
            //"word-break": "keep-all",
            "word-wrap": "break-word",
            //white-space: nowrap 规定段落中的文本不进行换行
            //"white-space": "nowrap",
            //上 左右 下 = 上20px，左右自动居中，下0
            "margin": "20px auto 0"
        });

    //给.ss 添加标签a
    cloud_div.selectAll(".css")
        //绑定数据 drawData
        .data(drawData)
        .enter()
        .append("a")
        //设置显示站名的字体、透明度、颜色
        .style({
            "font-size": function (d) {
                return (d.useTime > 50) ? "50px" : d.useTime +5+ "px";
            },
            "fill": function (d) {
                return compute(linear(d.useTime + 15)).toString();
            },
            "color": function (d) {
                return compute(linear(d.useTime + 25)).toString();
            }
        })
        //给a标签添加 class 以及显示的内容
        .attr("class", "name_message")
        .text(function (d) { return d.key })
}