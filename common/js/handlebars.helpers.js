//将毫秒数转化为本地化日期和时间
Handlebars.registerHelper("millisecond_to_datetime",function(millisecond){
	return new Date(millisecond).format("yyyy-MM-dd hh:mm:ss");
});

//将毫秒数转化为本地化时间
Handlebars.registerHelper("millisecond_to_time",function(millisecond){
	return new Date(millisecond).format("hh:mm:ss");
});

//将毫秒数转化为本地日期
Handlebars.registerHelper("millisecond_to_date",function(millisecond){
	return new Date(millisecond).toLocaleDateString();
});