sendwordReq();

function sendwordReq() {
    $.ajax({
        //参数url 发送请求的地址
        url: "http://localhost:3000/fromStation",
        //请求的数据类型
        //下面两行不加，报错Access to XMLHttpRequest at 'file:///F:/find' from origin 'null' has been blocked by CORS policy
        dataType: 'json',
        crossDomain: false,
        data: {
            startyear: a.getyear,
            startmonth: a.getmonth,
            startday: a.getday,
            endyear: a.endYear,
            endmonth: a.endMonth,
            endday: a.endDay,
        },
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function() {},
        success: function(data, textStatus) { figureTime(data); },
        complete: function() {},
        error: function() {}
    });
}

//计算每个车站的出现次数
function figureTime(data) {
    //d3.nest().key() 指定嵌套结构的键,以from_station_id为标准来返回值
    var nest = d3.nest().key(function(d) {
            return d.from_station_name
        })
        //指定数组 data 将被用于构建嵌套结构。rank_data存的是数据信息
        //s是以station_name排序后的信息数组
    var O = nest.entries(data);

    //计算每个车站O出现次数
    //console.log(s);
    // var sum=0;
    // var num=0;
    O.forEach(function(d) {
        // d.from_station_id = d.values[0].from_station_id;
        var useTime = d.values.length;
        d.fromSum = useTime;
        // sum+=useTime;
        // num ++;

    });

    var nest = d3.nest().key(function(d) {
        return d.to_station_name
    })
    var D = nest.entries(data);
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
        if (d.flag == 0 && d.fromSum > 4) {
            wordData.push({ key: d.key, useTime: parseInt(d.fromSum), station_id: d.values[0].from_station_id });
        }
    })

    D.forEach(function(d) {
            if (d.flag == 0 && d.toSum > 4) {
                wordData.push({ key: d.key, useTime: parseInt(d.toSum), station_id: d.values[0].from_station_id });
            }
        })
        // console.log(O);
        // console.log(D);
        // console.log(wordData);
        //画词云
    var word = [];
    for (i = 0; i < wordData.length; i++) {
        word.push({ key: wordData[i].key, useTime: wordData[i].useTime, station_id: wordData[i].station_id });
    }

    // 降序排列
    wordData.sort(function(a, b) {
        if (a.useTime > b.useTime) {
            return -1;
        } else if (a.useTime == b.useTime) {
            return 0;
        } else {
            return 1;
        }
    });
    // 不能直接按sort后的顺序直接画要不然画出来的效果是字体依次减小颜色一次变淡
    var sort15 = [];
    word.forEach(function(d) {
        for (i = 0; i < 25; i++) {
            if (d.key == wordData[i].key)
                sort15.push({ key: d.key, useTime: d.useTime, station_id: d.station_id });
        }


    });
    // console.log("word");
    // console.log(word);
    // console.log("sort15");
    console.log(sort15);
    draw(sort15);
}

function draw(drawData) {
    // var drawData = [];
    //根据按from_station_id 排序的s[]的每一个元素，将元素的key、values(data中为val)、station_id组成一个元素，再组成数组data[]
    // s.forEach(function(d) {
    //     if (parseInt(d.fromSum) > 2)
    //         drawData.push({
    //             key: d.key,
    //             useTime: parseInt(d.fromSum),
    //             //  station_id: d.from_station_id 
    //         })
    // });

    //选出最小的次数
    var min_data = d3.min(drawData, function(d) {
        return d.useTime;
    });
    //选出最大的次数
    var max_data = d3.max(drawData, function(d) {
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
    var a = d3.rgb(156, 69, 44);
    var b = d3.rgb(235, 111, 59);
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
    console.log(width);
    console.log(height);
    var cloud_div = d3.select("#wordCloudView")
        .append("div")
        .attr("id", "cloud_div")
        .attr("height", height)
        .attr("width", width)

    .style({
        "position": "relative",
        // "top": "50%",
        //一行满了截掉单词，比如ps-04,ps在第一行最末尾，-04换行
        //word- wrap:break-word 不会截掉单词
        //"word-break": "keep-all",
        "word-wrap": "break-word",
        //white-space: nowrap 规定段落中的文本不进行换行
        // "white-space": "nowrap",
        //上 左右 下 = 上20px，左右自动居中，下0
        "margin": "20px auto 0"
    });

    // 子体大小[12,22];
    var per = (max_data - min_data) / 10;
    //console.log(per);
    //给.ss 添加标签a
    cloud_div.selectAll(".css")
        //绑定数据 drawData
        .data(drawData)
        .enter()
        .append("a")
        //设置显示站名的字体、透明度、颜色
        .style({
            "font-size": function(d) {
                // if (d.useTime >= 150) return 50 + "px";
                // else if (d.useTime < 150 && d.useTime >= 120) return 40 + "px";
                // else if (d.useTime < 120 && d.useTime >= 90) return 32 + "px";
                // else if (d.useTime < 90 && d.useTime >= 60) return 22 + "px";
                // else if (d.useTime < 60 && d.useTime >= 30) return 12 + "px";
                // else return d.useTime / 2 + "px";
                var font = (d.useTime - min_data) / per;
                //console.log(font);
                return font + 12 + "px";
            },
            "fill": function(d) {
                return compute(linear(d.useTime)).toString();
            },
            "color": function(d) {
                return compute(linear(d.useTime)).toString();
            }
        })
        //给a标签添加 class 以及显示的内容
        .attr("class", "name_message")
        .text(function(d) { return d.station_id })
        .on("click", function(d) {
            mainChart.data_point.features.forEach(function(s) {
                if (s.properties.station_id === d.station_id) {
                    map.flyTo({ center: s.geometry.coordinates });
                    if (mainChart.Msg_pop)
                        mainChart.Msg_pop.remove();
                    pro = "NAME:" + s.properties.description + '<p>' + "ID:" + s.properties.station_id;
                    mainChart.Msg_pop = new mapboxgl.Popup()
                        .setLngLat(s.geometry.coordinates)
                        .setHTML(pro)
                        .addTo(map);
                }
            });
        });

    // var radius = width / 2.5;
    var radius = 100;
    var dtr = Math.PI / 180;
    var d = 300;

    var mcList = [];
    var active = false;
    var lasta = 1;
    var lastb = 1;
    var distr = true;
    var tspeed = 10;
    var size = 250;

    var mouseX = 0;
    var mouseY = 0;

    var howElliptical = 1;

    var aA = null;
    var oDiv = null;


    var i = 0;
    var oTag = null;
    //console.log("jhhhhhhh");
    oDiv = document.getElementById('cloud_div');

    aA = oDiv.getElementsByTagName('a');
    for (i = 0; i < aA.length; i++) {
        oTag = {};

        oTag.offsetWidth = aA[i].offsetWidth;
        oTag.offsetHeight = aA[i].offsetHeight;

        mcList.push(oTag);
    }

    sineCosine(0, 0, 0);

    positionAll();

    // oDiv.οnmοuseοver = function() {
    //     active = true;
    // };

    // oDiv.οnmοuseοut = function() {
    //     active = false;
    // };

    // var active_ = false;
    //onmouseover事件：指鼠标移动都某个指点的HTML标签上，会出现什么效果。
    oDiv.onmouseover = function() {
        // if (active_)
        active = true;

        //console.log("over");
    };
    //????交互？？？？
    oDiv.onmouseout = function() {
        active = false;
        //console.log("out");
    };
    // .ondblclick 当双击鼠标按钮时执行一段 JavaScript
    // 点击时，active_取反
    // document.getElementById("wordCloud").ondblclick = function() {
    //     console.log("wordCloud click");
    //     active_ = !active_;
    //     active = false;
    // };


    oDiv.onmousemove = function(ev) {
        // 获取事件源，如果window.event存在就赋值window.event，不存在就赋值ev
        var oEvent = window.event || ev;
        // console.log("oDiv move");
        // console.log(oEvent.clientX);
        // console.log(oEvent.clientY);
        // clientX 设置或获取鼠标指针位置相对于窗口客户区域的 x 坐标，其中客户区域不包括窗口自身的控件和滚动条
        mouseX = oEvent.clientX - (oDiv.offsetLeft + oDiv.offsetWidth / 2);
        // mouseY－225，球才能从下往上翻
        mouseY = oEvent.clientY - (oDiv.offsetTop + oDiv.offsetHeight / 2) - 225;
        // 如果想改变他的速度的话，你就改变：mouseX/=5;mouseY/=5;后面数越大，速度越慢
        mouseX /= 5;
        mouseY /= 5;
        console.log(mouseX, mouseY);
    };
    // oDiv.οnmοusemοve = function(event) {
    //     console.log(event);
    //     console.log("oDiv move");
    //     console.log(mouseX);
    //     console.log(mouseY);
    //     var oEvent = event || window.event;

    //     mouseX = oEvent.clientX - (oDiv.offsetLeft + oDiv.offsetWidth / 2);
    //     mouseY = oEvent.clientY - (oDiv.offsetTop + oDiv.offsetHeight / 2);

    //     mouseX /= 5;
    //     mouseY /= 5;
    // };

    setInterval(update, 30);


    function update() {
        var a;
        var b;
        // console.log("update!!!!!!!");

        if (active) {
            a = (-Math.min(Math.max(-mouseY, -size), size) / radius) * tspeed;
            b = (Math.min(Math.max(-mouseX, -size), size) / radius) * tspeed;
        } else {
            a = lasta * 0.98;
            b = lastb * 0.98;
        }

        lasta = a;
        lastb = b;

        if (Math.abs(a) <= 0.01 && Math.abs(b) <= 0.01) {
            return;
        }

        var c = 0;
        sineCosine(a, b, c);
        // console.log(a);
        // console.log(active);
        for (var j = 0; j < mcList.length; j++) {
            // 绕x轴旋转？
            var rx1 = mcList[j].cx;
            var ry1 = mcList[j].cy * ca + mcList[j].cz * (-sa);
            var rz1 = mcList[j].cy * sa + mcList[j].cz * ca;

            // 绕y轴旋转？
            var rx2 = rx1 * cb + rz1 * sb;
            var ry2 = ry1;
            var rz2 = rx1 * (-sb) + rz1 * cb;

            var rx3 = rx2 * cc + ry2 * (-sc);
            var ry3 = rx2 * sc + ry2 * cc;
            var rz3 = rz2;

            mcList[j].cx = rx3;
            mcList[j].cy = ry3;
            mcList[j].cz = rz3;

            per = d / (d + rz3);

            mcList[j].x = (howElliptical * rx3 * per) - (howElliptical * 2);
            mcList[j].y = ry3 * per;
            mcList[j].scale = per;
            mcList[j].alpha = per;

            mcList[j].alpha = (mcList[j].alpha - 0.6) * (10 / 6);
        }

        doPosition();
        depthSort();
    }

    function depthSort() {
        var i = 0;
        var aTmp = [];

        for (i = 0; i < aA.length; i++) {
            aTmp.push(aA[i]);
        }

        aTmp.sort(
            function(vItem1, vItem2) {
                if (vItem1.cz > vItem2.cz) {
                    return -1;
                } else if (vItem1.cz < vItem2.cz) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );

        for (i = 0; i < aTmp.length; i++) {
            aTmp[i].style.zIndex = i;
        }
    }

    function positionAll() {
        var phi = 0;
        var theta = 0;
        var max = mcList.length;
        var i = 0;

        var aTmp = [];
        var oFragment = document.createDocumentFragment();

        //随机排序
        for (i = 0; i < aA.length; i++) {
            aTmp.push(aA[i]);
        }

        aTmp.sort(
            function() {
                return Math.random() < 0.5 ? 1 : -1;
            }
        );

        for (i = 0; i < aTmp.length; i++) {
            oFragment.appendChild(aTmp[i]);
        }

        oDiv.appendChild(oFragment);

        for (var i = 1; i < max + 1; i++) {
            if (distr) {
                phi = Math.acos(-1 + (2 * i - 1) / max);
                theta = Math.sqrt(max * Math.PI) * phi;
            } else {
                phi = Math.random() * (Math.PI);
                theta = Math.random() * (2 * Math.PI);
            }
            //坐标变换
            mcList[i - 1].cx = radius * Math.cos(theta) * Math.sin(phi);
            mcList[i - 1].cy = radius * Math.sin(theta) * Math.sin(phi);
            mcList[i - 1].cz = radius * Math.cos(phi);

            // aA[i - 1].style.left = mcList[i - 1].cx + oDiv.offsetWidth / 2 - mcList[i - 1].offsetWidth / 2 + 'px';
            // aA[i - 1].style.top = mcList[i - 1].cy + oDiv.offsetHeight / 2 - mcList[i - 1].offsetHeight / 2 + 'px';
        }
    }

    function doPosition() {
        var l = oDiv.offsetWidth / 2;
        var t = oDiv.offsetHeight / 2;
        for (var i = 0; i < mcList.length; i++) {
            aA[i].style.left = mcList[i].cx + l - mcList[i].offsetWidth / 2 + 'px';
            // 不加120会在view上面去了，而且top为-
            aA[i].style.top = mcList[i].cy + t - mcList[i].offsetHeight / 2 + 120 + 'px';

            // aA[i].style.fontSize = Math.ceil(12 * mcList[i].scale / 2) + 4 + 'px';

            aA[i].style.filter = "alpha(opacity=" + 100 * mcList[i].alpha + ")";
            aA[i].style.opacity = mcList[i].alpha;
        }
    }

    function sineCosine(a, b, c) {
        sa = Math.sin(a * dtr);
        ca = Math.cos(a * dtr);
        sb = Math.sin(b * dtr);
        cb = Math.cos(b * dtr);
        sc = Math.sin(c * dtr);
        cc = Math.cos(c * dtr);

    }
    // d3.select("#headTitle").append("div")
    //     .attr("class", "header_left")
    //     .append("svg")
    //     .attr("width", 1000 * 0.4 - 10)
    //     .attr("height", 38)
    //     .append("image")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", 1000 * 0.4 - 10)
    //     .attr("height", 38)
    //     .attr("xlink:href", "public/images/title.png");
}