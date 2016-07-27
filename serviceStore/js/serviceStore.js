;(function ($) {

		var param = {}; //参数容器
		var timeout; //滚动超时设置
		var oldParame; //判断分页时用的参数
	    var o = $({}); //构建jquery对象
	    //绑定监听的方式
	    $.subscribe = function () {
	        o.on.apply(o, arguments);
	    };
	    //解绑监听的方式
	    $.unsubscribe = function () {
	        o.off.apply(o, arguments);
	    };
	    //发布方式
	    $.publish = function () {
	        o.trigger.apply(o, arguments);
	    };

		getCurrentUser().done(function(){

	    	if( currentUser ){
	    		if(currentUser.vin && currentUser.vin !== null){
		    		param.vin = currentUser.vin;
		    	}else{
		    		nativeAlert($.i18n.prop('noCarRelateTip'));
		        	return false;
		    	}
	    		
	    		if(currentUser.userId){
					param.userId = currentUser.userId;
					param.startNum = 1;
	    		}
	    		
		    	
			    $.publish("start",param)
	    		$.methods.scroll(param);
	    	}
		})

	    $.methods = {
			allServices : function(e,param){
				//所有服务请求
				param.url = window.TCManagePlantformServer +"internal/services/service?vin="+param.vin+"&startNum="+param.startNum+"&pageSize=9&userId=" + param.userId +"&langCode="+ (sessionStorage.geelyapp_language != '2'?'zh_CN':'en_US');
				console.log(param.url)
				$.ajax({
					url: param.url,
					type:"get",
					dataType:"text",
					beforeSend:function(xhr){
		                setAjaxHeaderTokens(xhr);
		            }
				})
				.done(function(rs){
					var rs = JSON.parse(rs);		
					console.log(rs)			
					if(rs.operationResult == 0){
						$.methods.servicesList(rs,param);
					}else{
						nativeAlert($.i18n.prop(rs.error.code));	
					}
				})
			},
			tService : function(e,param){
				//t服务请求
				param.url = window.TCManagePlantformServer +"internal/services/service?vin="+param.vin+"&startNum="+param.startNum+"&pageSize=9&type=tservice&userId=" + param.userId +"&langCode="+ (sessionStorage.geelyapp_language != '2'?'zh_CN':'en_US');
				console.log(param.url)
				$.ajax({
					url: param.url,
					type:"get",
					dataType:"text",
					beforeSend:function(xhr){
		                setAjaxHeaderTokens(xhr);
		            }
				})
				.done(function(rs){
					var rs = JSON.parse(rs);		
					console.log(rs)			
					if(rs.operationResult == 0){
						$.methods.servicesList(rs,param);
					}else{
						nativeAlert($.i18n.prop(rs.error.code));	
					}
				})
			},
			teleService : function(e,param){
				//流量服务请求
				param.url = window.TCManagePlantformServer +"internal/services/service?vin="+param.vin+"&startNum="+param.startNum+"&pageSize=9&type=telecom&userId=" + param.userId +"&langCode="+ (sessionStorage.geelyapp_language != '2'?'zh_CN':'en_US');
				console.log(param.url)
				$.ajax({
					url: param.url,
					type:"get",
					dataType:"text",
					beforeSend:function(xhr){
		                setAjaxHeaderTokens(xhr);
		            }
				})
				.done(function(rs){
					var rs = JSON.parse(rs);		
					console.log(rs)			
					if(rs.operationResult == 0){
						$.methods.servicesList(rs,param);
					}else{
						nativeAlert($.i18n.prop(rs.error.code));	
					}
				})
			},
			servicesList : function(rs,param){
				//首页动态列表信息
			    var result = '';
				if(rs.lastRow && rs.lastRow <= rs.totalRows && rs.services.length >0){
					param.startNum = parseInt(rs.lastRow +1);
					console.log(param.startNum)

					var data = rs.services;
					for(var i = 0; i < data.length; i++){
						result += "<a class='item' href=../serviceStore/buyService.html?id="+data[i].id+">";
						result += "<img src='"+data[i].icon+"' />";
						result += "<h3>"+data[i].name+"</h3>";
						result += "<img src='images/arrow_right@2x.png' />";
					}

					$('.queryServicesList').append(result);	
				}
			},
			scroll : function(param){
				//滚动分页加载
				$(".content").scroll(function() {

					clearTimeout(timeout);
				    if ($(document).scrollTop() >= $(document).height() - $(window).height()) {
				      	console.log("滚动条已经到达底部为" + $(document).scrollTop());

				      	if(oldParame != param.startNum){

				      		console.log(param.startNum)
				      		$.methods.ExMethod(param)

							oldParame = param.startNum;
							$(".dropload-down").removeClass("hide");
				      	}else{
				      		timeout = setTimeout(function(){
				      			$(".dropload-down").addClass("hide");
				      		},500);
				      	}
				    }
			  	});
			},
			ExMethod : function(param){
				//判断下拉滚动时实行的方法
				if(param.url.indexOf('tservice')>0){
	      			
	      			console.log("tService");
	      			$.methods.tService('',param);

	      		}else if(param.url.indexOf('telecom')>0){
	      			
	      			console.log("teleCom");
	      			$.methods.teleService('',param);

	      		}else{

	      			console.log("all");
		      		$.methods.allServices('',param);

	      		}
			},
			getPurchaseHistory : function(param){
				//购买记录
				param.url = window.TCManagePlantformServer + 'internal/services/purchase-history?vin=' + param.vin + "&userId=" + param.userId +"&startNum="+param.startNum+"&pageSize=9";

				$.ajax({
					url : param.url,
					type : "get",
					dataType : 'text',
					beforeSend:function(xhr){
		                setAjaxHeaderTokens(xhr);
		            }
				})
				.done(function(rs){
					console.log(rs)
				})
			},
			getServiceDetail :function(e,param){ //获取服务的详细情况
				//获取链接中id的值
				var id = getParam('id') ? decodeURI(getParam('id')) : {};
				
				$.ajax({
					url: window.TCManagePlantformServer +"internal/services/service/"+id+"?vin=123456789abcdefgh&userId=" + param.userId +"&langCode="+ (sessionStorage.geelyapp_language != '2'?'zh_CN':'en_US'),
					type:"get",
					dataType:"text",
					beforeSend:function(xhr){
		                setAjaxHeaderTokens(xhr);
		            },
				})
				.done(function(rs){
					console.log(rs);
					var rs = JSON.parse(rs);
					if(rs.operationResult == 0){
						//operationResult为true,这项服务的订购已经过期，或者用户还未订购此服务
						//operationResult为false,这项服务的订购未过期，或者用户已经订购了
						if(rs.type == "tservice" &&rs.isExpired == false){
							// console.log("expirationTime:"+rs.expirationTime);
							$(".serviceDetail .col-md-3 img").attr('src', rs.icon);
							$("#title").html(rs.name);
							$(".time").html(splitTime(rs.expirationTime));
							$(".detail_three").removeClass("hide");
							$(".detail_two").addClass("hide");
						}else{
							$(".detail_two").removeClass("hide");
							$(".detail_three").addClass("hide");
						}

						var data = rs.offers;
						var text = "";
						$(".buyChoose>label").remove();
						$.each(data,function(index,el){
							text += "<label><input type='radio' name='id' value='"+el.id+"'  />";
							text += "<div><span>"+el.price+"</span><span>"+$.i18n.prop("currency")+"</span></div></label>";
						})
						$(".buyChoose").append(text);
						$(".titleName").html(rs.name);
						$(".detail_one").html(rs.description);

						//选中的服务价格套餐
						$("input[name=id]").click(function(){
							console.log($("input[name=id]").val());
							$.methods.buySubmit(param.vin,param.userId,rs.id,$("input[name=id]").val());
						});

					}else{
						nativeAlert($.i18n.prop(rs.error.code));
					}
				})
			},
			buySubmit : function(vin,userId,id,offerId){ //选中购买类型
				$("#purchaseService").on("click",function(event){
					console.log(id+","+offerId);
					$.methods.purchaseService(vin,userId,id,offerId);
				});
			},
			purchaseService : function(vin,userId,id,offerId){ //提交购买
				$.ajax({
					url: window.TCManagePlantformServer + "internal/services/service/purchase",
					type:"POST",
					dataType:"text",
					data:JSON.stringify({
						vin:vin,
						userId:userId,
						id:id,
						offerId:offerId
					}),
					contentType:'application/json',
					beforeSend:function(xhr){
		                setAjaxHeaderTokens(xhr);
		            }
				})
				.done(function(rs){
					console.log(rs)
					var rs = eval('('+rs+')');
					if(rs.operationResult == 0){
						
						nativeAlert($.i18n.prop('buySuccess'));
						
					}else{
						nativeAlert($.i18n.prop(rs.error.code));
					}
				})
				.fail(function(){
					console.log(rs.error.message)
				})
			},
			getInUseServices : function(e,param){ //使用中服务请求
				$.ajax({
					url: window.TCManagePlantformServer +"internal/services/service/in-use-tservice?vin="+ param.vin +"&userId=" + param.userId +"&langCode="+ (sessionStorage.geelyapp_language != '2'?'zh_CN':'en_US'),
					type:"get",
					dataType:"text",
					beforeSend:function(xhr){
		                setAjaxHeaderTokens(xhr);
		            },
				})
				.done(function(rs){
					var rs = eval('('+rs+')');
					console.log(rs)
					if(rs.operationResult == 0){
						$.methods.InUseServicesList(rs);
					}else{
						nativeAlert($.i18n.prop(rs.error.code));
					}
				})		
			},
			InUseServicesList : function(rs){ //使用中html列表
				var result = '';
    	 		var data = rs.inUseServices;
    	 		for(var i=0; i<data.length; i++){
    	 			result += "<a class='item' href=../serviceStore/buyService.html?id="+data[i].id+">";
    	 			result += "<img src='"+data[i].icon+"' />";
    	 			result += "<div class='icon'><div class='package'>"+data[i].name+"</div>";
    	 			result += "<div class='dataTips'><p>"+$.i18n.prop("choosePlan1")+"</p>";
    	 			result += "<span>"+splitTime(data[i].expirationTime)+"</span><p>"+$.i18n.prop("datailDate")+"</p> <span>"+getDays(data[i].expirationTime)+"</span><p>"+$.i18n.prop("datailDate2")+"</p>";
    	 			result += "</div></div><img src='images/arrow_right@2x.png' /></a>";
    	 		}
    	 		$(".serviceList>.lists").append(result);
			}
	    }

	 //所有服务点击事件
	 $("#allClassify").click(function(){
		param.startNum = 1;
		oldParame = param.startNum;
		$.methods.allServices('',param);
	});

	//t服务点击事件
	$("#service").click(function(){
		param.startNum = 1;
		oldParame = param.startNum;
		$.methods.tService('',param);
	});

	//流量点击事件
	$("#gprs").click(function(){
		param.startNum = 1;
		oldParame = param.startNum;
		$.methods.teleService('',param);
	});

	//滑动btn
	$(".actBtn").click(function(){
		$(".queryServicesList>.item").remove();
		$(this).addClass("active").siblings(".actBtn").removeClass("active");
	})

	

} (jQuery));

	//获取时间的年月日
	function splitTime(data){
		return data.substring(0,10);
	}

	//两个日期之间的相隔的天数
	function getDays(strDateEnd){
		var oDate1 = new Date();
		var oDate2;
		var iDays;
   		oDate2= strDateEnd.substring(0,10).split("-");
   		var strDateS = new Date(oDate1.getFullYear(), oDate1.getMonth()-1, oDate1.getDate());
   		var strDateE = new Date(oDate2[0], oDate2[1]-1, oDate2[2]);
   		iDays = parseInt(Math.abs(strDateS - strDateE ) / 1000 / 60 / 60 /24)//把相差的毫秒数转换为天数 
   		
   		return iDays ;
	}
    