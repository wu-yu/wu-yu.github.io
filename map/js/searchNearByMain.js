    //周边停车触发
    $("#parkingLot").on("click",function(){
        clearMarkers();
        $("#search_in").val("");
        $("#tel").html("");
    
        $('#nearByPanel').searchPOIs({
            center:[personalPonit.lng,personalPonit.lat],
            type:'停车场',
            api:"searchNearBy",
            isShow:true
        });     
        $('#s_map').hide();
    });

    //周边洗车触发按钮
    $("#carWash").on("click",function(){
        clearMarkers();
        $("#search_in").val("");
        $("#tel").html("");
        
        $('#nearByPanel').searchPOIs({
            center:[personalPonit.lng,personalPonit.lat],
            type:'洗车场',
            api:"searchNearBy",
            isShow:true
        })          
        $('#s_map').hide();        
    });

    //充电桩
    $("#chargingSpot").on("click",function(){
        clearMarkers();
        $("#search_in").val("");
        $("#tel").html("");

        $('#nearByPanel').searchPOIs({
            type:"充电桩",
            api:"search",
            isShow:false
        })          
        $('#s_map').hide();  
    })

    //关闭周边搜索页面触发事件
    $('#nearByPanel').on('hidePanel',function(){
        //这里可以做一些后面需要的操作，比如移除所有的周边搜素的点标注
        $('#s_map').show();  
    })        

    //“showNearBy”事件。点击周边页面右上角“地图”按钮触发，返回参数为POIList的信息
    $('#nearByPanel').on('showNearBy',function(event,data){
        console.log('showNearBy',data.pois);
        showNearSearchResult(data.pois,0);        
        $('#s_map').show();          
    })    

    //“showSelectedPoi”事件。点击周边列表中的一项API触发，返回的data参数为{"poi":pois,"index":index}，其中pois为周边搜索搜出的poiList，index为选中的poi点序号，从0开始
    $('#nearByPanel').on('showSelectedPoi',function(event,data){
        showNearSearchResult(data.pois,data.index);
        $('#s_map').show();                 
    })    


    //"sendToCar"事件,单击左下方“发送到车”触发,并且返回poi信息
    $('#nearByPanel').on('sendToCar',function(event,data){
        console.log(data);
        sendPoiToCar(data.location.lng,data.location.lat,data.name,data.address);        
    }) 
 