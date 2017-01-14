require('../lib/promise-7.0.4.min.js');
var Session = require('session.js');
var Excp = require('excp.js');

/**
 * 常用工具
 * @param {[type]} option [description]
 */

function Utils( option ) {

	this.ss = new Session( option );
	this.host = option['https'] || option['host'];

	/**
	 * 生成一个 Guid
	 * @return GUID
	 */
	this.guid = function(){
		
		function S4() {
    		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  		}
  		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	}


	/**
	 * 抓取远程地址
	 * 
	 * @param  string url 地址
	 * @param  object option 请求选项
	 * 
	 * @param  string option.method 请求方法 GET/POST/PUT/DELETE
	 * @param  object option.query  GET 参数
	 * @param  object option.data   POST 参数
	 * @param  object option.header   Request Header
	 * @param  string option.type     HTTP REQUEST TYPE 默认为 form . 有效数值 form/json/raw/media
	 * @param  string option.datatype HTTP RESPONSE TYPE 默认为 html. 有效值 json/html/auto/xml  
	 *
	 * 
	 * @return Promise
	 */
	this.fetch = function ( url, option ) {

		var api  = 'https://' +  this.host + '/baas/route/url';
			option = option || {};
			option['datatype'] = option['datatype'] || 'html';
			option['type'] =  option['type'] || 'form';
			option['header'] = option['header']  || {};

		return this.request( 'POST', api, {
			'url': url,
			'method':option['method'] || 'GET',
			'option':option || {}
		}, {
			'dataType': option['datatype'] || 'text',
			'header': option['header'] 
		});

	}



	/**
	 * 
	 * 发起 Request 请求
	 * 
	 * @param  string method 方法 GET/POST/PUT/DELETE ..
	 * @param  string api API 地址
	 * @param  string data  post data
	 * @param  object option 选项
	 * @return Promise
	 */
	this.request = function( method, api, data, option ) {
		option = option || {};
		option['header'] = option['header'] || {'content-type': 'application/json'};
		option['dataType'] = option['dataType'] || 'json';
		data = data || {};
		data["_sid"] = this.ss.id();

		return new Promise(function (resolve, reject) {

			wx.request({
				url: api,
				data: data, 
				header: option['header'],
				method: method,
				success: function (res){

					if ( res.statusCode != 200 ) {
						reject(new Excp('请求API失败', res.statusCode, {
							res:res,
							method:method, 
							api:api, 
							data:data, 
							option:option
						}));
						return;
					}

					if ( typeof res['data']['code'] != 'undefined' &&  res['data']['code']  != 0 ) {
						reject(new Excp('请求API失败',500, {
							res:res,
							method:method, 
							api:api, 
							data:data, 
							option:option
						}));
						return;
					}

					if ( typeof res['data'] != 'object' && option['dataType'] == 'json') {
						reject(new Excp('请求API失败',500, {
							res:res,
							method:method, 
							api:api, 
							data:data, 
							option:option
						}));
						return;
					}
					resolve( res['data'] );
				},

				fail: function (res) { 
					reject(new Excp('请求API失败',500, {
						res:res,
						method:method, 
						api:api, 
						data:data, 
						option:option
					}));
				}
			});
		});
	}



	/**
	 * 计算时间差值
	 * @param  datetime start 开始时间
	 * @param  datetime end   结束时间
	 * @param  string unit 时间单位 （ 默认 second,  有效值  day hour  minute second ）
	 * @return 时间差值
	 */
	this.timediff = function( start, end, unit ) {
		var u = unit || 'second'; // day hour  minute second
		var startDate = new Date( start );
		var endDate   = new Date( end );

		var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
		
		if ( u == 'second' ) {
			return seconds;
		} else if ( u == 'minute' ) {
			return seconds / 60
		} else if ( u == 'hour' ) {
			return seconds / 3600
		} else if ( u == 'day' ) {
			return seconds / 86400
		}
		
		return seconds;
	}


	/**
	 * 合并多个Object 
	 * @param  Object  n1, n2...  待合并的 Object
	 * @return Object 
	 */
	this.merge = function() {

	    var to = new Object();

	    // 遍历剩余所有参数
	    for (var i = 0; i < arguments.length; i++) {
	      var nextSource = arguments[i];
	      // 参数为空，则跳过，继续下一个
	      if (nextSource === undefined || nextSource === null) {
	        continue;
	      }
	      nextSource = Object(nextSource);

	      // 获取改参数的所有key值，并遍历
	      var keysArray = Object.keys(nextSource);
	      for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
	        var nextKey = keysArray[nextIndex];
	        var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
	        // 如果不为空且可枚举，则直接浅拷贝赋值
	        if (desc !== undefined && desc.enumerable) {
	          to[nextKey] = nextSource[nextKey];
	        }
	      }
	    }

	    return to;
	}

	/**
	 * 获取当前的地理位置
	 * @param  string type 默认为 wgs84  返回 gps 坐标
	 * @return Promise
	 */
	this.getLocation = function( type ) {

		type = type || 'wgs84';
		return new Promise(function (resolve, reject) {
			wx.getLocation({
				type:type,
				success:function( data ) {
					resolve(data);
					return;
				},

				fail: function( res ) {
					reject(new Excp('调用地位信息失败',500, {
						res:res,
						type:type
					}));
					return;
				}
			});
		});
	}


	/**
	 * 打开地图选择位置
	 * @return Promise
	 */
	this.chooseLocation = function() {

		return new Promise(function (resolve, reject) {
			wx.chooseLocation({

				success:function( data ) {
					resolve(data);
					return;
				},

				fail: function( res ) {
					if ( res.errMsg=='chooseLocation:fail cancel') {
						reject(new Excp('用户取消调用',501, {
							res:res
						}));

					} else {
						reject(new Excp('打开地图选择位置接口失败',500, {
							res:res
						}));
					}
					return;
				}
			});
		});
	}

}

module.exports = Utils;