/**
短信验证码处理校验模块,依赖jquery和jquery.i18n
*/

/*重置发送验证码
phoneNum：发送到的手机号码;domId：发送验证码的触发按钮id	
*/
function sendYzmRest(phoneNum,domId){
	var dtd = $.Deferred();
	$.get(window.TCManagePlantformServer+'verification/mobilePhone/'+phoneNum+'?language='+ (sessionStorage.geelyapp_language != '2'?'zh_CN':'en_US'), function(data) {
		console.log(data)
		if(data.serviceResult.operationResult == 0){	
			time(document.getElementById(domId));
			nativeToast($.i18n.prop('validateCodeSended'));
			dtd.resolve();		
		}else{
			nativeAlert($.i18n.prop(data.serviceResult.error.code));
			dtd.reject();
		}
	},'json');
	return dtd.promise();
}

//直接发送手机验证码
function sendPhoneYzm(phonenum,domId){
	var dtd = $.Deferred();
	$.get(window.TCManagePlantformServer+'verification/'+'mobilePhone/'+phonenum+'?language='+ (sessionStorage.geelyapp_language != '2'?'zh_CN':'en_US'),function(data){
		if(data.serviceResult.operationResult == 0){	
			time(document.getElementById(domId));
			nativeToast($.i18n.prop('validateCodeSended'));
			dtd.resolve();		
		}else{
			nativeAlert($.i18n.prop(data.serviceResult.error.code));
			dtd.reject();
		}
	},'json');
	return dtd.promise();
}

//重新发送验证码倒计时
var nTimeCount = 60;
var nStartTime = 0;
var nEndTime = 0;
// setTimeout
function time(domObj) {
  if (0 == nStartTime) {
    nStartTime = +new Date(); // 初始化记下开始计时的时间戳
	domObj.setAttribute("disabled", true);
	domObj.innerHTML=$.i18n.prop('reSend')+"(" + nTimeCount + ")";    
  }
  nEndTime = +new Date(); // 初始化记下开始计时的时间戳
  nPassSec = Math.floor((nEndTime - nStartTime) / 1000); // 时间戳相减获得pass的毫秒数， /1000向下取整获得过去的秒数
  var remainTime = nTimeCount - nPassSec; // 时间总数减去pass的秒数获得所剩的时间
  if (remainTime > 0) {
  	domObj.innerHTML=$.i18n.prop('reSend')+"(" + remainTime + ")";     
    setTimeout(function() {
      time(domObj);
    }, 1000);
  } else {
	domObj.removeAttribute("disabled");	
	domObj.innerHTML = $.i18n.prop('getValidatecode');
	//重新初始化验证码参数
	nTimeCount = 60;
	nStartTime = 0;
	nEndTime = 0;
  }
}


//校验验证码
function validYZM(phoneNum,yzm){
	var dtd = $.Deferred();
	$.ajax({
		url: window.TCManagePlantformServer+'verification/'+phoneNum+'?verificationcode='+yzm,
		type: 'post',
		dataType: 'json',
        contentType:'application/json',
        beforeSend:function(xhr){
            setAjaxHeaderTokens(xhr);
        },         
	})
	.done(function(data) {
		if(data.operationResult == 0){
			return dtd.resolve();
		}else{
			nativeAlert($.i18n.prop(data.error.code));
			return dtd.reject();
		}
	})
	return dtd.promise();
}