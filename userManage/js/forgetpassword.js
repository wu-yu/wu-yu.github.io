$(function(){
	webViewJavascriptBridgeReady(function(){
		nativeGetDfAccount(function(defaultAccount){
			if(defaultAccount){
				$('#userIdIn').val(defaultAccount);
			}
		})
	})
})


//发送验证码按钮点击事件
$('#sendYZM').click(function(event) {
	$('#yzmIn').val('');

	if($('#userIdIn').val() == ""){
		nativeAlert($.i18n.prop('placeholder1'));
	}

	if($("#phoneNum").val() == ""){
		nativeAlert($.i18n.prop('placeholder4'));
	}

	sendYzmRest($("#phoneNum").val(),'sendYZM');
});


//校验用户和手机号
$('#validateBtn').click(function(event) {
	if(areaCheck($('#sceneOne'))){
		$.blockUI();
		validate_UnP($("#userIdIn").val(),$('#phoneNum').val()).done(function(){			
			$('#sceneOne').addClass('hidden');
			$('#sceneFour').removeClass('hidden');
			window.currentUser.userId = $("#userIdIn").val();	
			window.currentUser.mobilePhone = $('#phoneNum').val();			
		}).always(function(){
			$.unblockUI();			
		});
	}
});

//validate userId and phoneNum
function validate_UnP(userId,mobilePhone){
	var dtd = $.Deferred();
	$.ajax({
		url: window.TCManagePlantformServer+'user/verify/'+userId+'?mobilePhone='+mobilePhone,
		type: 'get',
		dataType: 'json',
	})
	.done(function(data) {
		if(data.operationResult == 0){
			dtd.resolve();
		}else{
			nativeAlert($.i18n.prop(data.error.code))
			dtd.reject();
		}
	})
	.fail(function() {
		dtd.reject();
	})

	return dtd.promise();
}


//提交重置的密码
$('#submitPasswordBtn').click(function(event) {
	if(areaCheck($('#sceneFour')) && checkP1P2() && passwordNotSameAsUserId()){	
		$.blockUI();	
		var newpwd = $('#passwordIn').val();	
		var verificationcode = $('#yzmIn').val();
		nativeEncrypt([newpwd],function(encryptList){
			currentUser.newPassword = encryptList[0];
			$.ajax({
				url: window.TCManagePlantformServer+'identity/resetPassword/'+window.currentUser.userId+'?verificationcode='+verificationcode,
				type: 'post',
				dataType: 'json',
				data: JSON.stringify(currentUser),
	        	contentType:'application/json',
			})
			.done(function(data) {
				$.unblockUI();
				if(data.operationResult == 0){
					nativeAlert($.i18n.prop('reSetPwSuccess'),'',function(rs){
		                var data = {userName:currentUser.userId,password:newpwd};
		                window.WebViewJavascriptBridge.callHandler(
		                        'finish'
		                        , data
		                );   
					});											
				}else{
                    nativeAlert($.i18n.prop(data.error.code));    
				}

			}).always(function(){
				$.unblockUI();			
			})
		})
	}
});

//二次确认
function checkP1P2(){
    if($('#reInputPassword').val() != $('#passwordIn').val()){   
        nativeAlert($.i18n.prop('passwordNotTheSame'))     
        return false;    
    }        
    return true;
}

//检查密码是否跟用户名一致,不允许一致
function passwordNotSameAsUserId(){
	if($('#passwordIn').val() == $("#userIdIn").val()){
		nativeAlert($.i18n.prop('passwordRule2'));
		return false;
	}else{
		return true;
	}
}