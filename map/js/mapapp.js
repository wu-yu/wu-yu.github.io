  	var map;//用于搜索的地图
  	var driving_map;//用于展示路线规划的地图
  	var driving;//路线规划类
  	var toolBar;//地图工具类
  	var placeSearch;//地图搜索类
    var personalPonit;//人的起始坐标
    var personalAddress;//人的地理位置名称
  	var fromPoint = "";//起点坐标
  	var toPoint = {lng:"",lat:""};//终点坐标
  	var vehicleMarker;//我的车点标注
    var personalMarker;
  	var vehiclePoint  = {lng:"",lat:""};//车的经纬度
    var geolocation;//浏览器定位
  	var curCity;//当前所在城市
  	var trafficLayer_1;//实时路况控制器1，控制搜索地图的实时路况
  	var trafficLayer_2;//实时路况控制器2，控制路径规划地图的实时路况
  	//当前搜索的点标注数组，存储可清除搜索的点标注，而不影响车辆点标注和用户点标注。
  	var searchMarkers = [];
  	//详情页面的数据双向绑定
  	var detailModel = new DataModel('LDetail');
    var currentVehicle;//当前关联车辆信息
    var oldVal;//输入框的值
    var fromName;//起点名称
    var toName;//终点名称
    var toAddress;//搜索终点的地址
    var flag = false;//动画初始化
    var fromAddress;//点击地址
    var lnglatXY;//当前位置的经纬度
    var geocoder;//高德插件
    var oldSearchVal = "";//输入框旧的值
    var navigationPoint;//一键导航的车和终点位置的经纬度
    var w;//多线程声明设置
    var isTimeout = true;//判断加载地图是否超时

  	$(function(){
        alert('110吗，我要报警了！');
        languageAuto().done(function(){
            startWorker();
            //能力集
            vehicleCapabilityController();
            //首页用于普通搜素的地图加载     
            loadSearchMap();
            loadDriving_map(); 
            getWidth();     
            slide();
        })
  	});

    //获取屏幕的宽度
    function getWidth(){
        var width = $(window).width();
        // $(".swiper-wrapper,.swiper-container").css("width",width*2);
        $(".swiper-slide").css("width",width); 
    }

    //滑动事件
    function slide(){
        var mySwiper = new Swiper('.swiper-container', {
          
        })
    }

	//首页用于普通搜素的地图加载  	
  	function loadSearchMap(){

	    map = new AMap.Map("map", {
	        resizeEnable: true,
	        zoom:12,
            lang:(sessionStorage.geelyapp_language != '2'?'zh_cn':'en'),
            renderer:"dom"
	    }); 

		map.getCity(function(data){
            // console.log(data)
			curCity = data.city;
             //获取用户当前位置
            getcurrentLocation();  

		     //使用默认返回的下拉进行搜索的写法
		    placeSearch = new AMap.PlaceSearch({
		    	extensions:'all',
                city:data.citycode,
                lang:(sessionStorage.geelyapp_language != '2'?'zh_cn':'en')
		    });  


            //搜索列表查询
            $('#search_in_two').on('focus input',function(){ 

                $("#listSearch-group2>.list-group-item").remove();
                var inputVal = $("#search_in_two").val();
                
                if(inputVal.length == 0){
                    $("#search_in_two").removeClass('search_in_two');
                    $("#search_in_list").addClass('hide');
                    $("#listSearch-group2").addClass('hide');
                    $("#listSearch-group1").removeClass('hide');
                }else{
                    $("#search_in_two").addClass('search_in_two');
                    $("#search_in_list").removeClass('hide');
                    $("#listSearch-group2").removeClass('hide');
                    $("#listSearch-group1").addClass('hide');
                }

                placeSearch.search(inputVal, function(status, rs){
                    if(status == 'complete'){
                        console.log(rs);
                        // allPoint = rs.tips;
                        setAutocompleteSearchList(rs.poiList.pois);
                        
                    }else if(status == 'error' || status == 'no_data'){
                        console.log(rs)
                    }
                });  
            });          

		    //显示车的位置
            var is_showtip = false;
			showCarLocation(is_showtip);		
		    //实时路况图层
		    trafficLayer_1 = new AMap.TileLayer.Traffic({
		      zIndex: 10
		    });
		    trafficLayer_1.setMap(map);  
		    trafficLayer_1.hide();
		});
  	}


    function getcurrentLocation(){
        alert('获取人的位置');
        map.plugin('AMap.Geolocation', function() {

            var markerOption = {
                animation:'AMAP_ANIMATION_NONE',
                label:{
                    offset: new AMap.Pixel(-18, -23),//修改label相对于maker的位置
                    content: "<span class='text-primary'>"+$.i18n.prop('myPosition')+"</span>"                    
                },
                position:lnglatXY               
            };            
            geolocation = new AMap.Geolocation({
                enableHighAccuracy: true,//是否使用高精度定位，默认:true
                timeout: 10000,          //超过10秒后停止定位，默认：无穷大
                maximumAge: 0,           //定位结果缓存0毫秒，默认：0
                convert: true,           //自动偏移坐标，偏移后的坐标为高德坐标，默认：true
                showButton: false,        //显示定位按钮，默认：true
                // buttonPosition: 'LB',    //定位按钮停靠位置，默认：'LB'，左下角
                buttonOffset: new AMap.Pixel(10, 20),//定位按钮与设置的停靠位置的偏移量，默认：Pixel(10, 20)
                // markerOptions:markerOption,
                showCircle: false,
                useNative:true,            //开启原生SDK辅助定位
                panToLocation:false,
                showMarker : false
            });

            map.addControl(geolocation);
            geolocation.watchPosition();
            AMap.event.addListener(geolocation, 'complete', onComplete);
        });        
    }
    // 人在地图上的marker定位
    function personalLocation(poi){
        if(personalMarker){
            personalMarker.setMap(null);
            personalMarker.setPosition([poi.position.lng,poi.position.lat]);
            personalMarker.setMap(map);
        }else{
            personalMarker = new AMap.Marker({
                position:[poi.position.lng,poi.position.lat],
                map:map,
                label:{
                    offset: new AMap.Pixel(-18, -23),//修改label相对于maker的位置
                    content: "<span class='text-primary'>"+$.i18n.prop('myPosition')+"</span>"                    
                },
                autoRotation : true
            });
        }
    }
    
    var isFirstInitGeolocation = true;//是否是第一次进行定位
    //获取当前位置的经纬度
    function onComplete(data){
        alert('获取成功');
        console.log('omComplete',data);
        console.log("当前人位置的经纬度坐标:"+data.position.lng+","+data.position.lat);
        
        personalLocation(data);

        if(isFirstInitGeolocation){
            isTimeout = false;
            isFirstInitGeolocation = false;
            map.setFitView();
            // map.setZoomAndCenter(16,[data.position.lng,data.position.lat]);
            $(".cover").addClass('hide');
        }
        
        fromPoint = {
            lng : data.position.lng,
            lat : data.position.lat
        }

        personalPonit = {
            lng : data.position.lng,
            lat : data.position.lat
        }
        
        lnglatXY = [data.position.lng,data.position.lat];

        geocoder = new AMap.Geocoder({
                extensions: "all"
            });
        //经纬度转为详细地址信息
        geocoder.getAddress(lnglatXY,function(status, result){
             if (status === 'complete' && result.info === 'OK') {
                personalAddress = result.regeocode.formattedAddress;
                $(".locationName").html(personalAddress);
                fromName = result.regeocode.formattedAddress;
            }
        });
    }

  	//加载路线规划地图
  	function loadDriving_map(){
	    driving_map = new AMap.Map("driving_map", {
	        resizeEnable: true,
	        zoom:12,
            renderer:"dom",            
            lang:(sessionStorage.geelyapp_language != '2'?'zh_cn':'en'),            
	    });   	    

		
	    trafficLayer_2 = new AMap.TileLayer.Traffic({
	      zIndex: 10
	    });
	    trafficLayer_2.setMap(driving_map);  
	    trafficLayer_2.hide();		    
   
/*		driving_map.plugin(["AMap.ToolBar"],function(){
		    var toolBar2 = new AMap.ToolBar({
		    });
			driving_map.addControl(toolBar2);	  
		});*/

  	}


    //进行车辆位置定位和展示
    function doCarLocation(showtip,callback){
        var dtd = $.Deferred();      
        getCurrentUser().done(function(){
            if(currentUser.vin){

                var vin = currentUser.vin,
                    userId = currentUser.userId;
                
                vehicleTurn(vin,userId,callback);
                dtd.resolve();
            }else{
                if(showtip == 'true'){                
                    nativeAlert($.i18n.prop('noCarRelateTip'));  
                    dtd.reject();                
                }
            }
        });
        return dtd.promise();       
    }

	
	//显示车辆所在地
    //参数：showtip:是否显示没有关联车辆的提示，值true或者false
	function showCarLocation(showtip){
        doCarLocation(showtip,function(p){
            //显示车辆所在位置
            vehicleMarker = new AMap.Marker({
                position:[p.longitude,p.latitude],
                map:map
            });     

            vehicleMarker.setLabel({//label默认蓝框白底左上角显示，样式className为：amap-marker-label
                offset: new AMap.Pixel(-18, -23),//修改label相对于maker的位置
                content: "<span class='text-primary'>"+$.i18n.prop('carPosition')+"</span>",
                animation:'AMAP_ANIMATION_DROP'         
            });  

            searchMarkers.push(vehicleMarker);
        })
        
        map.setFitView();	
	}


    //将POI搜索存储到历史记录里面
    function saveSearchHistory(poi){
        var poi = JSON.parse(poi);
    	//以字符串形式存在localStorage的amap_search_history里面
    	var amap_search_history = JSON.parse(localStorage.getItem('amap_search_history'));
    	if(!amap_search_history){
    		amap_search_history = [];
    	}
        //判断是否有历史记录，没有才添加
        if(amap_search_history.length > 0){
            var isExist = false;
            amap_search_history.forEach(function(historypoi){
                if(historypoi.id == poi.id){
                     isExist = true;                               
                }
            })          
            if(!isExist){
                amap_search_history.push(poi);                 
            }  
        }else{
            amap_search_history.push(poi);                 
        }

    	localStorage.setItem('amap_search_history',JSON.stringify(amap_search_history)); 
    } 

    //获取POI搜索的历史记录
    function getSearchHisory(){
    	console.log('search histroy',localStorage.getItem('amap_search_history'));
        // console.log("localStorage.getItem:"+JSON.parse(localStorage.getItem('amap_search_history')))
    	return JSON.parse(localStorage.getItem('amap_search_history'));
    }


    //清空POI搜索的历史记录
    function clearSearchHistory(){
    	localStorage.removeItem('amap_search_history');
    	$('#listSearch-group1').hide();
    }

    //关闭POI搜索历史面板
    function closeHistoryDiv(){
    	$('#historyOptions').hide();
    }

	//搜索显示POI信息点在地图上
	function POISearch(poi){
        console.log(poi)
        poi = JSON.parse(poi);
        // placeSearch.setCity(poi.adcode);
        map.setCity(poi.adcode);
        
         //关键字查询查询
        placeSearch.search(poi.name,function(status,result){
        	if(status == 'complete'){
		       	showSearchResult(result);        		
        	}
        }); 		
	}	
    
    //添加marker标记
    //color目前可选值为："blue"、"red"，默认'red'
    function addMarker(poi,index,color) {  	

        var marker = new AMap.Marker({
            map: map,
            position: [poi.location.lng, poi.location.lat],
            animation:'AMAP_ANIMATION_DROP',
            icon:getMarkerIcon(index,color)
        });

        //蓝色突出展示的点标注置顶
        if(color == 'blue'){
            marker.setTop(true);            
        }

        // map.setFitView();
        // marker.content = createInfoWindowContent(poi);
        // marker.on('click',showInfoWindow);//点击显示自定义信息窗体
        searchMarkers.push(marker);//加入可清除的点标注之中  

        //点击覆盖物获取地址，经纬度
        marker.on("click",function(){

            for(var i in searchMarkers){
                searchMarkers[i].setIcon(getMarkerIcon(i,'red'));
                searchMarkers[i].setTop(false);
            }
            this.setIcon(getMarkerIcon(index,'blue'));
            this.setTop(true);

            console.log((index+1)+","+poi.name+","+poi.address+",坐标："+poi.location.lng+","+poi.location.lat+",电话:"+poi.tel);
            $("#mylocation").html(index+1+"、"+poi.name);
            $(".nearLocation").html(poi.address);
            $("#tel").html(checkPhone(poi.tel));

            $(".telName").click("#tel",function(){
                phoneCall(poi.tel);
            });

            toPoint = {
                lng : poi.location.lng,
                lat : poi.location.lat
            };

            toName = poi.name;   
            toAddress = poi.address;  

        })    
    }	


    //获取对应index的点标注图标（从0开始计数）
    function getMarkerIcon(index,color){
        var i = parseInt(index)+1;
        if(color != null && color == 'blue'){
            color = 'b';
        }else{
            color = 'r';
        }
/*        var icon = new AMap.Icon({            
                image: "./image/markers/mark_"+color+i+".png",
                size:new AMap.Size(19, 33),
                imageOffset:new AMap.Pixel(0,0)
        }); 
        return icon;  */
        var icon = "./image/markers/mark_"+color+i+".png";        
        return icon;        
    }     


	//点击显示自定义信息窗体事件
/*已弃用    
    function showInfoWindow(e) {    	
		var infoWindow = new AMap.InfoWindow({
			closeWhenClickMap:true,
		    isCustom: true,  //使用自定义窗体
		    content: e.target.content,
		    offset: new AMap.Pixel(0, -32)
		});		    	
	
		infoWindow.open(map,e.target.getPosition());	
		map.setCenter(e.target.getPosition());			
    }*/

/*已弃用
    function createInfoWindowContent(poi){
    	var advInfotemplate = Handlebars.compile($("#advInfo-template").html());
    	//这里需要语言国际化
    	poi.weizhi = '位置';
    	poi.xiangqing = '详情';
    	poi.fsdc = '发送到车';
    	return advInfotemplate(poi);
    }*/

	//构造展示搜索出来的数据的marker
	function showSearchResult(searchResult){
		//清除之前搜索出来的点标注
		clearMarkers();
        $(".locationName").addClass("hide");
        $(".nearLocation").removeClass("hide");
		// console.log(searchResult);
		var pois = searchResult.poiList.pois;
		if(pois.length > 0){

			addMarker(pois[0],0,'red');

            console.log(pois[0]);
            $(".location").html(pois[0].name);
            $(".nearLocation").html(pois[0].address);
            $("#tel").html(checkPhone(pois[0].tel));

            $(".telName").click("#tel",function(){
                phoneCall(pois[0].tel);
            });

            toPoint = {
                lng : pois[0].location.lng,
                lat : pois[0].location.lat
                };
            toName = pois[0].name;
            toAddress = pois[0].address;

            map.setZoomAndCenter(16,[pois[0].location.lng,pois[0].location.lat]);
	        //触发显示信息窗口
	        // searchMarkers[0].emit('click', {target: searchMarkers[0]}); 			
		}
	}

    window.phoneCall = function(phone){
        var phoneNumber = '';
        if(phone.toString().indexOf(';') > '-1'){
            phoneNumber = phone.toString().split(';')[0];
        }else{
            phoneNumber = phone;
        }
        location.href = 'tel:'+phoneNumber;     
    }

    var checkPhone = function(phone){
        if(phone.toString().indexOf(';') > '-1'){
            phone = phone.toString().split(';')[0];
        }else{
            phone = phone;
        }
        return phone;
    }
	//清除搜索出来的点标注
	function clearMarkers(){
		if(searchMarkers.length > 0 ){
			for(var i = 0; i < searchMarkers.length; i++){
				searchMarkers[i].setMap(null);//清除该点标注
			}
			searchMarkers = [];
		}
	}

	/**显示POI地点详情*/
	function showLDetail(t){
		placeSearch.getDetails(
			t.getAttribute('poiid'),
			function(status,result){
				console.log(status);console.log(result)
				if(status == 'complete'){
					detailModel.set('name',result.poiList.pois[0].name);
					detailModel.set('address',result.poiList.pois[0].address);
					detailModel.set('lng',result.poiList.pois[0].location.lng);
					detailModel.set('lat',result.poiList.pois[0].location.lat);
					$('#s_map').hide();
					$('#s_detail').show();
				}
			})
	}

	/** 输入提示 */
    function OnInputSearchChange(keywords,targetInputId){ 	
	  	placeSearch.search(keywords, function(status, result){
			if(status == 'complete'){
				setAutocompleteSearchList(result.poiList.pois);
				$('#listSearch-group3').attr('targetInputId',targetInputId)
			}else if(status == 'error' || status == 'no_data'){
				// $('#listSearch-group3').html('<div class="col-md-12">没有找到符合的地点</div>');
			}
	    });
    }

    /**组装、显示搜素的自动提示搜索信息*/
    function setAutocompleteSearchList(data){
        console.log(data)
        var msg = ""; 
        // console.log(JSON.stringify(data))
        $.each(data,function(index, el) {
            msg += "<div class='list-group-item row' id='"+el.id+"'> <div class='col-md-9'>";
            msg += "<input type='hidden' value='"+el.name+"' data-adcode='"+el.adcode+"' data='"+JSON.stringify(el)+"' >";
            msg += "<span>"+el.name+"</span><span>"+el.address+"</span></div>";
            msg += "<div class='col-md-3'><img src='image/map_arrow_more@2x.png' /></div></div>";
        });
        $("#listSearch-group2").append(msg);
        $("#listSearch-group3").append(msg);
    }

    /**组装、显示搜素的自动提示历史信息*/
    function setAutocompleteHistoryList(data){
        // console.log(data)
        if(data == null ||data.length < 0) return;
        var msg = "";
        var clearMsg = "";
        var dataArr = [];
        $("#listSearch-group1>.list-group-item").remove();
        for(var i = 0;data.length>i;i++){
            dataArr.push(data[i]);
        }
        console.log(dataArr)
        $.each(dataArr,function(index, el) {
            msg += "<div class='list-group-item historyList row rowList' id='"+el.id+"'> <div class='col-md-9'>";
            msg += "<input type='hidden' value='"+el.name+"' data-adcode='"+el.adcode+"' data='"+JSON.stringify(el)+"' >";
            msg += "<span>"+el.name+"</span><span>"+el.address+"</span></div>";
            msg += "<div class='col-md-3'><img src='image/map_arrow_more@2x.png' /></div></div>"
        }); 
        $("#listSearch-group1").append(msg);
        clearMsg = '<div class="list-group-item row clearHistory" id="clearHistory"><div class="col-md-12">'+$.i18n.prop("clearHistory")+'</div></div>';
        $("#listSearch-group1>.list-group-item:last").after(clearMsg);   
    }

    
    //获取起点、终点经、途经点
    function SetDrivingPoints(){
        //获取起点、终点经纬度
        fromPoint = new AMap.LngLat($('#from_p').attr('lng'),$('#from_p').attr('lat'));
        toPoint = new AMap.LngLat($('#to_p').attr('lng'),$('#to_p').attr('lat'));
        
        //加入途经点
        window.waypoints = [];
        $("#wayPoints > .wp_s").each(function(index, el) {
            var waypoint = new AMap.LngLat($(this).attr('lng'),$(this).attr('lat'));            
            waypoints.push(waypoint);
        });        
    }


    /**驾车路线规划搜索

    */
    function drivingSearch(){
    	if(driving){
    		driving.clear();
    	}
        SetDrivingPoints();
        driving = new AMap.Driving({
            map: driving_map,
            policy:AMap.DrivingPolicy.LEAST_TIME,
            panel:'driving_panel'
        }); 
    	// 根据起终点经纬度规划驾车导航路线
    	driving.search(fromPoint,toPoint,{waypoints:window.waypoints},function(status,result){
            console.log(result)
        });
    }

    //改变路径规划策略
    function changeDrivingPolicy(policy){
        driving.clear();         
        SetDrivingPoints();               
    	switch(policy){
    		case 'LEAST_TIME':
    			driving.setPolicy(AMap.DrivingPolicy.LEAST_TIME);    				
    			break;
    		case 'LEAST_FEE':
    			driving.setPolicy(AMap.DrivingPolicy.LEAST_FEE);    				
    			break;
    		case 'LEAST_DISTANCE':
    			driving.setPolicy(AMap.DrivingPolicy.LEAST_DISTANCE);    				
    			break;
    		default:
    		driving.setPolicy(AMap.DrivingPolicy.LEAST_TIME);
    	}
	    driving.search(fromPoint,toPoint,{waypoints:window.waypoints});    	
    }

    $(".list-group-item").on("click","#sendToCar",function(){
        if(toPoint.lng != '' && toPoint.lat != ''&& toName !='' && toAddress !=''){
           sendPoiToCar(toPoint.lng,toPoint.lat,toName,toAddress) 
       }else{
            nativeAlert($.i18n.prop('errorChoose')); 
       }
    })

    //发送poi信息到车(发送到车)
    function sendPoiToCar(lng,lat,name,address){  

        getCurrentVehicle().done(function(){
            var message={};
            message.lon=lng;
            message.lat=lat;
            message.name=name;
            message.address=address;    

            var param = {};
            param.channel='auto_jili';
            param.aimChannel='auto_amap';
            param.deviceId=currentVehicle.ihuId;
            param.sourceid='geely';
            param.bizType='aimpoi';
            param.isReliable='true';
            param.expiration='0';
            param.message=message;

            $.ajax({
                url: window.TCManagePlantformServer+'sent2car/sent',
                type: 'post',
                dataType: 'json',
                contentType:'application/json',                
                data: JSON.stringify(param),
                beforeSend:function(xhr){
                    setAjaxHeaderTokens(xhr);
                }                 
            })
            .done(function(rs) {
                console.log("success",rs);
                if(rs.code != null && rs.code == '1'){
                    nativeAlert($.i18n.prop('send2carSuccess'));                          
                }else{
                    nativeAlert($.i18n.prop('send2carFailue'));                        
                }


            })
            .fail(function() {
                console.log("error");
                nativeToast($.i18n.prop('failure'));         
            })      
        });  	
    }

    //获取用户当前关联的车辆信息
    function getCurrentVehicle(){
        var dtd = $.Deferred();         
        getCurrentUser().done(function(){
            if(!currentVehicle){
                if(currentUser.vin){
                    $.ajax({
                        url: window.TCManagePlantformServer + 'vehicle?vin=' + currentUser.vin,
                        type: 'get',
                        dataType: 'json',
                        beforeSend:function(xhr){
                            setAjaxHeaderTokens(xhr);
                        },                         
                        success: function(data, textStatus, xhr) {    
                            if(data.serviceResult.operationResult == '0'){
                                currentVehicle = data.list[0];
                                // console.log(data)
                                dtd.resolve();                                  

                            }else{
                                nativeAlert($.i18n.prop(data.serviceResult.error.code));
                                dtd.reject();                               
                            }                      
                        }
                    });
                    
                }else{                           
                    nativeAlert($.i18n.prop('noCarRelateTip'));
                    dtd.reject();                        
                }     
            }else{
                dtd.resolve();                                        
            }       
        })
        return dtd.promise();        
    }


    //点击搜索框显示历史记录
    $('#search_in').on('focus input',function(){

        $("#search_in_three").val("");
        $("#s_map").addClass("hide");
        $("#search_in_two").val('');
        $("#searchPage").removeClass('hide');
        $("#search_in_two").removeClass('search_in_two');
        $("#search_in_list").addClass('hide');
        $("#listSearch-group2").addClass('hide');
        $("#listSearch-group1").removeClass('hide');
        $(".nearPoint").addClass("hide"); 
        var history_pois = getSearchHisory();
        console.log(history_pois);
        setAutocompleteHistoryList(history_pois);  
    })

    //后退按钮事件
	$('#driving_angle').click(function(event) {
		$("#s_driving").addClass('hide');
        $("#s_map").removeClass('hide');
        dataClean($(this));
	});

    //根据不同的后退按钮进行不同的数据清除
    function dataClean($t){
        var id = $t.attr('id');
        switch(id){
            case 'driving_angle':
            clearDrivingData();        
            break;
        }
    }

    function clearDrivingData(){
        $("#wayPoints").empty();
        $('#wayPointCount').text('0');
    }

	//详情页面--点击电话号码事件
	$("#l_tel").click(function(){
		var tel = $(this).find('#s_tel').text();
		if(tel){
			location.href='tel:'+tel;
		}
	})

	//点击路径规划事件
	$(".l_road").click(function(event) {
        // $("#from_p").val($.i18n.prop('inputStart'));
        // $("#to_p").val($.i18n.prop('inputEnd'));

        $("#s_map").addClass("hide");

        $("#listSearch-group3>.list-group-item").remove();
        
		//设置起点
		$("#from_p").val(fromName);
		$("#from_p").attr('lng',fromPoint.lng);
		$("#from_p").attr('lat',fromPoint.lat);

        //设置终点
        if(toName != undefined && toPoint.lng != undefined && toPoint.lat !=undefined){
            $("#to_p").val(toName);
            $("#to_p").attr('lng',toPoint.lng);
            $("#to_p").attr('lat',toPoint.lat);
        }
       
		//清空终点
		// $("#to_p").val('').attr('lng','').attr('lat','');

		$("#s_driving").removeClass('hide'); 
	});

	//路径规划页面--输入框输入事件
    $(".d_target_in").on("input propertychange",function(){
    	console.log('input');
        $("#listSearch-group3>.list-group-item").remove();
    	OnInputSearchChange($(this).val(),$(this).attr('id'));
    })

    //路径规划页面--点击输入提示选项事件
    $("#listSearch-group3").on("click",".list-group-item",function(){
        var roadVal = JSON.parse($(this).find("input").attr("data"));
        var targetInputId = $('#listSearch-group3').attr('targetInputId');
        $('#'+targetInputId).val(roadVal.name);
        $('#'+targetInputId).attr("lng",roadVal.location.lng);
        $('#'+targetInputId).attr("lat",roadVal.location.lat);
        $("#listSearch-group3").empty();
    })

    //路径规划页面--点击交换起点、终点
    $('.exchange_handle').click(function(event) {

    	var from_name = $("#from_p").val();
    	var from_lng = $("#from_p").attr('lng');
    	var from_lat = $("#from_p").attr('lat');

		$("#from_p").val($("#to_p").val());
		$("#from_p").attr('lng',$("#to_p").attr('lng'));
		$("#from_p").attr('lat',$("#to_p").attr('lat'));    	

		$("#to_p").val(from_name);
		$("#to_p").attr('lng',from_lng);
		$("#to_p").attr('lat',from_lat);    	

    });


    //路径规划页面--搜索按钮点击事件
    $("#sl_btn").click(function(event) {
    	if(checkFromAndTo()){
	    	//调用接口搜素
	        drivingSearch();
	    	//展示路径规划地图页面
            $("#s_driving").addClass("hide");
	    	$("#s_driving_map").removeClass('hide');
    	}
    });

    //检查起点、终点    
    function checkFromAndTo(){
    	var start_lng = $('#from_p').attr('lng');
    	var start_lat = $('#from_p').attr('lat');
    	var to_lng = $('#to_p').attr('lng');
    	var to_lat = $('#to_p').attr('lat');
    	if($.trim(start_lng)=='' || $.trim(start_lat)==''){
            nativeAlert($.i18n.prop('startPointTip'))                				
    		return false;
    	}else if($.trim(to_lng)=='' || $.trim(to_lat)==''){
            nativeAlert($.i18n.prop('endPointTip'));              				    		
    		return false;
    	}else{
    		return true;    		
    	}
    }

    //点击高亮路径规划策略菜单
    $('#driving_policy .dp').click(function(event) {
    	$('.dp').removeClass('active');
    	$(this).addClass('active');
    });

    //点击切换路径规划策略
    $("#driving_policy div[name=policy]").click(function(event) {
    	var policy = $(this).attr('policy');
    	changeDrivingPolicy(policy);
    });

    //点击显示路况信息
    $("#sslk_1,#sslk_2").click(function(event) {

    	var trafficLayer;
    	if($(this).is('#sslk_1')){
    		trafficLayer=trafficLayer_1;
    	}else if($(this).is('#sslk_2')){
    		trafficLayer=trafficLayer_2;
    	}else{
    		return false;
    	}

    	var isShow = $(this).attr('isShow');
    	if(isShow == 'true'){
    		$(this).attr('isShow','false');
    		$(this).removeClass('highlight');    		
    		trafficLayer.hide();
            nativeToast($.i18n.prop("closeTraffic"));
    	}else{
    		$(this).attr('isShow','true');
    		$(this).addClass('highlight');
    		trafficLayer.show();
            nativeToast($.i18n.prop("openTraffic"));
    	}

    });

    //点击显示用户当前位置
    $('#curLocation').click(function(event) {
        // $(".locationName").html("");
         $(".locationName").removeClass("hide");
        $(".nearLocation").addClass("hide");
        geolocation.getCurrentPosition();
        clearMarkers();
        //地图移动到personalPonit
        map.setZoomAndCenter(16,[personalPonit.lng,personalPonit.lat]);
        $('#mylocation').html($.i18n.prop('myPosition')); 
        
               
    });

    //点击显示车辆当前位置
    $('#carLocation').click(function(event) {
        clearMarkers();
        if(vehiclePoint.lng != "" && vehiclePoint.lat != ""){
            $('#mylocation').html("");
            $(".locationName").addClass("hide");
            $(".nearLocation").removeClass("hide");
            languageAuto().done(function(){
                $('#mylocation').html($.i18n.prop("carlocationName"));
            });
        }else{
            nativeAlert($.i18n.prop("noCarRelateTip"));
        }
        
    	//调用接口获取车辆当前位置
    	doCarLocation('true',function(p){
            regeocoder([p.longitude,p.latitude]);
            vehicleMarker.setPosition(new AMap.LngLat(p.longitude,p.latitude));
            vehicleMarker.setMap(null);
            vehicleMarker.setPosition([p.longitude,p.latitude]);
            vehicleMarker.setMap(map);
            //显示车辆当前位置
            map.setZoomAndCenter(16,vehicleMarker.getPosition());
        })
    });



    $(".list-group").on("click","#topUp_img",function(event){
        
        if($(".downList").css("bottom","-120px") && flag == false){

            $(".downList").animate({"bottom": "0px"},300,function(){
                 $(".top_img>.up-arrow").css("transform","rotate(180deg)");
            });

            flag = true;
        }else if($(".downList").css("bottom","0px") && flag == true){

            $(".downList").animate({"bottom": "-120px"},300,function(){
                $(".top_img>.up-arrow").css("transform","rotate(0deg)");
            });
             
            flag = false;
        }
        
    })

    //返回地图
    $("#returnBack").click(function(){
        $("#searchPage").addClass("hide");
        $("#s_map").removeClass("hide");
        $(".downList").removeClass("hide");
        $(".nearPoint").addClass("hide");
        clearMarkers();
    });

    //查询列表点击保存历史记录和跳转指定地图上位置
    $("#listSearch-group2").on("click",".list-group-item",function(){
        // console.log($(this).find("input").attr("data"));
        var e = "";
        e = $(this).find("input").attr("data");
        // e = $(this).find("input").attr("data");
        console.log(e)
        //保存需找地点的坐标
         toPoint = {
                lng : JSON.parse(e).location.lng,
                lat : JSON.parse(e).location.lat
            };

        toName = JSON.parse(e).address;   
        toAddress = JSON.parse(e).address;  
        saveSearchHistory(e);
        POISearch(e);
        $("#mylocation").html("1、"+JSON.parse(e).name);
        $("#search_in").val(JSON.parse(e).name);
        $("#searchPage").addClass("hide");
        $("#s_map").removeClass("hide");
        $(".downList").removeClass("hide");
    })

    //点击历史列表返回地图
    $("#listSearch-group1").on("click",".historyList",function(){
        var e = "";
        e = $(this).find('input').attr("data");

         console.log(e); 

          //保存历史记录里选择地点的坐标
         toPoint = {
                lng : JSON.parse(e).location.lng,
                lat : JSON.parse(e).location.lat
            }; 
         toAddress = JSON.parse(e).address; 
         toName = JSON.parse(e).name;
        //搜索显示POI信息点在地图上
        POISearch(e);
        $("#mylocation").html("1、"+JSON.parse(e).name);
        $("#search_in").val(JSON.parse(e).name);
        $("#historyPage").addClass("hide");
        $("#searchPage").addClass("hide");        
        $("#s_map").removeClass("hide");
        $(".downList").removeClass("hide");
    })

    //清除历史记录
    $("#listSearch-group1").on("click","#clearHistory",function(){
        clearSearchHistory();
    })

    //返回路径规划输入页面
    $("#back_s_driving").on("click",function(){
        $("#s_driving_map").addClass("hide");
        $("#s_driving").removeClass("hide");
    })

    //搜索页面的模糊搜索
    $("#search_in_list").click(function(){
        console.log($("#search_in_two").val())
        nearPOISearch($("#search_in_two").val());
        $("#searchPage").addClass("hide");
        $("#s_map").removeClass("hide");
    })




    function nearPOISearch(keyword){
        // poi = JSON.parse(poi);
        // console.log(poi);
        placeSearch.setCity(curCity);
         //关键字查询查询
        placeSearch.search(keyword,function(status,result){
            if(status == 'complete'){
                console.log(result);
                showNearSearchResult(result.poiList.pois,0);               
            }
        });         
    }   

    //构造展示搜索出来的数据的marker
    //pois为列表信息，index为选中的poi的序号，从0开始
    function showNearSearchResult(pois,index){
        console.log(JSON.stringify(pois))
        $(".locationName").addClass("hide");
        $(".nearLocation").removeClass("hide");
        clearMarkers();
        if(pois.length > 0){
            for(var i=0;i<pois.length;i++){
                if(i == index){
                    addMarker(pois[i],i,'blue');
                }else{
                    addMarker(pois[i],i,'red');                    
                }               
            }
            map.setFitView(); 
            var i = parseInt(index)+1;
            
            $("#mylocation").html(i+'、'+pois[index].name);
            $(".nearLocation").html(pois[index].address);

            toPoint = {
                lng : pois[index].location.lng,
                lat : pois[index].location.lat
                };
            toName = pois[index].name;
            toAddress = pois[index].address;  
                        
        }
    }
    
    //返回原生界面
    $("#return").on("click",function(){
        webViewJavascriptBridgeReady(function(){
            window.WebViewJavascriptBridge.callHandler('finish', "");
        })   
    });
    

    //一键导航
    $("#navigation").on('click',function(){
        if(toPoint.lat != "" && toPoint.lng != ''){
            navigationPoint = {
                carPoint:{ 
                    lng : toPoint.lng,
                    lat : toPoint.lat
                }      
            };
            console.log(JSON.stringify(navigationPoint));
            webViewJavascriptBridgeReady(function(){
                window.WebViewJavascriptBridge.callHandler('navigation', JSON.stringify(navigationPoint));
            }); 
        }else{
            nativeAlert($.i18n.prop("errorChoose"));
        }
    });
    

    //坐标转地址
    function regeocoder(lnglatXY){
         var geocoder = new AMap.Geocoder({
            // radius: 1000,
            extensions: "all"
        });        
        geocoder.getAddress(lnglatXY, function(status, result) {
            if (status === 'complete' && result.info === 'OK') {
                console.log(result);
                $(".locationName").addClass("hide");
                $(".nearLocation").removeClass("hide");
                $(".nearLocation").html(result.regeocode.formattedAddress);
            }
        });        
    }
    //清除洗车、停车等功能的背景
    function rmClass(){
        $(".secondList .col-md-3").each(function(){
            $(this).removeClass("active");
        })
    }
    //功能选择对应背景改变颜色
    $(".secondList .col-md-3").click(function(){
        rmClass();
        $(this).addClass("active");
        setTimeout(function(){
          rmClass();  
        },300)
    })

    //多线程开始
    function startWorker(){
        
        if(typeof(Worker) !== 'undefined'){
            
            if(typeof(w) == 'undefined'){
                w = new Worker("js/worker.js"); 
            }

            w.onmessage = function(event){
                
                //超时时间设置为15s
                if(event.data == 15){
                    if(isTimeout){
                        
                        $(".cover").addClass('hide');
                        stopWorker();
                        nativeAlert($.i18n.prop('mapLoadException'));

                    }
                }
            }
        }
    }

    //结束多线程
    function stopWorker(){
       w.terminate();
    }

    //新能源车
    function nevVehicl(vin,callback){
        $.ajax({
            url : window.TCManagePlantformServer + "tcservices/nev/vehicle/status/" +vin,
            type : 'get',
            dataType :'json',
            beforeSend:function(xhr){
                setAjaxHeaderTokens(xhr);
            }
        })
        .done(function(rs){
            console.log("nevVehicl",rs);
            if(rs.result.serviceResult == 0){
                var trueLng = rs.vehicleStatus.position.longitude;
                var trueLat = rs.vehicleStatus.position.latitude;

                console.log("新能源车辆位置的经纬度坐标:"+trueLng+","+trueLat);

                vehiclePoint = toPoint = {
                    lng : trueLng,
                    lat : trueLat
                };

                callback({longitude:trueLng,latitude:trueLat});
            }
        })
    }

    //汽油车
    function gasolineVehicle(vin,userId,callback){
        var dtd = $.Deferred();

        $.ajax({
            url: window.TCManagePlantformServer + 'vehicle/status/'+vin+'?target=basic&userId='+userId+'&latest = False&source = tc',
            type: 'get',
            dataType: 'json',
            beforeSend:function(xhr){
                setAjaxHeaderTokens(xhr);
            },                     
        })
        .done(function(rs) {
            console.log('gasolineVehicle',JSON.stringify(rs));
            if(rs.result.serviceResult.error.code == 0){                      
                var trueLng = rs.vehicleStatus.basicVehicleStatus.position.longitude/3600000;
                var trueLat = rs.vehicleStatus.basicVehicleStatus.position.latitude/3600000;
                console.log("从TBOX返回的车辆位置的经纬度坐标:"+trueLng+","+trueLat);

                lnglatXY = [trueLng,trueLat];
         
                AMap.convertFrom(lnglatXY,"gps",function(status,result){
                    // console.log(JSON.stringify(result))
                    if(result.info == 'ok'){
                        // console.log(JSON.stringify(result));
                        trueLng = result.locations[0].lng;
                        trueLat = result.locations[0].lat;

                        console.log("GPS-车位置转高德的偏移坐标:"+trueLng+","+trueLat);
                        
                        vehiclePoint = toPoint = {
                            lng : trueLng,
                            lat : trueLat
                        };

                        callback({longitude:trueLng,latitude:trueLat});
                        dtd.resolve();
                    }
                });  
            }else{
                nativeAlert($.i18n.prop(rs.result.serviceResult.error.code));
                dtd.reject();
            }
        })
        .fail(function() {
            console.log("getCarLocation error");
            dtd.reject();
        })   
        return dtd.promise();     
    }

    //查询汽油车车辆定位是否开启
    function vehicleTurn(vin,userId,callback){
        var dtd = $.Deferred();
        $.ajax({
            url : window.TCManagePlantformServer + "vehicle/status/state/" + vin + "?userId=" + userId,
            type : "get",
            dataType : "json",
            beforeSend:function(xhr){
                setAjaxHeaderTokens(xhr);
            }
        })
        .done(function(rs){
            console.log('vehicleTurn',rs);
            //operationResult:0 off ; 1 on;
            if(rs.serviceResult.operationResult == 0){
                // if(rs.list[0].positionUploadState == 1){
                    gasolineVehicle(vin,userId,callback);
                    dtd.resolve();
                // }else{
                //     nativeAlert($.i18n.prop('vehicleLocationService'));
                //     dtd.reject();
                // }
            }else{
                nativeAlert($.i18n.prop(rs.serviceResult.error.code))
                dtd.reject();
            }
        })

        return dtd.promise();
    }