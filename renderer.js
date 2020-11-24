const Store = require('./Store')

const myTab = document.getElementById('myTab')
const alipay_qrcode = document.getElementById('alipay_qrcode')

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