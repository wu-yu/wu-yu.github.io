var registUser = new DataModel('user');

$("#accountRegist_btn").click(function(event) {
    if(areaCheck($("#accountRegist")) && checkP1P2() &&passwordUserIdCheck()){
        var pwd = $('#pwd1').val();     
        $.blockUI();                
        var newUser = registUser.getDatas();        
        nativeEncrypt([pwd],function(encryptList){
            newUser.password =encryptList[0];
            var submitData = {
                "userId": $('#userId').val(),
                "password": newUser.password,
                "mobilePhone": sessionStorage.getItem('phoneNumber')
            }; 
            $.ajax({
                url:window.TCManagePlantformServer+'user/',
                type:'post',
                dataType:'json',
                contentType:'application/json',
                data:JSON.stringify(submitData),
                success:function(rs){
                    console.log(JSON.stringify(rs));
                    if(rs.operationResult == 0){
                        var data = {};
                        data.userName= newUser.userId;
                        data.password= pwd;
                        registSuccess(data);                     
                    }else{
                        nativeAlert($.i18n.prop(rs.error.code));
                    }
                },
                complete:function(){
                    $.unblockUI();                
                }
            })  
        });         
    }
});

//存储提交时间点
function setTime(){
    var pageTime=new Date();
    var countSec=pageTime.getSeconds();
    var countMin=pageTime.getMinutes();
    var countHou=pageTime.getHours();
    sessionStorage.setItem("Minutes",countMin);
    sessionStorage.setItem("Seconds",countSec);
    sessionStorage.setItem("Hours",countHou);
}


//发送手机验证码跳转验证码验证页面
$('#sendRegistYZM').click(function(event){
    var phoneNumber=$('#phoneNum').val();
    sessionStorage.setItem("phoneNumber", phoneNumber);
    if(phoneNumber==''){
        nativeAlert($.i18n.prop('placeholder4'));
    }else{
        $.blockUI();
        $.ajax({
            url:window.TCManagePlantformServer+'user/verify?mobilePhone='+phoneNumber,
            type:'get',
            dataType:'json',
            contentType:'application/json',
            success:function(rs){
                if(rs.operationResult==0){
                    //发送验证码
                    sendPhoneYzm($('#phoneNum').val(),'sendRegistYZM').done(function(){
                        //记录当前时间
                        setTime();
                        //跳转至验证页面
                        window.location.href="userRegistMobile.html";
                    }).always(function(){
                        $.unblockUI();          
                        })
                }else{
                    //返回错误码对应提示信息
                    nativeAlert($.i18n.prop(rs.error.code));
                };
            }
        }).always(function(){
            $.unblockUI();          
            })
    }
});

//验证码页面重新发送验证码
$('#sendYZM').click(function(event) {
    $.blockUI();
    sendPhoneYzm(sessionStorage.getItem('phoneNumber'),'sendYZM').done(function(){
        //记录当前验证码下发时间点
        setTime();
    }).always(function(){
        $.unblockUI();          
        })
});

//提交验证码验证通过跳转至用户信息填写页
$('#CheckYzm').click(function(event){
    var yzm=$('#registYZM').val();
    var phoneNum=sessionStorage.getItem('phoneNumber');
    if(yzm==''){
        nativeAlert($.i18n.prop('placeholder6'));
    }else{
        $.blockUI();
        validYZM(phoneNum,yzm).done(function(){
            //跳转至用户信息填写页
            window.location.href="userRegistSubmit.html";
        }).always(function(){
            $.unblockUI();          
            })
    }
})


function registSuccess(data){   
    nativeAlert($.i18n.prop('registSuccess'),'',function(rs){
        webViewJavascriptBridgeReady(function(){
            window.WebViewJavascriptBridge.callHandler(
                    'finish'
                    , data
            );   
        });      
    });   
}

function checkP1P2(){
    if($('#pwd2').val() != $('#pwd1').val()){
        nativeAlert($.i18n.prop('passwordNotTheSame')); 
        return false;    
    }        
    return true;
}


//password不能和userId一样
function passwordUserIdCheck(){
    var userId = registUser.get('userId');
    var password = registUser.get('password');
    if(password == userId){
        nativeAlert($.i18n.prop('passwordRule2'));
        return false;
    }else{
        return true;
    }
}
