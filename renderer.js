const Store = require('./utils/Store')
const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

// 通过导航栏切换界面
var receiveTab = document.getElementById('receive-tab')
var sendTab = document.getElementById('send-tab')
var receiveContent = document.getElementById('receive-content')
var sendContent = document.getElementById('send-content')
receiveTab.onclick = () => {
  receiveContent.classList.add('active', 'show')
  receiveTab.classList.add('active', 'show')
  sendContent.classList.remove('active')
  sendTab.classList.remove('active')
}
sendTab.onclick =() => {
  receiveContent.classList.remove('active')
  receiveTab.classList.remove('active')
  sendContent.classList.add('active', 'show')
  sendTab.classList.add('active', 'show')
}

const shareBtn = document.getElementById('share-btn')
const shareStatus = document.getElementById('share-status')

shareBtn.onclick = function() {
  
  // 打开文件选择对话框
  ipcRenderer.on('asynchronous-reply', (event, targetPath) => {
    const fileName = path.basename(targetPath[0])
    console.log(fileName);
    shareStatus.innerHTML = `File ${fileName} selected`
  })
  ipcRenderer.send('asynchronous-message', 'selectFile')

}

var QRCode = require('qrcode')
var canvas = document.getElementById('canvas')
const lanIPInput = document.getElementById('lan-ip-input')
const qrCodeStr = document.getElementById('qrcode-str')
let qrCodeUrl = ''
let lanIP = localStorage.getItem('lanIP') || '';

const setQRCode = () => {
  qrCodeUrl = `http://${lanIP}:4000/api/share_file`
  qrCodeStr.innerText = qrCodeUrl
  QRCode.toCanvas(canvas, qrCodeUrl, function (error) {
    if (error) console.error(error)
    console.log('success!');
  })
}
lanIPInput.value = lanIP
setQRCode()

lanIPInput.oninput = (e) => {
  lanIP = lanIPInput.value
  localStorage.setItem('lanIP', lanIP);
  setQRCode()
}




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
  store.set('imgClipSize', 500)
  console.log(store.get('imgClipSize'));
}

function showPayment () {
  if(alipay_qrcode.className.match('show')){
    alipay_qrcode.className = 'hidden'
  } else {
    alipay_qrcode.className = 'show'
  }
}