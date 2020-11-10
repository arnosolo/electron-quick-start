const Store = require('./Store')

const myTab = document.getElementById('myTab')
const alipay_qrcode = document.getElementById('alipay_qrcode')

// 获取局域网地址
function getIPAddress () {
    var interfaces = require('os').networkInterfaces();
    for(var devName in interfaces){
        var iface = interfaces[devName];
        for(var i=0;i<iface.length;i++){
            var alias = iface[i];
            // console.log(alias);
            if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' 
              && !alias.internal && alias.netmask === '255.255.255.0'){
              return alias.address;
            }
        }
    }
  }

// 打开用户设置
const store = new Store({
  configName: 'user-preferences',
  defaults: {}
});
function showSetting () {
  if(setting.className.match('show')){
    setting.className = 'hidden'
  } else {
    setting.className = 'show'
  }
  store.set('imgClipSize', 998)
  console.log(store.get('imgClipSize'));
  console.log();
}

function showPayment () {
  if(alipay_qrcode.className.match('show')){
    alipay_qrcode.className = 'hidden'
  } else {
    alipay_qrcode.className = 'show'
  }
}