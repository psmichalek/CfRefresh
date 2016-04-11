/*!
 * Node.JS module "EV Refresh CF"
 * @description Calles a service that refreshes coldfusion template and component cache and does a Rest init for each specified E-Value environment
 * @author Paul S Michalek (psmichalek@gmail.com)
 * @license MIT
 *
 * The MIT License (MIT)
 */

var rp 		= require('request-promise'),
	fsjson 	= require('fs-json')(),
	_ 		= require('lodash'),
	moment 	= require('moment'),
	Q 		= require('q');

	require('shelljs/global');

var mod = new RCF();

exports.init 		= mod.init;
exports.hosts 		= mod.hosts;
exports.run 		= mod.run;
exports.templates 	= mod.templates;

// Encapsulate the functionality of this module into a service object 
// using the revlealing module pattern.

function RCF() 
{

	//Private vars

	var _confs = {};
 	var _hosts = [];
 	var _cookie = '';
 	var _params = {valid:true,invalid:[]};

	// Private methods
	
	// Helpers
	function _isValid(v){ return (typeof v!=='undefined' && v!==null && v!='')?true:false; }
	function _replacedate(txt){ return txt.replace("{date}",moment().format("MM/DD/YYYY hh:mm:ss A")); }
	function _logger(txt){
		if( _.isUndefined(txt) ) _.each(_params.invalid,function(m){console.log(m)});
		else if(txt!==null&&txt!='') console.log(txt);
	}

	// Workers
	function _templates(){

		var t = {};
		t.MISSING_COOKIE="Cookie value is missing.";
		t.MISSING_ENVFILE="Environment config file path is missing.";
		t.MISSING_REFRESHURL="URL to cache refresh service is missing.";
		t.REFRESH_START='\nRefresh start {date}\n';
		t.REFRESH_COMPLETE='Refresh completed {date}\n';
		return t;

	}

	function _setup(c){

		var t = _templates();

		_confs = c;
		
		if( _isValid(_confs.cookie) ) _cookie = _confs.cookie; 
		else { _params.valid = false; _params.invalid.push(t.MISSING_COOKIE) }
		
		if( !_isValid(_confs.envconfig) ) { _params.valid = false; _params.invalid.push(t.MISSING_ENVFILE) };
		
		if( !_isValid(_confs.cachepath) ) { _params.valid = false; _params.invalid.push(t.MISSING_REFRESHURL) };
		
		if(!_params.valid) _logger();

		return _confs;
	
	}

	function _sethosts(){
		
		if(_params.valid){
			var evs = fsjson.loadSync( _confs.envconfig ),
				ret = [];
			if(typeof evs!=='undefined'){
				var ss = (typeof _confs.target!=='undefined') ? evs[_confs.target] : evs['dev'];
				_.each(ss,function(s){
					var isStage = ( s['dns'].match(/stg/)!==null ) ? true : false;
					var prefix = (isStage) ? 'http://' : 'https://';
					var uri = (isStage) ? s.ip : s.url;
					var suffix = _confs.cachepath;
					if(s.note!='content') ret.push(prefix+uri+suffix);
				});
			}
			_hosts = _.clone(ret);
			return ret;

		} else _logger();

	}

	function _dorefresh(){

		var t = _templates();
		if(_params.valid){

			console.log( _replacedate(t.REFRESH_START) );

			var refreshes = [];

			_.each( _hosts,function(host){ refreshes.push( _refresh(host) ); } );

			Q.all(refreshes).then(function(d){
				console.log( _replacedate(t.REFRESH_COMPLETE) );
			});

		} else _logger();
	
	}

	function _refresh(url){
		
		var options = {	
			uri:url,
			method:'GET',
			headers:{
				'Accept':'text/html',
				'User-Agent':'Mozilla/5.0',
				'Cookie':_cookie
			},
			simple:false,
			resolveWithFullResponse:true 
		};

		var requestPromise = rp(options).then(function(response, body){
			console.log(' ***********************************');
			console.log(' * Server: '+url);
			if(typeof response!=='undefined') console.log(' * Status: '+response.statusCode);
			if(response.statusCode!=404&&response.statusCode!=500){
				if(typeof response.body!=='undefined'&&response.body!==null&&response.body!='') console.log(' * Reply: '+response.body);
			}
			console.log(' ***********************************'+'\n');
		})
		.catch(function(err){ 
			console.log(err) 
		});

		return requestPromise;
	
	}	

	// Public API
	this.init 		= _setup;
	this.templates 	= _templates;
	this.hosts 		= _sethosts;
	this.run 		= _dorefresh;
	return this;

}



