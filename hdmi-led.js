var Gpio = require('onoff').Gpio;
var pin_red = 24;
var pin_green = 23;
var pin_blue = 22;

var nodecec = require('node-cec');

var NodeCec = nodecec.NodeCec;
var CEC = nodecec.CEC;

var cec = new NodeCec('node-cec-monitor');

var tvOn= false;

process.on('SIGINT', function() {
  if (cec != null) {
    cec.stop();
  }
  process.exit();
});

function tv_on() {
  console.log(' -- TV_ON -- ');

  new Gpio(pin_red, 'out').write(0);
  new Gpio(pin_blue, 'out').write(1);
}

function tv_standby() {
  console.log(' -- TV_STANDBY -- ');

  new Gpio(pin_red, 'out').write(1);
  new Gpio(pin_blue, 'out').write(0);
}

cec.once('ready', function(client) {
  console.log(' -- READY -- ');
  client.sendCommand(0xf0, CEC.Opcode.GIVE_DEVICE_POWER_STATUS);
});

cec.on('REPORT_POWER_STATUS', function(packet, status) {
  if (status == 0) {
    tv_on();
  } else if (status == 1) {
    tv_standby();
  }
});

cec.on('GIVE_PHYSICAL_ADDRESS', function() {
  if (!tvOn) {
    tv_on();
    tvOn = true;
  }
});

cec.on('STANDBY', function() {
  tv_standby();
  tvOn = false;
});

// -m  = start in monitor-mode
// -d8 = set log level to 8 (=TRAFFIC) (-d 8)
// -br = logical address set to `recording device`
cec.start( 'cec-client', '-m', '-d', '8', '-b', 'r' );

