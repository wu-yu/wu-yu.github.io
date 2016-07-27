
;$(function($){
	/*bridgewebview**/
	function connectWebViewJavascriptBridge(callback) {
	       if (window.WebViewJavascriptBridge) {
	           callback(WebViewJavascriptBridge)
	       } else {
	           document.addEventListener(
	               'WebViewJavascriptBridgeReady'
	               , function() {
	                   callback(WebViewJavascriptBridge)
	               },
	               false
	           );
	       }
	   }

	   connectWebViewJavascriptBridge(function(bridge) {
	       bridge.init(function(message, responseCallback) {
	           responseCallback();
	       });
	       commonBridge(bridge);
	   });

}())

var webViewJavascriptBridgeReady = function(callback){
  if (window.WebViewJavascriptBridge) {
	           callback.call();
   } else {
       document.addEventListener(
           'WebViewJavascriptBridgeReady'
           , function() {
               callback.call();
           },
           false
       );
   }
}

//提示后消失
function nativeToast(text,callback){
    window.WebViewJavascriptBridge.callHandler('toast',text,callback);
}

//提示后点击确定才消失
//不传buttonText参数，使用native端默认的文字
function nativeAlert(text,buttonText,callback){
	var data = {};
	if(buttonText){
		data = {'message':text,'buttonText':buttonText};
	}else{
		data = {'message':text};
	}
    window.WebViewJavascriptBridge.callHandler('alert',data,callback);
}

//确认提示框
//返回结果：1（确定），0（取消）
function nativeConfirm(text,ok_button_text,cancel_button_text,callback){	
    window.WebViewJavascriptBridge.callHandler('confirm',{'message':text,'buttonText1':ok_button_text,'buttonText2':cancel_button_text},function(rs){callback(rs)});
}


//获取鉴权码
//返回结果：{'accessToken':'xx','refreshToken':'xx','expiresIn':'xx',idToken:'xx','tcToken':'xx'}
function nativeGetTokens(callback){
	if(sessionStorage.tcTokens){
		callback(JSON.parse(sessionStorage.tcTokens));
	}else{
    	window.WebViewJavascriptBridge.callHandler('getTokens','',function(rs){
			sessionStorage.tcTokens = rs;			    	
    		callback(JSON.parse(rs));
    	});			
	}
}



//加密
//obj:字符串数组
//callback(rs),rs为加密后的字符串数组
function nativeEncrypt(obj,callback){
	console.log('nativeEncrypt',obj.toString());
    window.WebViewJavascriptBridge.callHandler('encrypt',obj.toString(),function(rs){
    	callback(rs.split(','));
    });	
}


/*
获取基础信息
返回格式{userId:'',language:'',baseUrl:'',vin:'',registrationId:'',capabilityProfile:''}
*/  
function nativeGetInitData(callback){		
    window.WebViewJavascriptBridge.callHandler('getInitData','',function(rs){
    	console.log('nativeGetInitData\n'+rs);
    	var data = JSON.parse(rs);
        sessionStorage.geelyapp_userId = data.userId;//用户id
        window.TCManagePlantformServer = sessionStorage.geelyapp_server = 'http://'+ data.baseUrl + '/geelyTCAccess/tcservices/';//服务器地址                
        sessionStorage.geelyapp_language = data.language;//采用语言
        sessionStorage.currentVin = data.vin;//车辆vin码
        sessionStorage.registrationId = data.registrationId;//消息别名
        sessionStorage.capabilityProfile = JSON.stringify(data.capabilityProfile);//当前车辆能力集   
        callback(data);
    });		
}


/**
获取默认登录名，返回默认登录名或者空字符串（如果没有默认登录名的话）
*/
function nativeGetDfAccount(callback){
	window.WebViewJavascriptBridge.callHandler('getDefaultAccount','',function(rs){
		callback(rs);
	})
}


/**跳转回重新登录界面*/
function nativeRelogin(){
	window.WebViewJavascriptBridge.callHandler('reLogin');	
}

//给原生调用
function commonBridge(bridge){
	bridge.registerHandler("userServices", function(data){ 
		console.log(data)
		window.location.href = 'userServices.html';
	})
}