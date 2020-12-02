const express = require('express');
const clipboardy = require('clipboardy');
const bodyParser = require('body-parser');
const formidable = require("formidable")
var logger = require('morgan');
const fs = require("fs")
const os = require('os')
const path = require('path')
const { Notification, shell, clipboard, nativeImage } = require('electron')

const util = require('./util')
const Store = require('./Store')

// 1.创建express对象
const app = express();

// 创建配置文件读写对象
const store = new Store({
  configName: 'user-preferences',
  defaults: {
    imgClipSize: 1000, // 剪切板图片最大尺寸
    savePath: '\\Pictures\\' // 保存路径
  }
});

// 2.加载插件
// 在Express 中没有内置获取表单POST请求体的API,使用这个插件使其能够解析POST内容
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(logger('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine( '.html', require( 'ejs' ).__express );

// 3.决定如何响应请求
/* 渲染网页端 */
app.get('/', (req, res)=>{
    res.render('index', { title: ''});
})

/* 处理发来的消息 */
app.post('/msg', function (req, res) {
    const { msg } = req.body
    clipboardy.write(msg)
    
    // 显示系统通知
    const notification = new Notification({
      title: 'Msg --> Clipboard',
      body: `${msg}`,
      icon: path.join(__dirname,'./static/img/clipboard.png'),
    })
    notification.show()
    // 提取消息中的网址
    const urlArray = msg.match(/((https?:\/\/)+[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/g);
    // 点击通知打开网页
    notification.on('click' , () => {
      if(urlArray[0] !== null){
        // notification.body = '点击打开网页'
        shell.openExternal(urlArray[0])
      }
    })

    console.log('Msg received:', msg); 
    res.send({code:1, msg:'success'})
})

/* 处理发来的文件 */
app.post('/upload', function (req, res) {
  // 获取用户信息
  var { homedir } = os.userInfo()
  
  // 解析表单
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) throw err
    for (let key in files) {
      let file = files[key]
        console.log('Incoming file:', file.name);
        // 过滤空文件
        if (file.size == 0 && file.name == '') continue

        /* 保存文件到Pictures文件夹 */
        const fileName = file.name.split('.')[0]
        const fileType = file.name.split('.')[1]
        const oldPath = file.path
        // let newPath = homedir + '\\Pictures\\'
        const savePath = store.get('savePath')
        let newPath = homedir + savePath
        // 如果文件夹不存在，创建
        util.checkDirExist(newPath)
        newPath += fileName + '_' + Date.now() + '.' + fileType
        // 保存文件
        var readStream = fs.createReadStream(oldPath)
        var writeStream = fs.createWriteStream(newPath)
        readStream.pipe(writeStream)
        let had_error = false
        readStream.on('error', function(err){
          if (err) throw err
          had_error = true;
        });
        readStream.on('close', function(){
          // res.status(500).send({ error: 'Something failed!' })

          /* 保存文件后
            1. 将图片添加到剪切板
            2. 发送一条系统通知
            3. 删除临时文件 */
          if (!had_error) {
            console.log('File saved: ', file.name);

            // 将图片添加到剪切板
            let image = nativeImage.createFromPath(newPath)
            let imgClip = {}
            if(fileType === 'jpeg' || 'jpg'){
              const imgClipSize = store.get('imgClipSize')*1
              const {width, height} = image.getSize()
              if(width > height) {
                imgClip = image.resize({width:imgClipSize})
              }else {
                imgClip = image.resize({height:imgClipSize})
              }
            }else {
              imgClip = image
            }

            clipboard.writeImage(imgClip)

            // 显示系统通知
            const notification = new Notification({
              title: 'File --> Folder',
              body: `${file.name}`,
              icon: path.join(__dirname,'./static/img/clipboard.png'),
            })
            notification.show()
            // 点击通知跳转到资源管理器
            notification.on('click' , () => {
                shell.showItemInFolder(newPath)
                console.log('Notification clicked:', file.name)
            })

            // 删除临时文件
            fs.unlink(oldPath, (err) => {
              if (err) throw err
            }) 
            
          }
        });
        
      }
      
    res.send({code:1, msg:'File transfer success.'})
  })
  
});
  
/* 打开网页开始下载 */
app.get('/download', function (req,res) {
    const url = './static/img/shortcut_QRcode.png'
    // const url = './main.js'
    const contentType = 'image/png'
    //设置请求的返回头type,content的type类型列表见上面
    res.setHeader("Content-Type", 'contentType');
    //格式必须为 binary 否则会出错
    var content =  fs.readFileSync(url,"binary");   
    res.writeHead(200, "Ok");
    res.write(content,"binary"); //格式必须为 binary，否则会出错
    res.end();
})

// 4.开始监听请求
app.listen(4000, ()=>{
    console.log('Server is running at http://localhost:4000')
})
// http.createServer(app).listen('4000')

module.exports = app;