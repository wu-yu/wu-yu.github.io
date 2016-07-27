/**
只写工具类函数，不涉及业务逻辑
*/

window.utiljs = {
	 //获取中间4位为*号的手机号码	
	getStarMobileNumber: function(mobileNumber){
	 	return mobileNumber.substring(0,3)+'****'+mobileNumber.substring(7,11);
	 },	
}

