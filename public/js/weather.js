sendWeatherReq();

function sendWeatherReq() {
    $.ajax({

        url: "http://localhost:3000/weatherData",
        dataType: 'json',
        crossDomain: false,
        data: {
            Wstartyear: a.getyear,
            Wstartmonth: a.getmonth,
            Wendyear: a.EndYear,
            Wendmonth: a.EndMonth
        },
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function() {},
        success: function(data, textStatus) {
            // console.log("data");
            // console.log(data);
            // data.forEach(function(d) {
            //     d.week = new Date(d.start_time).getUTCDay();
            // });
            sendWeather(data);
        },
        complete: function() {},
        error: function() {}
    });
}

function sendWeather(data) {
    $.ajax({

        url: "http://localhost:3000/weatherStation",
        dataType: 'json',
        crossDomain: false,
        data: {
            startyear: a.getyear,
            startmonth: a.getmonth,
            endyear: a.EndYear,
            endmonth: a.EndMonth
        },
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function() {},
        success: function(Data, textStatus) {
            // console.log("Data");
            // console.log(Data);
            // data.forEach(function(d) {
            //     d.week = new Date(d.start_time).getUTCDay();
            // });
            handleWeaSta(data, Data);
        },
        complete: function() {},
        error: function() {}
    });
}

// // data是weather的数据 Data是trip的数据
function handleWeaSta(data, Data) {
    //console.log(data);
    // var nest = d3.nest().key(function(d) {
    //         return new Date(d.start_time).getDate();
    //     })
    //     // 以号数为key
    // var stationNest = nest.entries(Data);
    // // console.log("stationNest");
    // // console.log(stationNest);

    // // 以号数为key后，以from_station_id to_station_id
    // var nest = d3.nest().key(function(d) { return d.from_station_id; })
    // var fromNest = nest.entries(stationNest);

    // var nest = d3.nest().key(function(d) { return d.to_station_id; })
    // var toNest = nest.entries(stationNest);

    // 筛选会员
    var memberData = [];
    Data.forEach(function(d) {
        if (d.user_type == "Member")
            memberData.push({ start_time: d.start_time, from_station_id: d.from_station_id, to_station_id: d.to_station_id });
    })

    // 先以号数为key,再分别以O D为key，主要为了得到在一天内O  D 的使用数，相加得当天单车站的总使用量
    var nest = d3.nest()
        .key(function(d) { return new Date(d.start_time).getDate(); })
        .key(function(d) { return d.from_station_id; });
    var fromNest = nest.entries(memberData);

    var nest = d3.nest()
        .key(function(d) { return new Date(d.start_time).getDate(); })
        .key(function(d) { return d.to_station_id; });
    var toNest = nest.entries(memberData);

    // console.log("fromNest");
    // console.log(fromNest);
    // console.log("toNest");
    // console.log(toNest);


    // 统计 当天各车站的O D 使用次数
    var fromInfo = [];
    var toInfo = [];
    fromNest.forEach(function(d) {
        //d.values[i].fromSum = d.values[i].length;
        for (var i = 0; i < d.values.length; i++) {
            fromInfo.push({ date: d.key, fromID: d.values[i].key, fromSum: d.values[i].values.length });
        }
    })
    toNest.forEach(function(d) {
            for (var i = 0; i < d.values.length; i++) {
                toInfo.push({ date: d.key, toID: d.values[i].key, toSum: d.values[i].values.length, flag: 0 });
            }
        })
        // console.log("fromInfo");
        // console.log(fromInfo);
        // console.log("toInfo");
        // console.log(toInfo);


    // 处理天气数据
    var weatherIndex = [];
    // 晴天(RainIndex=0)就是RainIndex=-1 && WindIndex=5
    var RainIndex, WindIndex, TemIndex;

    data.forEach(function(d) {
            // console.log("xx");
            // 都有天气事件或有降水量
            //console.log(d.Events);
            RainIndex = -1;
            WindIndex = 0;
            TemIndex = 0;
            if (d.Events != null || d.Precipitation_In > 0) {

                // 小雨 RainIndex=1
                if (0 <= d.Precipitation_In && d.Precipitation_In <= 0.39) RainIndex = 1;
                // 中雨 RainIndex=2
                else if (d.Precipitation_In > 0.39 && d.Precipitation_In <= 0.98) RainIndex = 2;
                // 大雨，RainIndex=3
                else if (d.Precipitation_In > 0.98 && d.Precipitation_In <= 1.96) RainIndex = 3;
                // 暴雨，RainIndex=4
                else if (d.Precipitation_In > 1.96) RainIndex = 4;
            }

            // 7、8级风骑车不安全;6级风没体力顶不动,5级风骑车尚可
            // 0-5级风 WindIndex=5
            if (d.Max_Gust_Speed_MPH <= 25 || d.Max_Gust_Speed_MPH == "-") WindIndex = 5;
            // 6级风 WindIndex=6
            else if (d.Max_Gust_Speed_MPH > 25 && d.Max_Gust_Speed_MPH <= 31) WindIndex = 6;
            // 7风 树枝摇动 WindIndex=7
            else if (d.Max_Gust_Speed_MPH > 31 && d.Max_Gust_Speed_MPH <= 38) WindIndex = 7;
            // 8风，WindIndex=8
            else if (d.Max_Gust_Speed_MPH > 38 && d.Max_Gust_Speed_MPH <= 46) WindIndex = 8;
            // 9风，WindIndex=9
            else if (d.Max_Gust_Speed_MPH > 47) WindIndex = 9;

            // 10>平均温度>0℃ temIndex=9
            if (d.Mean_Temperature_F <= 50) TemIndex = 10;
            // 20>平均温度>10℃  temIndex=10
            else if (d.Mean_Temperature_F > 50 && d.Mean_Temperature_F <= 68) TemIndex = 11;
            // 平均温度>20℃  temIndex=11
            else if (d.Mean_Temperature_F > 68) TemIndex = 12;
            // console.log(RainIndex);
            // console.log(WindIndex);
            // 没下雨并且风小,则RainIndex=0
            if (RainIndex == -1 && WindIndex == 5) RainIndex = 0;
            weatherIndex.push({ date: new Date(d.Date).getDate(), rainIndex: RainIndex, windIndex: WindIndex, temIndex: TemIndex });
            // console.log(RainIndex);
        })
        //console.log(weatherIndex);


    // 将当天总使用量和Index 存入fromInfo
    //  fromInfo存后有date(号数) fromID（ID） fromSum（O的使用量） totalSum（总使用量）wind rain tem
    fromInfo.forEach(function(d) {
            // 有的车站可能只有O 没有D
            // 有个问题：如果D中有O中没有的ID 这样操作会漏掉D
            // 先把D中有的放进O 再求和 加index
            // d.totalSum = d.fromSum;
            toInfo.forEach(function(i) {
                    // 用来判断D中的每一个车站是否都放进O中
                    // i.flag = 0;
                    if (d.date == i.date && d.fromID == i.toID) {
                        // d.totalSum = d.fromSum + i.toSum;
                        i.flag = 1;
                        //d.flag=1;
                    }

                })
                // weatherIndex.forEach(function(j) {
                //     if (d.date == j.date) {
                //         d.rain = j.rainIndex;
                //         d.wind = j.windIndex;
                //         d.tem = j.temIndex;
                //     }
                // })
        })
        // 将D中没有放进O的车站信息放入O
    toInfo.forEach(function(d) {
            if (d.flag == 0 || d.flag == "0")
                fromInfo.push({ date: d.date, fromSum: 0, fromID: d.toID, totalSum: d.toSum });
        })
        // 加totalSum Index
    fromInfo.forEach(function(d) {
            d.totalSum = d.fromSum;
            toInfo.forEach(function(i) {
                if (d.date == i.date && d.fromID == i.toID) {
                    d.totalSum = d.fromSum + i.toSum;
                }
            })
            weatherIndex.forEach(function(j) {
                if (d.date == j.date) {
                    d.rain = j.rainIndex;
                    d.wind = j.windIndex;
                    d.tem = j.temIndex;
                }
            })
        })
        // console.log("fromInfo");
        // console.log(fromInfo);

    // 按ID排序，为了根据wind rain tem得到各个天气情况的使用次数
    var nest = d3.nest()
        .key(function(d) { return d.fromID; })
        .key(function(d) { return d.wind; })
    var windNest = nest.entries(fromInfo);
    var nest = d3.nest()
        .key(function(d) { return d.fromID; })
        .key(function(d) { return d.rain; })
    var rainNest = nest.entries(fromInfo);
    var nest = d3.nest()
        .key(function(d) { return d.fromID; })
        .key(function(d) { return d.tem; })
    var temNest = nest.entries(fromInfo);

    // console.log("windNest");
    // console.log(windNest);
    // Count[]存储ID ，天气系数，两者对应的车站使用次数
    var Count = [];
    var wSum = 0;
    windNest.forEach(function(d) {
        for (var i = 0; i < d.values.length; i++) {
            wSum = 0;
            length = d.values[i].values.length;
            for (var j = 0; j < length; j++) {

                wSum += d.values[i].values[j].totalSum;
                // if (d.key == "UW-02") console.log(wSum);
            }

            Count.push({ ID: d.key, Index: d.values[i].key, sum: Math.ceil(wSum / length) });
        }

    })
    rainNest.forEach(function(d) {
        for (var i = 0; i < d.values.length; i++) {
            wSum = 0;
            length = d.values[i].values.length;
            for (var j = 0; j < length; j++) {

                wSum += d.values[i].values[j].totalSum;
                // if (d.key == "UW-02") console.log(wSum);
            }

            Count.push({ ID: d.key, Index: d.values[i].key, sum: Math.ceil(wSum / length) });
        }

    })
    temNest.forEach(function(d) {
            for (var i = 0; i < d.values.length; i++) {
                wSum = 0;
                length = d.values[i].values.length;
                for (var j = 0; j < length; j++) {

                    wSum += d.values[i].values[j].totalSum;
                    // if (d.key == "UW-02") console.log(wSum);
                }

                Count.push({ ID: d.key, Index: d.values[i].key, sum: Math.ceil(wSum / length) });
            }

        })
        // console.log("Count");
        // console.log(Count);

    var nest = d3.nest()
        .key(function(d) { return d.ID; });
    var CountNest = nest.entries(Count);
    // console.log("CountNest");
    // console.log(CountNest);
    var total = 0;
    // 计算每个单车的总使用量，以便排序，选择使用量最多的显示
    CountNest.forEach(function(d) {
            total = 0;
            for (var i = 0; i < d.values.length; i++) {
                total += d.values[i].sum;
            }
            d.total = total;
        })
        // console.log("CountNest计算total");
        // console.log(CountNest);
    CountNest.sort(function(a, b) {
        if (a.total > b.total) {
            return -1;
        } else if (a.total == b.total) {
            return 0;
        } else {
            return 1;
        }
    });
    // console.log("CountNest排序后");
    // console.log(CountNest);

    // 标上排名
    for (i = 0; i < CountNest.length; i++) {
        CountNest[i].sort = i;
    }
    // console.log("CountNest排序后");
    // console.log(CountNest);

    // 由于nest结构读值不方便，所以变换为普通的数组,并且只录入前15的车站
    var viewData = [];
    var count15 = 0;
    CountNest.forEach(function(d) {
        count15++;
        if (count15 <= 15) {
            for (i = 0; i < d.values.length; i++) {
                viewData.push({ ID: d.key, sort: d.sort, Index: d.values[i].Index, sum: d.values[i].sum });
            }
        }
    })
    drawWeather(viewData);
    // console.log("CountNest");
    // console.log(CountNest);
    // console.log("viewData");
    // console.log(viewData);
}



function drawWeather(data) {
    var calendar = $("#weatherView"),
        width = calendar.width(),
        height = calendar.height(),
        gridSize = width / 20,
        showID = [];
    // showindex1 = ["Sunny", "Light", "Moderate", "Heavy", "Torrential",
    //     " ", "Strong", "Moderate", "Fresh", "Strong",
    //     "0℃-", "10℃-", " "
    // ];
    // showindex2 = [" ", "Rain", "Rain", "Rain", " Rain",
    //     "calm", "Breeze", " Gale", "Gale", "Gale",
    //     "10℃", "20℃", ">20℃"
    // ];
    showindex = ["晴", "小雨", "中雨", "大雨", "暴雨", "<6级", "6级", "7级", "8级", "9级", "0-10度", "10-20", ">20"]
    var colorRange = d3.range(6).map(function(i) { return "q" + i + "-6"; });
    // d3.scale.threshold - 构建一个临界值比例尺（值域离散）
    var threshold = d3.scale.threshold()
        .domain([5, 10, 15, 20, 25])
        // .domain([0, 10, 20, 30, 40])
        .range(colorRange);

    var findID = 0;
    data.forEach(function(d) {
            if (d.sort == findID) {
                showID.push(d.ID);
                findID++;
            }
        })
        //console.log(showID);

    var svg = d3.select("#weatherView")
        .append("svg")
        .attr("id", "weahter_svg")
        .attr("width", width)
        .attr("height", height);
    // // 系数标签（x轴）一行显示不完，拆成两行
    // var indexLabel1 = svg.append("g");
    // var indexLabel2 = svg.append("g");
    var indexLabel = svg.append("g");
    // 索引标签（y轴）
    var sortLabel = svg.append("g");
    // 画视图的？
    var weather_g = svg.append("g")
        .attr("transform", "translate(" + gridSize + ",0)");
    // 颜色标签
    var legend_g = svg.append("g")
        .attr("transform", "translate(30,332)")

    var index_Labels = indexLabel.selectAll(".indexLabel")
        .data(showindex)
        .enter()
        .append("text")
        .attr("class", "indexLabel")
        .attr("id", function(d, i) {
            return "index" + d;
        })
        .text(function(d) { return d; })
        .attr("x", function(d, i) { return (i + 1.8) * (gridSize + 5); })
        .attr("y", 30)
        // .on("click", function(d, i) {
        //     d3.select("#section_date").text("2016/1/" + d);
        //     section_id_date(section_id, new Date(2016, 0, d, 0, 0, 0));
        // })
        .style({
            "font-size": "8px",
            // 深灰色
            "fill": "#696969",
            "text-anchor": "middle"
        });

    // 添加竖向的那个ID标签
    var sortLabels = sortLabel.selectAll(".sortLabel")
        .data(showID)
        .enter()
        .append("text")
        .attr("class", "sortLabel")
        .attr("id", function(d, i) {
            return "sort" + d;
        })
        .text(function(d) { return d; })
        // 2.2影响标签的起始位置，*后面应该是影响两个标签的间距
        .attr("y", function(d, i) { return (i + 2.2) * (gridSize + 5.4); })
        .attr("x", 14)
        // .on("click", function(d, i) {
        //     d3.select("#section_date").text("2016/1/" + d);
        //     section_id_date(section_id, new Date(2016, 0, d, 0, 0, 0));
        // })
        .on("click", function(d) {
            mainChart.data_point.features.forEach(function(s) {
                if (s.properties.station_id === d) {
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
        .style({
            "font-size": "8px",
            // 深灰色
            "fill": "#696969",
            "text-anchor": "middle"
        });

    // 添加颜色小方块
    var calendarRects = weather_g.selectAll(".sort")
        .data(data)
        .enter()
        .append("rect")
        .attr("y", function(d, i) {
            // console.log("d.sort");
            // console.log(d.sort);
            return (d.sort + 1) * 20 + 5;
        })
        .attr("x", function(d, i) {
            // console.log("d.Index");
            // console.log(d.Index);
            return (d.Index + 8.4) * 1.93;
        })
        .attr("class", function(d) {
            if (d.sum === null)
                return "sort";
            else
                return "sort " + threshold(d.sum);
        })
        .attr('fill', function(d) {
            // 速度为零时
            if (!d.sum)
            // 深蓝色
                return "#302b63";
            // else return threshold(d.sum);
        })
        .attr("width", gridSize)
        .attr("height", gridSize)
        // 交互暂时不看

    .style({
            "opacity": .7
        })
        .attr("transform", "translate(0," + gridSize / 2 + ")");


    // // 面积图右边的那个日期
    // calendar_rects.append("title")
    //     .text(function(d) {
    //         return "date:2016/1/" + d.day + " " + d.hour + ":00  speed:" + d.speed;
    //     })
    //     .style({
    //         "font-size": "9",
    //         "fill": "#ffffff",
    //         "text-anchor": "middle"
    //     });
    var color_scale = ["#40E0D0", "#23D561", "#9CD523", "#FFBF3A", "#FB8C00", "#FF5252"];
    // 横线的颜色注释
    legend_g.selectAll(".colorLegend")
        .data(color_scale)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            return i * gridSize * 17 / 6;
        })
        .attr("y", 0)
        .attr("width", gridSize * 17 / 6)
        .attr("height", 5)
        // .attr("transform", "translate(0,10)")
        .style("fill", function(d) {
            return d;
        });

    var legend = [5, 10, 15, 20, 25];

    legend_g.selectAll(".legendText")
        .data(legend)
        .enter()
        .append("text")
        .text(function(d) {
            return d + "次/天";
        })
        .attr("x", function(d, i) {
            return (i + 1) * gridSize * 17 / 6;
        })
        .attr("y", 12)
        .style({
            "fill": "#696969",

            "font-size": "8px",

            "text-anchor": "middle"

        });

}