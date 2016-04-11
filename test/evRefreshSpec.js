
/**
	Refresh cf example useage:
	var confs = {};
	confs.target = 'test';
	confs.cachepath = "/api/refreshcf";
	confs.envconfig = "../configs/env.json";
	confs.cookie = 'EVALUECFTOKEN=111;TANGO=ddd';

	refreshcf.init(confs);
	var hosts = refreshcf.hosts();
	refreshcf.run();
**/

var chai 	=require('chai'),
	expect 	=chai.expect,
	assert 	=chai.assert,
	_ 		=require('lodash'),
	refreshcf	=require('../index.js');

require('shelljs/global');
require('mocha-sinon');

describe("ev-refresh-cf module",function(){
	
	process.env.target = 'dev';

	var evr = new refreshcf();
	var tmpl = evr.templates();
	var confs = {};

	this.timeout(10000);

	it('should console log "'+tmpl.MISSING_COOKIE+'" if initialized with missing cookie parameter',function(){
		confs.target = process.env.target;
		confs.cachepath = "/ev2/init/resetCache.cfm";
		confs.envconfig = "./evEnvironments.json";
		var stub = this.sinon.stub(console,'log');
		evr.init(confs);
		evr.hosts();
		evr.run();
		expect( stub.calledThrice ).to.be.true;
		expect( stub.calledWith(tmpl.MISSING_COOKIE) ).to.be.true;
	});

	// it('should console log "'+tmpl.MISSING_ENVFILE+'" if initialized with missing envconfig parameter',function(){
	// 	confs.target = process.env.target;
	// 	confs.cachepath = "/api/refreshcf";
	// 	confs.cookie = 'EVALUECFTOKEN=111;TANGO=ddd';
	// 	confs.envconfig = undefined;
	// 	var stub = this.sinon.stub(console,'log');
	// 	evr.init(confs);
	// 	evr.hosts();
	// 	evr.run();
	// 	expect( stub.called ).to.be.true;
	// 	expect( stub.calledWith(tmpl.MISSING_ENVFILE) ).to.be.true;
	// });
});

