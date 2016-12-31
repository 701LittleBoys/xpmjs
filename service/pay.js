require('../lib/promise-7.0.4.min.js');
var Excp = require('excp.js');
var Session = require('session.js');
var Table = require('table.js');
var Utils = require('utils.js');

function Pay( option ) {

	option = option || {};

	var utils = new Utils( option );

	this.host = option['https'] || option['host'];
	this.prefix= option['table.prefix'] || '';
	this.api = 'https://' +  this.host + '/baas/pay';
	this.ss = new Session( option );
	this.ss.start();

	
	this.request = function( paydata ) {
		
		var that = this;

		return new Promise(function (resolve, reject) {

			utils.request('POST', that.api + '/unifiedorder', paydata )

			.then(function( data ) {

				if ( data['return_code'] == 'SUCCESS' ) {

					wx.requestPayment({
					   'timeStamp': data['timeStamp'].toString(),
					   'nonceStr': data['nonceStr'],
					   'package':data['package'],
					   'signType': 'MD5',
					   'paySign': data['paySign'],
					   'success':function(res){	
					   		resolve({
					   			return_code:'SUCCESS',
					   			attach:paydata['attach'],
					   			out_trade_no:data['out_trade_no'],
					   			prepay_id:data['prepay_id']
					   		});
					   },
					   
					   'fail':function(res){
					   		reject(new Excp('微信支付接口错误',500, {'res':res}));
					   }
					});

				} else {
					reject(new Excp('统一下单接口错误',500, {'data':data}));
				}
			})

			.catch( function( excp ) {
				reject(excp);
			})
		});

	}

}

module.exports = Pay;