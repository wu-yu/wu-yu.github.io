window.TCManagePlantformServer = {};
window.currentUser = {};

$(function(){

    //jquery 超时、session过期设置
    $.ajaxSetup({
        timeout:10000,
        dataFilter:function(data,dataType){
            //如果30008 session错误，跳转界面重新登录界面
            if(dataType == 'json'){
                var tmpData = JSON.parse(data);
                if(tmpData.serviceResult != null 
                && tmpData.serviceResult.error != null && tmpData.serviceResult.error.code == '30008'){
                    //将返回的数据也置为空，避免还没有来得及跳转登录页面，
                    //就return data然后触发ajax.fail中的逻辑弹出30008对应的国际化提示
                    data = {};                    

                    //sessionStorage.hasBeenAlert的作用是避免因多个ajax同时调用，
                    //导致多次调用nativeRelogin()。
                    if(typeof(sessionStorage.hasBeenAlert) == 'undefined'){
                        sessionStorage.hasBeenAlert = true;
                        nativeRelogin();//跳转重新登录页面
                    }
                }                
            }
            return data;
        }
    });

    //监听ajax错误
    $(document).ajaxError(function(event,request, settings){
        //网络不可用提示
        if(request.status == 0){
            nativeToast($.i18n.prop('networkError'));            
        }else if(request.status == 500){
            nativeToast('500 internal server error ');
        }
    });

    //语言国际化（其中顺便进行了数据初始化）
    languageAuto();

    //增加回到顶部按钮
    backToTop();          
})

//===================================================================================
/**
为ajax设置header鉴权码
**/
function setAjaxHeaderTokens(xhr){
    nativeGetTokens(function(tokens){
        xhr.setRequestHeader('accessToken',tokens.accessToken);     
        xhr.setRequestHeader('idToken',tokens.idToken);
        xhr.setRequestHeader('tcToken',tokens.tcToken);
    })
}


//=============================================================================================
/**
获取当前服务器地址
**/
function getCurrentServer(){
    var dtd = $.Deferred(); 

    webViewJavascriptBridgeReady(function(){
        nativeGetInitData(function(data){
            window.TCManagePlantformServer = sessionStorage.geelyapp_server = 'http://'+ data.baseUrl + '/geelyTCAccess/tcservices/';
            dtd.resolve();                
        })                
    });    

    return dtd.promise();
}

//=============================================================================================
/**
获取当前用户
**/
function getCurrentUser(){

    var dtd = $.Deferred(); 
    getCurrentServer().done(function(){
        
        //先获取一次tokens，防止异步的问题
        webViewJavascriptBridgeReady(function(){
            nativeGetTokens(function(rs){
                window.currentUser.userId = sessionStorage.geelyapp_userId;
                getUserByAjax().done(function(){
                    dtd.resolve();                             
                })                   
            }); 
        });                        

    })
    return dtd.promise();
}

function getUserByAjax(){
    var dtd = $.Deferred();
    $.ajax({
        url: window.TCManagePlantformServer+'user/' + window.currentUser.userId+'?criteria=USERID',
        type: 'get',
        dataType: 'json',
        contentType:'application/json',
        beforeSend:function(xhr){
            setAjaxHeaderTokens(xhr);
        }, 
    })
    .done(function(rs) {
        if(rs.serviceResult.operationResult == 0){   
            if(rs.list.length > 0){
                window.currentUser = rs.list[0]; 
                //sprint0.9之后不再维护vin和user的关系，在这里将vin传给currentUser
                currentUser.vin = sessionStorage.currentVin;      
                console.log('currentUser',window.currentUser);  
                dtd.resolve(); 
            }else{
                //提示用户数据为空
                nativeAlert($.i18n.prop('10019'));
                dtd.reject();
            }                      
        }else{
            nativeToast($.i18n.prop(rs.serviceResult.error.code));
            dtd.reject();
        }
    })    
    return dtd.promise();
}

//=============================================================================================
/**加载语言文件
 language:1：cn(中文),2：en(英文)
 国际化完成后会触发'loadLanguageComplete'事件
*/
function loadLanguage(language){ 
    var dtd = $.Deferred();
    switch(language){
        case '1':
            language = 'cn';
            break;
        case '2':
            language = 'en';
            break;
        default:
            language = 'en';
    }

    jQuery.i18n.properties({
        name : 'strings', //资源文件名称
        path : '../common/i18n/', //资源文件路径
        mode : 'map', //用Map的方式使用资源文件中的值
        language : language,
        callback : function() {//加载成功后设置显示内容
            $("[data-localize]").each(function() {
                var elem = $(this),
                localizedValue = jQuery.i18n.map[elem.data("localize")];                
                if (elem.is("input[type=email],input[type=number],input[type=text],input[type=password],input[type=search]")) {
                    elem.attr("placeholder", localizedValue);
                    if(elem.attr('validate_msg')){
                        var msg = jQuery.i18n.map[elem.attr('validate_msg')];
                        elem.attr('validate_msg',msg)
                    }
                } else if (elem.is("input[type=button]") || elem.is("input[type=submit]")) {
                    elem.attr("value", localizedValue);
                }else if(elem.is("p,div")){
                    elem.html(localizedValue);
                }else {
                    elem.text(localizedValue);
                }
            });       
            $(document).trigger('loadLanguageComplete');//触发国际化完成事件
            dtd.resolve();                 
        }
    });
    return dtd.promise();
}

    //语言国际化
    function languageAuto(){
        var dtd = $.Deferred();
        webViewJavascriptBridgeReady(function(){
            nativeGetInitData(function(data){
                loadLanguage(sessionStorage.geelyapp_language).done(function(){
                    //设置原生的title
                    window.WebViewJavascriptBridge.callHandler('setTitle',document.title);                    
                    dtd.resolve();
                });    
            })                
        }); 
         return dtd.promise();
    }
    
//=========================================================================================
//【url参数处理模块】
/**从url链接获取参数的方法（不含解密操作）*/
function getParam(paramName) {
    var url = window.location.href;
    var params = {};
    if (url.indexOf("?") != -1) {
        url = url.split("?")[1];
        var strs = url.split("&");
        for (var i = 0; i < strs.length; i++) {
            params[strs[i].split("=")[0]] = strs[i]
                    .split("=")[1];
        }
    }
    return params[paramName];
}
//=========================================================================================
//【input输入校验模块】
/*
对于下面这种形式的input进行校验
<input pattern="^[A-Za-z0-9]{6,20}$" 
    validate_msg="用户名为6-20个字符，只能包含字母或数字" 
    >
*/
function inputValidate($input){
    var pattern = $input.attr('pattern');
    console.log('pattern',pattern);
    console.log("$input.val()",$input.val());
    var regexp = new RegExp(pattern);
    if(!regexp.test($input.val())){       
        return false;
    }else{
        return true;
    }
}    

/**用于提交时对于某个jquery元素里面的可见的input进行输入校验*/
function areaCheck($area){

    var rs = true;

    $area.find('input:visible').each(function(index, el) {
        //非空校验，只focus到input，不提示
        if(typeof($(this).attr('required')) != 'undefined' && $.trim($(this).val()) == ''){
            $(this).focus();
            rs = false;
            return false;
        }
        //正则校验，提示
        if(!inputValidate($(this))){ 
            nativeAlert($(this).attr('validate_msg'));          
            rs = false;
            return false;
        }       
    });
    return rs;
}

//=========================================================================================
//【UI组件效果模块】

/**为类名为fa-checkbox的font awesome checkbox标签绑定勾选、取消动画效果*/
$("body").on('click','.fa-checkbox',function(){
    if($(this).hasClass('fa-check-square')){
        $(this).removeClass('fa-check-square').addClass('fa-square-o');
    }else{
        $(this).removeClass('fa-square-o').addClass('fa-check-square');
    }    
})

/**为类名为fa-switch的font awesome toggle开关标签绑定开、关动画效果
$("body").on('click','.fa-switch',function(){
    if($(this).hasClass('fa-toggle-on')){
        $(this).removeClass('fa-toggle-on').addClass('fa-toggle-off');
    }else{
        $(this).removeClass('fa-toggle-off').addClass('fa-toggle-on');
    }    
})
*/

/**为类名为fa-radio的 font awesome 单选radio绑定动画效果*/
//【注意】：.fa-radio需要在.radioGroup的父节点下存放
$('body').on('click','.list-group-item',function(){
    if($(this).find('.fa-radio').length != 0){
        //所有都设为未选
        var $theClickOne = $(this).find('.fa-radio');
        if($(this).closest('.radioGroup').length == 0){
            console.error('发现错误,fa-radio缺少.radioGroup父节点,请检查html');
            return false;
        }
        $(this).closest('.radioGroup').find('.fa-radio').each(function(index, val) {
                $(this).removeClass('fa-check-circle');                                              
        });
        //设自己为已选
        $theClickOne.addClass('fa-check-circle');
    }  
})

/** li-group-item 点击效果*/
$("body").on('hover','.list-group-item',function(){
    $(this).addClass('active');
})
//=========================================================================================
//【双向数据绑定模块】
/**view、model双向数据绑定*/
function DataBinder(object_id){
    //使用一个jQuery对象作为简单的订阅者发布者
    var pubSub = jQuery({});

    //我们希望一个data元素可以在表单中指明绑定：data-bind-<object_id>="<property_name>"        

    var data_attr = "bind-" + object_id,
            message = object_id + ":change";

    //使用data-binding属性和代理来监听那个元素上的变化事件
    // 以便变化能够“广播”到所有的关联对象   

    jQuery(document).on("change","[data-" + data_attr + "]",function(evt){
        var $input = jQuery(this);
        pubSub.trigger(message, [ $input.data(data_attr),$input.val()]);
    });

    //PubSub将变化传播到所有的绑定元素，设置input标签的值或者其他标签的HTML内容   

    pubSub.on(message,function(evt,prop_name,new_val){
        jQuery("[data-" + data_attr + "=" + prop_name + "]").each(function(){
        var $bound = jQuery(this);

        if($bound.is("input,textarea")){
            $bound.val(new_val);
        }else if($bound.is("select")){
            $bound.val(new_val);
            $bound.find('option[value='+new_val+']').attr('selected');
            $bound.find('option:contains('+new_val+')').attr('selected');
        }else{
            $bound.html(new_val);
        }
        });
    });

    return pubSub;
}

function DataModel(uid){
    var binder = new DataBinder(uid),

        dataModel = {
            datas: {},

            //属性设置器使用数据绑定器PubSub来发布变化   

            set: function(attr_name,val){
                this.datas[attr_name] = val;
                binder.trigger(uid + ":change", [attr_name, val, this]);
            },

            get: function(attr_name){
                return this.datas[attr_name];
            },

            setDatas:function(jsonObj){
                for(var key in jsonObj){
                    this.set(key,jsonObj[key]);
                }
            },

            getDatas:function(){
                return this.datas;
            },

            _binder: binder
        };

        binder.on(uid +":change",function(evt,attr_name,new_val,initiator){
            if(initiator !== dataModel){
                dataModel.set(attr_name,new_val);
            }
        })

    return dataModel;
}
//=========================================================================================
//【工具类函数模块】
function goto(url){
    location.href=url;
}

//日期格式化
Date.prototype.format = function(format){
 
//   使用方法
//   var now = new Date();
//   var nowStr = now.format("yyyy-MM-dd hh:mm:ss");
//   //使用方法2:
//   var testDate = new Date();
//   var testStr = testDate.format("YYYY年MM月dd日hh小时mm分ss秒");
//   alert(testStr);
//   //示例：
//   alert(new Date().format("yyyy年MM月dd日"));
//   alert(new Date().format("MM/dd/yyyy"));
//   alert(new Date().format("yyyyMMdd"));
//   alert(new Date().format("yyyy-MM-dd hh:mm:ss"));
 
  var o = {
   "M+" : this.getMonth()+1, //month
   "d+" : this.getDate(), //day
   "h+" : this.getHours(), //hour
   "m+" : this.getMinutes(), //minute
   "s+" : this.getSeconds(), //second
   "q+" : Math.floor((this.getMonth()+3)/3), //quarter
   "S" : this.getMilliseconds() //millisecond
  }
 
  if(/(y+)/.test(format)) {
   format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  }
 
  for(var k in o) {
   if(new RegExp("("+ k +")").test(format)) {
    format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
   }
  }
   return format;
 }

 //==================================================================================
 //【回到顶部】
 function backToTop(){
    var $html = $('<aside class="topbtn j_topBtn" id="j_toTop" style="display: none;"> <i class="fa fa-arrow-circle-up"></i> </aside>');
    $('body').append($html);
    var toTopEle = document.getElementById('j_toTop'),
    prevScrollHeight = 0,
    removeTimer = 0;
    if(toTopEle.length == 0){
        return false;
    }
    window.addEventListener('scroll',
    function() {
      if (document.body.scrollTop > window.innerHeight * 1) {
        toTopEle.style.display = 'block';
        if (removeTimer) {
          clearTimeout(removeTimer);
        }
        removeTimer = setTimeout(function() {
            toTopEle.style.display = 'none';
          },
          3000);
      } else {
        toTopEle.style.display = 'none';
      }
      prevScrollHeight = document.body.scrollTop;
    });
    toTopEle.addEventListener('click',
    function() {
      window.scrollTo(0, 0);
    },
    false);    
 }


 /*能力集控制函数
 对于每一个含有requiredCapability属性的dom进行能力集判断 
 包含的就将该dom展示
 用法：
 <button requiredCapability="send_to_car">发送到车</button>
 */
 function vehicleCapabilityController(){

    if(sessionStorage.capabilityProfile == 'undefined'){
        return false;
    }

    $('[requiredCapability]').each(function(){
        //该dom要求的能力集的function_id
        var requiredCapabilityId = $(this).attr('requiredCapability');
        //当前车辆的能力集
        var currentCapability = JSON.parse(sessionStorage.capabilityProfile);
        //判断是否包括所需能力
        for(var i in currentCapability){
            if(currentCapability[i].functionId == requiredCapabilityId && currentCapability[i].valueEnable == true){
                $(this).css('display','block');
                break;
            }
        }
    })
 }