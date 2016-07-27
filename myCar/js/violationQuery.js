    var carModel = new DataModel('car');
    var violationQuery;

    $(function(){
        getCurrentServer().done(function(){
            violationQuery = JSON.parse(sessionStorage.violationQuery);
            carModel.set('plateNo',violationQuery.plateNo);        
            carModel.set('vin',violationQuery.vin);        
            carModel.set('engineNo',violationQuery.engineNo); 
            carModel.set('ihuId',violationQuery.ihuId);
            //从localStorage取出城市归属地
            if(localStorage.belongCityInfo){
                var belongCityInfo = JSON.parse(localStorage.belongCityInfo);
                $('#belongCity').text(belongCityInfo.city);
                $('#belongCity').attr('cityInfo',localStorage.belongCityInfo);                
            }                  
        })     
                
    })

    $('body').on('click', '#selectCity', function(event) {
        if($('#city').isInit()){
            $('#city').showCitySelector();
        }else{
            $.blockUI(); 
            var defaultSelectCityId = '';           
            if(localStorage.belongCityInfo){
                defaultSelectCityId = JSON.parse(localStorage.belongCityInfo).city_id;
            }    
            $('#city').initCitySelector({
                'defaultSelect':defaultSelectCityId,//默认勾选的城市代码
                'selectedCallback':selectedCallBack,//城市选择完成之后的外部回调函数
                'language':'cn',//设置语言
                'selfDefinedAlert':nativeAlert,//设置提示框函数，适配原生
                'cityRequestUrl':window.TCManagePlantformServer+'peccancy/supported_city?ihu_id='+violationQuery.ihuId+'&service_id=s9&cities=all',
            }).always(function(){
                $.unblockUI();
                $('#city').showCitySelector();                
            })  
        }

    });

    //城市选择完成后的回调函数
    function selectedCallBack(cityInfo){
        console.log('selected cityInfo',cityInfo);
        $('#belongCity').text(cityInfo.city);
        $('#belongCity').attr('cityInfo',JSON.stringify(cityInfo));

        //保存城市归属地到localStorage
        localStorage.belongCityInfo = JSON.stringify(cityInfo);
    }

    $('#query').click(function(event) {
        if(areaCheck($('#carInfoDiv'))){
            violationQuery = carModel.getDatas();
            var cityParam =  $('#belongCity').attr('cityInfo');
            if(cityParam){
                var belongCityInfo = JSON.parse(cityParam);
                $.blockUI();
                $.ajax({
                    url: window.TCManagePlantformServer+'peccancy/violations?ihu_id='+violationQuery.ihuId+'&service_id=s9&license_platenum='+violationQuery.plateNo+'&engine_num='+violationQuery.engineNo+'&body_num='+violationQuery.vin+'&city='+belongCityInfo.city_en+'&city_en='+belongCityInfo.city_en+'&province='+belongCityInfo.province+'&city_id='+belongCityInfo.city_id+'&province_en='+belongCityInfo.province_en,
                    type: 'get',
                    dataType: 'json',
                    contentType:'application/json',
                    beforeSend:function(xhr){
                        setAjaxHeaderTokens(xhr);
                    }, 
                }).done(function(data){
                    if(data.violation_info == null || data.violation_info.length ==0){
                        $('#violationList').empty();
                        nativeToast($.i18n.prop('NoViolationInfoFound'));
                    }else{
                        var template = Handlebars.compile($('#template').html());
                        var html = template(data.violation_info);
                        $('#violationList').html(html);  
                    }                                  
                }).always(function(data){
                    $.unblockUI();                    
                })  
            }else{
                nativeAlert($.i18n.prop('PleaseSelectCity'));
            }       
        }    
    });
