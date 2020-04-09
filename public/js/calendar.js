startdate = new Date("2014/10/13");
enddate = new Date("2016/8/31");

$(".form_datetime").datetimepicker({
    format: "yyyy-mm-dd", //显示日期格式
    initialDate: startdate,
    // defaultDate: "2015-10-14",
    startDate: startdate,
    endDate: enddate,
    autoclose: true,//选完时间后是否自动关闭
    //todayBtn: true,
    minView: "month",// minView — 最精确的时间
    language: 'zh-CN',
    pickerPosition: 'bottom-left'//选择框位置String类型 默认值：bottom- right还支持 : ‘bottom - left’，’top - right’，’top - left’
});
date = $(".form_datetime").data("datetimepicker").getDate();
// console.log('da:' + date); console.log(typeof (date));
// console.log("aaaaaaaaaaaa");console.log(date);


Object.defineProperty(a, 'getdate', {
    get: function () {
        console.log('get：' + getdate);
        //console.log(typeof (getdate));

        return getdate;
    },
    set: function (value) {
        getdate = value;
        if (lastDatebian.getTime() != getdate.getTime()) {

            // console.log('lastDatebian now:' + lastDatebian);
            // console.log('getdate 赋值后：' + getdate);

            lastDatebian = getdate; //shuchu(getdate);
            console.log('value changed! set:' + getdate);
            getInfo(getdate);
            console.log("getdate");console.log(getdate);
        }
    }
});

// 验证时间不一样时是否执行了getInfo（）
a.getdate = date; // set:2
console.log(a);
console.log('a.getdate now:' + a.getdate);
console.log('a.weekend now:' + a.weekEnd);