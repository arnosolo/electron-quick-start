// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, Notification } = require('electron')
const path = require('path')
const http = require('http')
const express_server = require('./express_server')
const Store = require('./utils/Store')

// 全局变量
let mainTray; // 托盘
let mainWindow;

/* (重要)虽然并不需要再多监听一个端口,
  因为导入 ./express_server 以后会自动开始监听4000端口
  但是这么操作一下可以使windows防火墙允许electron开启http服务器. */
http.createServer(express_server).listen('4100')

/* 定义主窗口功能 */
function createWindow() {
  const window = new BrowserWindow({
    width: 800,
    // height: 600,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  // window.maximize() //窗口最大化

  //加载页面
  window.loadFile('index.html')

  // 修改关闭时的动作为隐藏
  window.on('close', (event) => {
    event.preventDefault();
    window.hide();
    window.setSkipTaskbar(true);
  });

  return window
}

/* 定义托盘功能 */
function createTray(window) {
  // (重要)改成绝对路径就能解决打包后托盘消失的问题了
  const tray = new Tray(path.join(__dirname, 'static/img/clipboard.png'))

  // 托盘右键选项
  const contextMenu = Menu.buildFromTemplate([
    { label: 'exit', click: () => { window.destroy() } }, //完全退出程序
  ])
  tray.setContextMenu(contextMenu)

  tray.setToolTip('I am ready to receive some photos.')
  // 点击托盘, 打开关闭窗口
  tray.on('click', () => {
    window.isVisible() ? window.hide() : window.show()
  })

  return tray
}

/* 主程序 */
app.whenReady()
  .then(() => {
    mainWindow = createWindow()
    mainTray = createTray(mainWindow)
  })
  .then(() => {
    // 通知: 程序已开启
    const notification = new Notification({
      title: '✔ Ready to receive something from iOS',
      body: 'Click me to read user manual.',
      icon: path.join(__dirname, './static/img/clipboard.png'),
    })
    notification.on('click', () => { // 点击通知打开设置引导页面
      mainWindow.show();
    })
    notification.show();
  })

//设置开机启动
if (app.isPackaged) {
  app.setLoginItemSettings({
    openAtLogin: true
  });
}


app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})