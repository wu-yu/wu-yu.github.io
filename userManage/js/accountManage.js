
var baseInfoModel = new DataModel('baseinfo');

$(function(){

    getCurrentUser().done(function(){
        //初始化页面
        setUserInfo();
    })

})

function setUserInfo(){
    baseInfoModel.setDatas(currentUser);
    baseInfoModel.set('role','车主');
    var mobilePhone = utiljs.getStarMobileNumber(currentUser.mobilePhone);
    $('#mobilePhoneSpan').text(mobilePhone);

    //是否可以编辑角色
    var enableRoleModify = getParam('roleModify');
    if(enableRoleModify == 'true'){
        $('#role_Li').prepend('<span class="fa fa-angle-right pull-right"></span>');
        $('#role_Li').attr('href','./roleModify.html');
    }       

    //当前角色为车主时，才显示多用户管理菜单链接
    if(baseInfoModel.get('role') == '车主'){
        $("#muti_user_manage").removeClass('hidden');
    }   
             
}    

//点击编辑按钮显示输入框
$(".fa-pencil-square-o").click(function(event) {
    $(this).siblings('.spanInfo').addClass('hidden');
    $(this).siblings('.inputInfo').removeClass('hidden').focus();
});


//获取到焦点时，保存old data
$('.inputInfo').focus(function(event) {
    $(this).data('old-data',$(this).val());
});

//焦点失去后提交用户修改的信息
$(".inputInfo").focusout(function(event) {
    if($(this).attr('type') != 'password'){                   
        $(this).siblings('.spanInfo').removeClass('hidden');            
    }
    $(this).addClass('hidden');

    //校验
    if(inputValidate($(this))){
        //提交   
        saveBaseInfo();        
    }else{        
        //恢复原来的数据
        $(this).val($(this).data('old-data'));
        $(this).prev('span').text($(this).data('old-data'));
        baseInfoModel.set($(this).attr('data-bind-baseinfo'),$(this).data('old-data'));
        //提示
        nativeAlert($(this).attr('validate_msg'));           
    }

});


//保存用户信息的修改
function saveBaseInfo(){

    baseInfoModel.set('createTime',new Date().getTime());
    baseInfoModel.set('updateTime',new Date().getTime());
    var user = baseInfoModel.getDatas();  
    delete user.role;//目前没有这个字段，先去掉，不然会报错。 

    jQuery.ajax({
      url: window.TCManagePlantformServer + 'user/' + user.userId + '?operation=mod',
      type: 'put',
      dataType: 'json',
      contentType:'application/json',
      data: JSON.stringify(user),
      beforeSend:function(xhr){
          setAjaxHeaderTokens(xhr);
      }, 
      success: function(rs) {
            console.log(JSON.stringify(rs));
            if(!rs.operationResult == 0){                   
                nativeAlert($.i18n.prop(rs.error.code))
            }else{
                nativeToast($.i18n.prop('modifySuccess'));            
            }
      },
      error: function(xhr, textStatus, errorThrown) {
            // nativeToast($.i18n.prop('failure'));   
            console.error('save baseInfo error',textStatus);          
      }
    });

}

$("#roleSelect").on('click','.roleNameSpan',function(){
    $(this).siblings('.fa-radio').trigger('click');
})

$('#logoutbtn').click(function(event) {
    webViewJavascriptBridgeReady(function(){
        window.WebViewJavascriptBridge.callHandler(
                'JsLogout'
                , '0'
        );   
    });   
});