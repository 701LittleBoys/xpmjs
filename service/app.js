if ( typeof Promise == 'undefined' ) { var _P = require('../lib/promise.min.js').Promise; } else { var _P = Promise; }
var Excp = require('excp.js');
var Session = require('session.js');
var Utils = require('utils.js');


function App( option, app_name, query ) {

	option = option || {};
	app_name = app_name || '';
	this.host = option['https'] || option['host'];
	this.apihost = 'https://' +  this.host + '/baas/route/app';
	this.query = query || {};
	this.sync = false;

	this.ss = new Session( option );
	this.utils = new Utils( option );
	this.ss.start();
	this.app_name = app_name || '';

	this.api = function( controller, action, query ) {
		query = query || {};
		this.query = this.utils.merge(this.query, query);
		this.query['_c'] = controller || 'defaults';
		this.query['_a'] = action || 'index';
		this.query['_app'] = this.app_name;
		return this;
	}


	this.get = function ( json ) {

		var query = [], queryString ='',  api=this.apihost,  opt={};
		for( var field in this.query ) {
			query.push(field + '=' + this.query[field]);
		}

		if ( typeof json == 'undefined' || json === true ) {
			opt['dataType'] = 'json';
		} else {
			opt['dataType'] = 'text';
		}

		api  +=  '?' + query.join('&');
		return this.utils.request('GET', api, {}, opt );
	}


	this.post = function ( data, json ) {
		data = data || {};
		var query = [], queryString ='',  api=this.apihost,  opt={};
		for( var field in this.query ) {
			query.push(field + '=' + this.query[field]);
		}

		if ( typeof json == 'undefined' || json === true ) {
			opt['dataType'] = 'json';
		} else {
			opt['dataType'] = 'text';
		}

		api  +=  '?' + query.join('&');
		return this.utils.request('POST', api, data, opt );
	}

	
	this.upload = function( tmpFile, name, data, json ) {

		name = name || 'wxfile';
		data = data || {};
		var query = [], queryString ='',  api=this.apihost,  opt={};
		for( var field in this.query ) {
			query.push(field + '=' + this.query[field]);
		}

		if ( typeof json == 'undefined' || json === true ) {
			opt['dataType'] = 'json';
		} else {
			opt['dataType'] = 'text';
		}

		api  +=  '?' + query.join('&');

		return this.utils.upload(tmpFile, name, api, data, opt );
	}

}


module.exports = App;
