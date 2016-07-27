/*!
 * 周边搜索结果列表
 * Requires JS  : jQuery v1.7或以上、高德地图相关js
 * Requires CSS ：Bootstrap.min.css，font-awesome.min.css，searchNearBy.css
 * Requires HTML: searchNearBy.html
 * author wuyu
 * create date 2016-06-06

 * API及事件：
 	1.初始化并且显示搜索结果列表页面（下面简称周边页面） 	
 	$('#nearByPanel').searchPOIs(options);
 		nearByPanel为周边页面的dom容器id
 		options内容为：
 		{
 			position:为搜索中心点坐标[lng,lat],
 			type：为搜索POI类型：如“停车场,
 			api:选择的api：search,searchNearBy,
 			showDis:是否显示选择范围
 		} 		 
 		
 	2.“showNearBy”事件。点击周边页面右上角“地图”按钮触发，返回参数为POIList的信息
	$('#nearByPanel').on('showNearBy',function(event,data){
		console.log('POI list:',data.pois);
	})

	3.“hidePanel”事件。点击周边页面左上角“返回”箭头按钮触发，插件将会从移除周边页面对应的dom元素
	$('#nearByPanel').on('hidePanel',function(){
		//这里可以做一些后面需要的操作，比如移除所有的周边搜素的点标注
	})

	4.“showSelectedPoi”事件。点击周边列表中的一项API触发，返回的data参数为{"poi":pois,"index":index}，其中pois为周边搜索搜出的poiList，index为选中的poi点序号，从0开始
	$('#nearByPanel').on('showSelectedPoi',function(event,data){
		console.log('搜索的poiList及选中的poi序号为',data);
	})

	5."sendToCar"事件,单击左下方“发送到车”触发,并且返回poi信息
	$('#nearByPanel').on('sendToCar',function(event,data){
		console.log('发送到车的poi序号为',data);
	})	

 */
;(function($,window,document){
	"use strict";
    var defaultOptions = {center:[113.486631,23.208506], type:'美食',searchPOIs:'searchNearBy',showDis:true};//默认options 
    var searchRadius = 2000;//搜索范围
	var curPageIndex = 1;//当前页码
	var pageSize = 10;//单页显示结果条数
	var totalSize = null;//结果总条数
	var $container = null;//周边搜索列表的父容器
	var curPoiList = null;//当前页面的poi列表数据,用于传递给地图页面
	var eventInit = false;//事件初始化是否完成，用于防止多次绑定事件
	var map = new AMap.Map("map", {
	        resizeEnable: true,
	        zoom:12,
            lang:(sessionStorage.geelyapp_language != '2'?'zh_cn':'en'),
            renderer:"dom"
	    }); 
	map.getCity(function(data){
		var placeSearch = new AMap.PlaceSearch({
	    	city: data.citycode,
	    	pageSize: pageSize,
	    	pageIndex: curPageIndex,
	    	rankBy: "distance",//用于排序，高德JSAPI文档里面没有这个参数，从源码里面看到这个排序参数应该是rankBy，然后猜到值为“distance”(哈哈)
	    });  
	})
    

	$.fn.extend({
		searchPOIs:function(options){
			$container = this; 

			defaultOptions = options;
			if(defaultOptions.api === 'search' && !defaultOptions.isShow){
				$("#searchRange").addClass("hide");
				initPageParam(function(){
					//关键字搜索
					doSearch();
				})
			}else if(defaultOptions.api ==='searchNearBy' && defaultOptions.isShow){
				$("#searchRange").removeClass("hide");
				initPageParam(function(){
					//周边搜索
					doNearbySearch();
				})
			}
			

			if(!eventInit){
		        //初始化各类事件
		        initEvents();				
		        eventInit = true;
			}
	        $container.show();
		}
	})

	//周边搜索
	function doNearbySearch(){
		$container.find('.poiList').empty();
		$container.find('.searchType').text(defaultOptions.type);
        placeSearch.searchNearBy(defaultOptions.type,defaultOptions.center,searchRadius,function(status,result){
            if(status == 'complete'){
            	console.info(result);

            	curPoiList = result.poiList.pois;
            	totalSize = result.poiList.count;
            	curPageIndex = result.poiList.pageIndex;

            	//控制上一页按钮状态
            	if(result.poiList.pageIndex == 1){
            		$container.find('.prePage').attr('disabled', 'true');            		
            	}else{
            		$container.find('.prePage').removeAttr('disabled');    
            	}

            	//控制下一页按钮状态
            	if(result.poiList.pageIndex * result.poiList.pageSize > totalSize){
            		$container.find('.nextPage').attr('disabled', 'true');
            	}else{
            		$container.find('.nextPage').removeAttr('disabled');
            	}

				$container.find('.poiList').html(createPoiList(result.poiList));
    			
    			//搜索完之后回到顶部
    			document.documentElement.scrollTop = document.body.scrollTop =0;    
            }
        })			
	}
	 //关键字搜索
	 function doSearch(){
	 	$container.find('.poiList').empty();
		$container.find('.searchType').text(defaultOptions.type);
		placeSearch.search(defaultOptions.type,function(status,result){
			if(status == 'complete'){
            	console.log(result);

            	curPoiList = result.poiList.pois;
            	totalSize = result.poiList.count;
            	curPageIndex = result.poiList.pageIndex;

            	//控制上一页按钮状态
            	if(result.poiList.pageIndex == 1){
            		$container.find('.prePage').attr('disabled', 'true');            		
            	}else{
            		$container.find('.prePage').removeAttr('disabled');    
            	}

            	//控制下一页按钮状态
            	if(result.poiList.pageIndex * result.poiList.pageSize > totalSize){
            		$container.find('.nextPage').attr('disabled', 'true');
            	}else{
            		$container.find('.nextPage').removeAttr('disabled');
            	}

				$container.find('.poiList').html(createPoiList(result.poiList));
				$(".distance").addClass("hide");
    			
    			//搜索完之后回到顶部
    			document.documentElement.scrollTop = document.body.scrollTop =0;    
            }
		})
	 }

	//初始化各类事件
	function initEvents(){
		initPageDivider();
		initRangeSelector();
		initTriggers();
	}

	//初始化顶部"返回"和"地图"按钮触发的事件
	function initTriggers(){
		//顶部按钮返回按钮触发事件hidePanel
		$container.find('.tleft').on('click',function(event) {
			$container.hide();

			//隐藏范围选择器
			var $rangeSelector = $container.find('.radius');
			$rangeSelector.attr('status','hide');
			$rangeSelector.find('.fa').removeClass('fa-angle-up').addClass('fa-angle-down');
			$container.find('.valueSelect').addClass('hidden');	

			$container.trigger('hidePanel');
		});		

		//顶部地图按钮触发事件showNearBy，并返回当前poiList数据
		$container.find('.tright').on('click',function(event) {
			if(curPoiList.length != 0){
				$container.hide();			
				$container.trigger('showNearBy',{'pois':curPoiList});
			}
		});

		//单击POI列表触发事件showSelectedPoi，并且返回选择的POI信息
		$container.find('.poiList').on('click','.baseInfo',function(event) {
			var poiInfo = JSON.parse($(this).attr('data'));
			var index = 0;

			for(var i in curPoiList){
				if(curPoiList[i].id == poiInfo.id){
					index = i;
				}				
			}
			$container.trigger('showSelectedPoi',{"pois":curPoiList,"index":index});
			$container.hide();	
		});		

		//单击左下方“发送到车”触发事件sendToCar，并且返回poi信息
		$container.find('.poiList').on('click','.gothere',function(){
			var poiInfo = JSON.parse($(this).parent().siblings('.baseInfo').attr('data'));
			$container.trigger('sendToCar',poiInfo);			
		})	
	}

	//初始化分页参数
	function initPageParam(callback){
		curPageIndex = 1;
		pageSize = 10;	
		placeSearch.setPageIndex(curPageIndex);	
		placeSearch.setPageSize(pageSize);
		callback();
	}

	//绑定范围选择器相关事件
	function initRangeSelector(){
		//展示和隐藏范围选择列表
		$container.find('.radius').on('click',function(){
			if($(this).attr('status') == 'hide'){
				$(this).attr('status','show');
				$(this).find('.fa').removeClass('fa-angle-down').addClass('fa-angle-up');
				$container.find('.valueSelect').removeClass('hidden');
			}else{
				$(this).attr('status','hide');
				$(this).find('.fa').removeClass('fa-angle-up').addClass('fa-angle-down');
				$container.find('.valueSelect').addClass('hidden');
			}
		});

		//点击选择列表事件
		$container.find('.rangeUl > li').on('click',function(event) {
			//加上选择效果
			$(this).siblings().removeClass('selected');
			$(this).addClass('selected');
			//改变选择范围的值
			searchRadius =  $(this).attr('radius');
			$container.find('.searchRadius').text($(this).text());
			$container.find('.valueSelect').addClass('hidden');
			$container.find('.radius').attr('status','hide');
			$container.find('.radius > .fa').removeClass('fa-angle-up').addClass('fa-angle-down');
			//重新搜索
			initPageParam(function(){
				doNearbySearch();
			});
		});


	}

	//绑定分页事件
	function initPageDivider(){
		//上一页
		$container.find('.prePage').on('click',function(){
			if(curPageIndex != 1){
				placeSearch.setPageIndex(curPageIndex-1);
				if(defaultOptions.api === 'search'){
					doSearch();
				}else if(defaultOptions.api === 'searchNearBy'){
					doNearbySearch();
				}
			}	
		})

		//下一页
		$container.find('.nextPage').on('click',function(){
			if(curPageIndex * pageSize < totalSize){
				placeSearch.setPageIndex(curPageIndex+1);
				if(defaultOptions.api === 'search'){
					doSearch();
				}else if(defaultOptions.api === 'searchNearBy'){
					doNearbySearch();
				}
			}			
		})		
	}

	//创建单个poi点
	function createPoiItem(poi){
		var data = JSON.stringify(poi);
		console.log(data)
		var html = '<div class="listItem"> <div><div class="baseInfo" data='+data+'><div class="poiName">'+poi.name+'</div> <div class="poi_address display-flexbox"> <div class="address flexbox-children">'+poi.address+'</div> <div class="distance">'+poi.distance+'米</div> </div></div> </div> </div>';
		return html;
	}

	//创建POI列表
	function createPoiList(poiList){
		var html = "";
		poiList.pois.forEach(function(p){
			html = html + createPoiItem(p);
		})
		return  html;
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


}(jQuery,window,document))