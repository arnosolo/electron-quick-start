// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, Tray, Notification} = require('electron')
const path = require('path')
const http = require('http')
const express_server = require('./express_server')

// 全局变量
// 不知道为什么不把托盘对象定义在全局,过一段时间托盘会消失
let tray = {} // 托盘

/* (重要)虽然并不需要再多监听一个端口,
  因为导入 ./express_server 以后会自动开始监听4000端口
  但是这么操作一下可以使windows防火墙允许electron开启http服务器. */
http.createServer(express_server).listen('4100')

/* 定义主窗口功能 */
function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    // height: 600,
    autoHideMenuBar: true,
    // show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  // mainWindow.maximize() //窗口最大化

  //加载页面
  mainWindow.loadFile('index.html')

  // 修改关闭时的动作为隐藏
  mainWindow.on('close', (event) => { 
    event.preventDefault();
    mainWindow.hide(); 
    mainWindow.setSkipTaskbar(true);
  });
  
  return mainWindow
}

/* 定义托盘功能 */
function createTray (mainWindow) {
  // (重要)改成绝对路径就能解决打包后托盘消失的问题了
  const tray = new Tray(path.join(__dirname,'static/img/clipboard.png'))

  // 托盘右键选项
  const contextMenu = Menu.buildFromTemplate([
    {label: 'exit', click: () => {mainWindow.destroy()}}, //完全退出程序
  ])
  tray.setContextMenu(contextMenu)

  tray.setToolTip('I am ready to receive some photos.')
  // 点击托盘, 打开关闭窗口
  tray.on('click', ()=>{ 
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })

  return tray
}

/* 主程序 */
app.whenReady().then(() => {
  const mainWindow = createWindow()
  tray = createTray(mainWindow)

  app.on('activate', function () {
    // if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

}).then(() => {
  // 通知: 程序已开启
  new Notification({
    title: '✔ Ready to receive messages from iOS',
    body: 'After close front window, I will keep running in tray.',
    icon: path.join(__dirname,'./static/img/clipboard.png'),
  }).show()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})