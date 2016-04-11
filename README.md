# Ev Refresh CF
Simple Node module for refreshing coldfusion template and component cache along with doing Rest initialization on specified EV environment (dev,test,stage).

## Useage

```
var refreshcf = require('ev-refresh-cf');
var confs = {};
confs.target = process.env.target;
confs.cachepath = "/ev2/init/resetCache.cfm";
confs.envconfig = "./evEnvironments.json";
confs.cookie = 'EVALUECFTOKEN=<***ev cf token goes here**>;TANGO=<***cfadmin creds goes here***>';

refreshcf.init(confs);
var hosts = refreshcf.hosts();
refreshcf.run();

```
