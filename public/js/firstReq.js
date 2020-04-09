sendReq();
function sendReq() {
    $.ajax({
        //参数url 发送请求的地址
        url: "/find",
        //请求的数据类型
        //下面两行不加，报错Access to XMLHttpRequest at 'file:///F:/find' from origin 'null' has been blocked by CORS policy
        dataType: 'json',
        crossDomain: false,
        data: {},
        async: true,
        type: "GET",
        contentType: "application/json",
        beforeSend: function () { console.log("before!"); },
        success: function () { console.log("success!"); },
        complete: function () { console.log("finish!"); },
        error: function () { console.log("error!") }
    });
}

