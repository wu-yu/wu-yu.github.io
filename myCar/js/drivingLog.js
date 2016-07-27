$(function(){
    getCurrentUser().done(function(){    
        if(currentUser && currentUser.vin){
            //默认查询一周内的日志
            var nowDate = new Date();
            var startDate = new Date(nowDate.setDate(nowDate.getDate()-6));
            var  endDate= new Date();   
            $('#startTime').val(startDate.format("yyyy-MM-dd"));     
            $('#endTime').val(endDate.format("yyyy-MM-dd"));
            searchDrivingLog(startDate.format("yyyy/MM/dd")+' 00:00:00',endDate.format("yyyy/MM/dd")+' 23:59:59');
        }else{
            $('#drivingTip1').html($.i18n.prop('noCarRelateTip'));
        }
    })
       
})


var param = {};

function searchDrivingLog(startDate,endDate){

    param = {};
    var startTime;
    var endTime;

    $("#loadmore").attr('pageIndex','1');      

    if(startDate && endDate){
        startTime = startDate;
        endTime = endDate;
    }else{
        startTime = $('#startTime').val().replace(/-/g,'/')+' 00:00:00';
        endTime = $('#endTime').val().replace(/-/g,'/')+' 23:59:59';
    }


    if($.trim(startTime) == '' || $.trim(endTime) == ''){
        nativeAlert($.i18n.prop('dateRangeNotSelect'));
        return false;
    }

    if(new Date(startTime) > new Date(endTime)){
        nativeAlert($.i18n.prop('startDateGreaterThanEndDate'));        
        return false;       
    }

    param.startTime = startTime;
    param.endTime = endTime;
    param.pageSize = '5';
    param.pageIndex = '1';
    getDrivingData(param,function(rs){
            if(rs.list != null && rs.list.length > 0){        
            var template = Handlebars.compile($('#dItem_template').html());

            //对模板中的文字信息进行国际化
            rs.list.forEach(function(logitem){
                logitem.drivingStart=$.i18n.prop('drivingStart');
                logitem.drvingEnd=$.i18n.prop('arrive');
                logitem.mileage=$.i18n.prop('traveledDistance');
                logitem.fuelcost=$.i18n.prop('fuelConsumption');
                logitem.avspeed=$.i18n.prop('avgSpeed');
            });

            $("#dlog_list").html(template(rs.list));
                $("#loadmore").show();                            
            }else{
                var html = '<div class="tip dlog_item text-center"> <br> '+$.i18n.prop('journalLogNotFound')+' <br><br> </div>'; 
                $("#dlog_list").html(html)
            }
    })
    //搜索完之后回到顶部
    document.documentElement.scrollTop = document.body.scrollTop =0;      
}


function getDrivingData(param,callback){
    var vin = currentUser.vin;
    var url = window.TCManagePlantformServer+ 'vehicle/status/journalLog/'+vin+'?startTime='+param.startTime+'&endTime='+param.endTime+'&pageSize='+param.pageSize+'&pageIndex='+param.pageIndex+'&direction=desc&sortField=startTime'+'&userId='+currentUser.userId;
    if(!vin) {
        nativeAlert($.i18n.prop('noCarRelateTip'));
        return false;
    }

    $.blockUI();
    $.ajax({
        url:url,
        type:'get',
        dataType:'json',
        contentType:'application/json',
        beforeSend:function(xhr){
            setAjaxHeaderTokens(xhr);
        }, 
    })
    .done(function(rs){
        console.log(rs);        
        if(rs.serviceResult.operationResult==0){
            callback(rs);
        }else{
            nativeToast($.i18n.prop(rs.serviceResult.error.code));
        }                
    })
    .fail(function(){

    })
    .always(function() {
        $.unblockUI();
    });     
}

$('#d_search_btn').on('click',function(event) {
    searchDrivingLog();
    $("#loadmore").html($.i18n.prop('loadmore'));    
});


$("#loadmore").click(function(event) {
    param.pageIndex = parseInt($(this).attr('pageIndex')) + 1;    
    getDrivingData(param,function(rs){
            if(rs.list && rs.list.length > 0){
                var template = Handlebars.compile($('#dItem_template').html());
                //对模板中的文字信息进行国际化
                rs.list.forEach(function(logitem){
                    logitem.drivingStart=$.i18n.prop('drivingStart');
                    logitem.drvingEnd=$.i18n.prop('arrive');
                    logitem.mileage=$.i18n.prop('traveledDistance');
                    logitem.fuelcost=$.i18n.prop('fuelConsumption');
                    logitem.avspeed=$.i18n.prop('avgSpeed');
                });                
                $("#dlog_list").append(template(rs.list));    
                $("#loadmore").attr('pageIndex',param.pageIndex);                    
            }else{
                $("#loadmore").html($.i18n.prop('noMore'));
            }
            
    })
});