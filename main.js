// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, Tray, Notification} = require('electron')
const path = require('path')
const http = require('http')

const express_server = require('./express_server')

/* (重要)虽然并不需要再多监听一个端口,
  因为导入 ./express_server 以后会自动开始监听4000端口
  但是这么操作一下可以使windows防火墙允许electron开启http服务器. */
http.createServer(express_server).listen('4100')

let tray = null

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // width: 998,
    // height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  mainWindow.maximize()

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // 修改关闭时的动作为隐藏
  mainWindow.on('close', (event) => { 
    event.preventDefault();
    mainWindow.hide(); 
    mainWindow.setSkipTaskbar(true);
  });

  // (重要)改成绝对路径就能解决打包后托盘消失的问题了
  // tray = new Tray('./static/img/clipboard.png')
  tray = new Tray(path.join(__dirname,'./static/img/clipboard.png'))
  // 托盘右键选项
  const contextMenu = Menu.buildFromTemplate([
    {label: 'exit', click: () => {mainWindow.destroy()}}, //完全退出程序
  ])
  tray.setToolTip('I am ready to receive some photos.')
  tray.setContextMenu(contextMenu)
  // 点击托盘, 打开关闭窗口
  tray.on('click', ()=>{ 
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

}).then(() => {
  // 显示系统通知
  new Notification({
    title: 'iOS file receiver is running.',
    body: 'After closing the setting window, I will keep running in the tray',
    icon: path.join(__dirname,'./static/img/clipboard.png'),
  }).show()
})

// Auto Start
// app.setLoginItemSettings({
//   openAtLogin: true, // Boolean 在登录时启动应用
//   openAsHidden: true, // Boolean (可选) mac 表示以隐藏的方式启动应用。~~~~
//   path: path.join(__dirname,'./out/ios_photos_to_win-win32-x64/ios_photos_to_win.exe'), // String (可选) Windows - 在登录时启动的可执行文件。默认为 process.execPath.
//   // args: [] String Windows - 要传递给可执行文件的命令行参数。默认为空数组。注意用引号将路径换行。
// })

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})