var currentSelectedCarVin;
var carList;

$(function(){     

    getCurrentUser().done(function(){
        currentSelectedCarVin = currentUser.vin;
        //获取车辆信息列表
        getVehicleList();
    })

})

function getVehicleList(){
    $.ajax({
        url: window.TCManagePlantformServer + 'vehicle?userId='+ currentUser.userId,
        type: 'get',
        dataType: 'json',
        contentType:'application/json',
        beforeSend:function(xhr){
            setAjaxHeaderTokens(xhr);
        }, 
        success:function(rs){
            carList = rs.list;
            setList(rs);
        }
    })        
}

function setList(rs){
    console.log(rs);    
    var myTemplate = Handlebars.compile($("#li-template").html());    
    $('#vehicleList').html(myTemplate(rs.list));  

    $('.radioGroup').find('li[vin="'+currentSelectedCarVin+'"]').find('.fa-radio').addClass('fa-check-circle');   

    bindPressAction();             
}

//点击列表进行车辆切换
$("#main").on('click','.list-group-item',function(){
	currentSelectedCarVin = $(this).attr('vin');
    $.blockUI();
    getVehicleCapability(currentSelectedCarVin)
    .then(function(getVehicleCapability){
       return updateCarRelateStatus(currentSelectedCarVin)
    })
    .then(function(){
        return carSwitchNotify(currentSelectedCarVin);        
    })
    .then(function(){
        location.href='./index.html';
    })
    .always(function(){
        $.unblockUI();
    })        
})

//通知原生应用车辆已经切换
function carSwitchNotify(currentSelectedCarVin){

    var dtd = $.Deferred();
    for(var index in carList){
        if(carList[index].vin == currentSelectedCarVin){

            var data = {'vehicleProfile':carList[index],'capabilityProfile':vehicleCapability}

            webViewJavascriptBridgeReady(function(){
                window.WebViewJavascriptBridge.callHandler(
                    'carSwitch'
                    , data
                    , function(responseData) {                           
                        dtd.resolve();
                    }
                );      
            });                   
            break;            
        }
    }
    return dtd.promise();
}

//长按弹出解绑菜单
function bindPressAction(){
    $(".list-group-item").hammer().bind("press", function(ev){
        releaseCar(ev);
    });
}


var vin_for_release;//解绑的汽车vin码
var carName_for_release;//解绑汽车名称
function releaseCar(ev){
    console.log(ev);
    $("#releaseCarName").text(ev.target.innerText);
    carName_for_release = ev.target.innerText;
    vin_for_release = ev.target.attributes.vin.value;
    swal(
        {   
            title: "",   
            text: $("#menu").html(),   
            showConfirmButton: false,
            allowOutsideClick:true,
            html:true,
        }
    );           
}

$('body').on('click','.release_li',function(){
    swal.close();
    window.WebViewJavascriptBridge.callHandler(
        'confirm'
        , {'message':$.i18n.prop('unbindCarTip'),'buttonText1':$.i18n.prop('confirm'),'buttonText2':$.i18n.prop('cancel')}
        , function(rs) {  
            if(rs == 1){
                if(currentUser.vin == vin_for_release){
                    console.log('currentUser.vin == vin_for_release');
                    //如果要解绑的车是当前关联的车，必须先解除关联，然后再解绑
                    unconnect_car().done(function(){
                        //解除关联后，需要通知native端解除对该车的推送
                        window.WebViewJavascriptBridge.callHandler('carSwitch', '');                              
                        //解绑车辆
                        unbind_car(vin_for_release);
                    })        
                }else{
                    unbind_car(vin_for_release);
                }                 
            }
        }
    );               
})

//解除绑定
function unbind_car(vin_for_release){     
    currentUser.vin =  vin_for_release;     
    //解绑
    $.ajax({
        url: window.TCManagePlantformServer + 'user/'+ currentUser.userId +'?operation=unbind',
        type: 'put',
        contentType:'application/json',
        dataType: 'json',
        data: JSON.stringify(currentUser),
        beforeSend:function(xhr){
            setAjaxHeaderTokens(xhr);
        }, 

    })
    .done(function(rs) {
        delVehicle(rs,vin_for_release);
    })    
}

//解除关联
function unconnect_car(){
    var dtd = $.Deferred();
    var vin='';
    updateCarRelateStatus(vin).done(function(){
        dtd.resolve();
    })                     
    return dtd.promise();
}

//更新车辆关联状态
function updateCarRelateStatus(vin){    
    var dtd = $.Deferred();
    $.ajax({
        url: window.TCManagePlantformServer + 'user/session/update',
        type: 'post',
        contentType:'application/json',
        dataType: 'json',
        data: '{"vin":"'+vin+'","sessionToken":"'+JSON.parse(sessionStorage.tcTokens).tcToken+'"}',     
        beforeSend:function(xhr){
            setAjaxHeaderTokens(xhr);
        }        
    })
    .done(function(rs) {
        if(rs.operationResult == 0){
            dtd.resolve();                   
        }else{      
            nativeToast($.i18n.prop(rs.error.code))
            dtd.reject();
        }
    }).fail(function(){                
        dtd.reject();        
    })    
    return dtd.promise();      
}


var vehicleCapability = [];//能力集常量
//获取车辆能力集
function getVehicleCapability(vin){
    var dtd = $.Deferred();
    $.ajax({
        url: window.TCManagePlantformServer + 'capability/'+vin+'?pageIndex=1&pageSize=200',//这里先固定为200，如果以后能力集个数多于200个，再更新代码
        type: 'get',
        contentType:'application/json',
        dataType: 'json',
        beforeSend:function(xhr){
            setAjaxHeaderTokens(xhr);
        }, 

    })
    .done(function(rs) {
        if(rs.serviceResult.operationResult == '0'){
            vehicleCapability = rs.list;
            dtd.resolve();                    
        }else{
            nativeToast($.i18n.prop('getCapabilityFailure'))
            dtd.reject();            
        }
    })        
    return dtd.promise();
}

function delVehicle(rs,vin_for_release){
    console.log(JSON.stringify(rs));
    if(rs.operationResult == 0){
        window.WebViewJavascriptBridge.callHandler('toast',$.i18n.prop('success'));
        $('#vehicleList').find('.list-group-item[vin='+ vin_for_release+']').remove();
    }else{   
        nativeAlert($.i18n.prop(rs.error.code));
    }        
}
