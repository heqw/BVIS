// 2014 - 10 - 12T16: 00: 00.000Z 输出的是UTC时间？？？
var dateBian = new Date("2014/11/1");//console.log(typeof(datebian));
//datebian.setDate(10);
//console.log('datebian'); console.log(datebian);
var a;
getInfo(dateBian);
function getInfo(datebian) {
    // 获得几号
    console.log('datebian'); console.log(datebian);
    var daybian = datebian.getDate(); console.log('daybian'); console.log(daybian);
    var monthbian = datebian.getMonth();
    var yearbian = datebian.getFullYear();
    var enddate = new Date(yearbian, monthbian, daybian);
    enddate.setDate(daybian + 1);
    // 获得星期几
    var weekbian = datebian.getDay();
    // 星期一开始是1号,获得星期一的号数
    var weekstart = new Date(yearbian, monthbian, daybian); //console.log('weekstart'); console.log(weekstart);
    // 获得星期天的号数
    var weekend = new Date(yearbian, monthbian, daybian); //console.log('weekend'); console.log(weekend);

    switch (weekbian) {
        // 是星期天的话，weekend不变，weekstart设置减掉6天
        case 0:
            weekstart.setDate(daybian - 6);
            weekend.setDate(daybian + 1);
            break;
        // 星期一，weekstart不变，weekend加6
        case 1:
            weekend.setDate(daybian + 7);
            break;
        case 2:
            weekstart.setDate(daybian - 1);
            weekend.setDate(daybian + 6); console.log("weekend"); console.log(weekend);
        case 3:
            weekstart.setDate(daybian - 2);
            weekend.setDate(daybian + 5);
            break;
        case 4:
            weekstart.setDate(daybian - 3);
            weekend.setDate(daybian + 4);
            break;
        case 5:
            weekstart.setDate(daybian - 4); //console.log('获得周一号数'); console.log(weekstart);
            weekend.setDate(daybian + 3); //console.log('获得周天号数'); console.log(weekend);
            break;
        case 6:
            weekstart.setDate(daybian - 5);
            weekend.setDate(daybian + 2); //console.log("1111");
    }
    // console.log('datebian2!!!!!!!!!'); 
    // console.log(datebian);
    // console.log(weekstart);
    // console.log(weekend);
    // console.log('datebian2!!!!!!!!!'); 
    //var getdate;
    console.log("weekend"); console.log(weekend);
    endday = enddate.getDate();
    endmonth = enddate.getMonth();
    endyear = enddate.getFullYear();
    weekstartday = weekstart.getDate();
    weekstartmonth = weekstart.getMonth();
    weekstartyear = weekstart.getFullYear();
    weekendday = weekend.getDate();
    weekendmonth = weekend.getMonth();
    weekendyear = weekend.getFullYear(); console.log("weekend"); console.log(weekend);
    if ((weekendmonth - weekstartmonth) > 1) weekendmonth = weekstartmonth + 1;
     console.log("weekendmonth"); console.log(weekendmonth);
    if (weekstart.getDay() != 1){
        weekstart.setDate(1 - weekstart.getDay() + weekstartday);
        weekstartday = weekstart.getDate();
    } 
    if (weekend.getDay() != 1) {
        weekend.setDate(7 + weekstartday);
        weekendday = weekend.getDate();
    } monthbian
    if (weekstartmonth != monthbian) weekstartmonth = monthbian;
    if ((weekendmonth - weekstartmonth) > 1) weekendmonth = weekstartmonth + 1;
    
    a = {
        getdate: datebian, getday: daybian,
        getmonth: monthbian, getyear: yearbian,
        endDay: endday, endMonth: endmonth, endYear: endyear,

        getweek: weekbian, weekStart: weekstart,
        weekEnd: weekend, weekStartDay: weekstartday,
        weekStartMonth: weekstartmonth, weekStartYear: weekstartyear,
        weekEndDay: weekendday, weekEndMonth: weekendmonth,
        weekEndYear: weekendyear
    };

} //console.log(a);//console.log(new Date());
// console.log(weekstart);
// console.log(weekend);
var lastDatebian = a.getdate;
//console.log('date in bianliang.js is'+ lastDatebian);

// Object.defineProperty(a, 'getdate', {
//     get: function () {
//         console.log('get：!!!' + getdate);
//         return getdate;
//     },
//     set: function (value) {
//         getdate = value;
//         // console.log('set:' + getdate);
//         if (lastDatebian != getdate) {
//             lastDatebian = getdate;
//             console.log('value changed! set:' + getdate);
//         }
//     }
// });


// var a = { zhihu: 0 };
// console.log('a:' + a.getdate); console.log(typeof (a.getdate));
// console.log('a:' + datebian); console.log(typeof (datebian));