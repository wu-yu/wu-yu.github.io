/**途经点设置**/


//途经点设置动作
$("#wayPointSetting").click(function(event) {
	$("#blockOne").addClass('hidden');
	$("#blockTwo").removeClass('hidden');

	$("#sl_btn").addClass('hidden');
	$("#wp_btn").removeClass('hidden');

	$("#wp_btn").siblings('.back_angle').addClass('hidden');

	$("#u_autocomplate").empty();
});

//完成按钮动作
$("#wp_btn").click(function(event) {
	$("#blockOne").removeClass('hidden');
	$("#blockTwo").addClass('hidden');

	$("#sl_btn").removeClass('hidden');
	$("#wp_btn").addClass('hidden');

	$("#wp_btn").siblings('.back_angle').removeClass('hidden');

	$("#u_autocomplate").empty();

	$('#wayPointCount').text($('#wayPoints').find('.wp_s').size());
});

//增加途经点动作
$("#wpadd_btn").click(function(event) {
	var lng = $('#wayPoint').attr('lng');
	var lat = $('#wayPoint').attr('lat');

	if($.trim(lng)=='' || $.trim(lat)==''){
    	nativeAlert('wayPointTip');                 				
		return false;
	}

	var name = $('#wayPoint').val();

	var isExist = false;
	$('#wayPoints > .wp_s').each(function(index, el) {
		if($(this).text() == name){
			nativeAlert('waypointAlreadyExist');
			isExist = true;
		}			
	});

	if(!isExist){
		var wp_span = '<span class="wp_s" lng='+ lng +' lat='+ lat +'><i class="fa fa-times"></i>'+ name +'</span>';
		$('#wayPoints').append(wp_span);	
		
		$('#wayPoint').val('').attr('lng','').attr('lat','');
	}

});

//移除途经点
$('#wayPoints').on('click','.wp_s',function(){
	$(this).remove();
})