var util = require('mis-util');
var config = require('./config.ignore');

var options = {
   sysname: '/c1/FRSH',
   connect: {
      host: 'gccmhc',
      user: 'tim',
      password: config.user
   },
   cron: {
      user: 'datamgr',
      pass: config.cron
   },
   view_path: {
      local: './view/',
      remote: '/CUST/forms/'
   },
   parm_path: {
      local: './build/'
   },
   usc_path: {
      local: './'
   }
};

var mis = util(options);

console.log('deploying to: ' + options.sysname);

mis.script.install('./AnsiWrap.usc');
