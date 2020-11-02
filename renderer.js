document.getElementById('adress').innerHTML = getIPAddress()
const setting = document.getElementById('setting')

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

// 显示设置页面
function showSetting () {
  
}