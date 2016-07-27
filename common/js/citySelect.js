/**
城市选择器插件

依赖
native.js、common.js
jQuery、citySelect.css、font-awesome字体图标库

@author wuyu
create date:2016.04.26
**/

;(function($,window){
    //城市列表
    var cityListArray = [];
    //排序好的省份
    var provinces = ['直辖市','特别行政区','安徽','福建','甘肃','广东','广西','贵州','海南','河北','河南','黑龙江','湖北','湖南','吉林','江苏','江西','辽宁','内蒙古','宁夏','青海','山东','山西','陕西','上海','四川','天津','西藏','新疆','云南','浙江'];
    //按照省份分组好的城市数据
    var groupCityList = {};

    //默认参数
/*    var options = {
        'defaultSelect':null,
        'selectedCallback':null,//选择城市之后的回调函数
        'language':'cn',//语言
        'selfDefinedAlert':alert//自定义的提示方法
    };*/
    var defaultSelect = '';//默认选择的城市
    var selectedCallback = '';//选择城市之后的回调函数
    var language = 'cn';//默认语言
    var selfDefinedAlert = window.alert;//自定义的提示方法，用于兼容调用原生提示框方法
    var cityRequestUrl;
    var isInit;//是否已经初始化


    //获取城市数据
    function getCityData(){
        var dtd = $.Deferred();
        var needRequestAgain = true;//是否需要重新调用接口获取城市列表
        //如果本地有城市列表缓存
        // if(localStorage.violationCityData){
        //     var violationCityData = JSON.parse(localStorage.violationCityData);
        //     var now = new Date().getTime();
        //     //如果城市列表缓存未过期
        //     if(now < violationCityData.ExpiresDateTime){
        //         cityListArray = violationCityData.cityList;
        //         needRequestAgain = false;
        //         dtd.resolve(cityListArray);                
        //     }else{
        //         needRequestAgain = true;
        //     }
        // }
        if(needRequestAgain){
            $.ajax({
                url: cityRequestUrl,
                type: 'get',
                dataType: 'json',
                cache:true,
                contentType:'application/json',
                beforeSend:function(xhr){
                    setAjaxHeaderTokens(xhr);
                }, 
            }).done(function(data){
                if(data.operationResult == '0' && data.support_info.length > 0){
                    cityListArray = data.support_info;
                    dtd.resolve(cityListArray);
                }else{
                    cityListArray = [];
                    dtd.resolve(cityListArray);                    
                }
            }) 
        }
        return dtd.promise();
    }

    //按照省份、直辖市、特别行政区进行分组
    function groupCity(cityListArray){
        var dtd = $.Deferred();
        for(var i in provinces){
            var group = [];
            if(provinces[i] == '直辖市'){
                group = cityListArray.filter(function(value){
                    if(value.city.indexOf('北京') > -1 || value.city.indexOf('天津') > -1 || value.city.indexOf('上海') > -1 ||
                     value.city.indexOf('重庆') >-1){
                        return true;
                     }
                })
            }else if(provinces[i] == '特别行政区'){
                group = cityListArray.filter(function(value){
                    if(value.city.indexOf('香港') > -1 || value.city.indexOf('澳门') > -1){
                        return true;
                     }
                })
            }else{
                group = cityListArray.filter(function(value){
                    if(value.province.indexOf(provinces[i]) > -1){
                        return true;
                     }
                })
            }
            groupCityList[provinces[i]] = group;
        }
        console.log(groupCityList);
        dtd.resolve(groupCityList);
        return dtd.promise();
    }

    //创建城市html
    function createCityListDom(groupCityList){
        var $html = $('<div class="citySelector"><div class="header"><div class="done">完成</div><div class="back">返回</div><div class="title">选择城市</div></div><div class="csearch"> <input type="text" class="csearchIn" placeholder="输入城市名字进行搜索"></div></div>');
        var $cityList = $('<div class="cityList"></div>');
        for(var i in provinces){
            var province =  provinces[i];
            var $province = $('<div class="province"> <div class="ptitle">'+province+'</div></div>');
            var cityGroup = groupCityList[province];
            if(cityGroup.length > 0){
                //如果该省份有支持的城市,就展示该省
                for(var j in cityGroup){
                    var $city = $('<div class="city"><div class="check"><i class="fa radio"></i></div> <div class="name">'+cityGroup[j].city+'</div></div>');
                    var cityInfo = JSON.stringify(cityGroup[j]);
                    $city.attr('cityInfo',cityInfo);//一定要以这种方式存放，不能拼在上面，不然会多出个“=”号，造成json解析出错
                    $city.attr('cityId',cityGroup[j].city_id);
                    $province.append($city);
                }
                $cityList.append($province);
            }
        }
        $html.append($cityList);
        return $html;
    }


    var oldSearchVal='';
    var timeout;
    //为返回城市选项、按钮、确定按钮 绑定事件
    function bindBtnFunction($container){
        //输入搜索事件
        BindSearchEvent($container);

        //城市勾选事件
        BindCityClickEvent($container);

        //返回按钮事件
        $container.on('click','.back',function(){
            $container.find('.citySelector').css('display','none');            
        })

        //完成按钮事件
        $container.on('click','.done',function(){
             var $selectRadio = $container.find('.radio.fa-check-circle');
             if($selectRadio.length == 0){
                selfDefinedAlert('请选择一个城市');
             }else{
                console.log($selectRadio.closest('.city').prop('outerHTML'));
                var cityInfo = JSON.parse($selectRadio.closest('.city').attr('cityInfo'));
                selectedCallback(cityInfo);
                $container.find('.citySelector').css('display','none');
             }            
        })
    }


    //搜索事件
    function BindSearchEvent($container){
        $container.on('input','input[class=csearchIn]',function(){
            var newSearchVal = $(this).val();    
            clearTimeout(timeout);
            if(newSearchVal != oldSearchVal){        
                timeout = setTimeout(function(){
                    oldSearchVal = newSearchVal;
                    if(newSearchVal != ''){
                        var searchResultArray = cityListArray.filter(function(value) {
                            if(value.city.indexOf(newSearchVal) > -1 || value.city_en.indexOf(newSearchVal) > -1){
                                return true;
                            }
                        });       
                        var $province = $('<div class="province"> <div class="ptitle">'+'搜索结果'+'</div></div>');
                        for(var j in searchResultArray){
                            var $city = $('<div class="city"><div class="check"><i class="fa radio"></i></div> <div class="name">'+searchResultArray[j].city+'</div></div>');
                            var cityInfo = JSON.stringify(searchResultArray[j]);
                            $city.attr('cityInfo',cityInfo);//一定要以这种方式存放，不能拼在上面，不然会多出个“=”号，造成json解析出错
                            $city.attr('cityId',searchResultArray[j].city_id);
                            $province.append($city)                     
                        }            
                        $container.find('.cityList').html($province);                
                        BindCityClickEvent($container);                        

                    }else{
                        var $html = createCityListDom(groupCityList);
                        $container.find('.cityList').html($html.find('.cityList').html());                        
                    }

                },500);
            }            
        })      
    }


    //城市勾选事件
    function BindCityClickEvent($container){
        $container.on('click','.city',function(){
            $container.find('.radio').each(function(index, val){
                $(this).removeClass('fa-check-circle');
            })
            $(this).find('.radio').addClass('fa-check-circle');            
        })    
    }


    $.fn.extend({
        //初始化城市选择器
        initCitySelector:function(initOptions){
            var dtd = $.Deferred();
            var $container = $(this);

            defaultSelect = initOptions.defaultSelect;
            selectedCallback = initOptions.selectedCallback;
            language = initOptions.language;
            selfDefinedAlert = initOptions.selfDefinedAlert;
            cityRequestUrl = initOptions.cityRequestUrl;

            $.when(getCityData())
                .then(groupCity)
                .then(function(groupCityList){
                    //创建城市dom
                    var $html = createCityListDom(groupCityList);
                    $container.html($html);
                    //勾选默认城市
                    if(defaultSelect){
                        $container.find('.city[cityId='+defaultSelect+']').find('.radio').addClass('fa-check-circle');
                    }
                    //绑定返回按钮、确定的事件
                    bindBtnFunction($container);
                    dtd.resolve();
                })
            isInit = true;                
            return dtd.promise();
        },
        //显示城市选择器
        showCitySelector:function(){
           $(this).find('.citySelector').css('display','block');
        },
        isInit:function(){
            return isInit;
        }
    })



})(jQuery,window)

