const express = require('express');
const bodyParser = require('body-parser');
const formidable = require("formidable")
var logger = require('morgan');
const fs = require("fs")
const os = require('os')
const path = require('path')
const { Notification, shell, clipboard, nativeImage } = require('electron')

const util = require('./utils/util')
const Store = require('./utils/Store')

// step1.创建express对象
const app = express();

// 创建配置文件读写对象
const store = new Store({
  configName: 'user-preferences',
  defaults: {
    imgClipSize: 1000, // 剪切板图片最大尺寸
    // savePath: '\\Pictures\\' // 保存路径
    savePath: '/Pictures/' // 保存路径 使用path.join可以解决win的路径分隔符为\的问题
  }
});

// step2.加载插件
// 在Express 中没有内置获取表单POST请求体的API,使用这个插件使其能够解析POST内容
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(logger('dev'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine( '.html', require( 'ejs' ).__express );

// step3.决定如何响应请求
/* 渲染网页端 */
app.get('/', (req, res)=>{
    res.render('index', { title: ''});
})

/* 处理发来的消息 */
app.post('/msg', function (req, res) {
    const { msg } = req.body
    clipboard.writeText(msg)
    
    // 显示系统通知
    const notification = new Notification({
      title: 'Text --> Clipboard',
      body: `${msg}`,
      icon: path.join(__dirname,'./static/img/clipboard.png'),
    })
    // 如果包含网址,点击可打开
    const urlArray = msg.match(/((https?:\/\/)+[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/g)
    notification.on('click' , () => {
      if(urlArray != null){
        // notification.body = `click me to open the webpage ${msg}`
        shell.openExternal(urlArray[0])
      }
    })

    notification.show()

    console.log('Msg received:', msg); 
    res.send({code:1, msg:'success'})
})

/* 处理发来的文件 */
app.post('/upload', function (req, res) {
  // 获取用户信息
  var { homedir } = os.userInfo()
  
  // 1.解析表单
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) throw err
    for (let key in files) {
      let file = files[key]
        console.log('Incoming file:', file.name);
        // 过滤空文件
        if (file.size == 0 && file.name == '') continue

        /* 2.保存文件到指定文件夹 */
        const fileName = file.name.split('.')[0]
        const fileType = file.name.split('.')[1]
        const oldPath = file.path
        // let newPath = homedir + '\\Pictures\\'
        const savePath = store.get('savePath')
        // let newPath = homedir + savePath
        let newPath = path.join(homedir, savePath)
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

          /* 
            3.保存文件后
              3.1 将图片添加到剪切板
              3.2 发送一条系统通知
              3.3 删除临时文件 */
          if (!had_error) {
            console.log('File saved: ', file.name);

            // 将图片添加到剪切板
            let receivedImage = nativeImage.createFromPath(newPath)
            let imgClip = {}
            const imgClipSize = store.get('imgClipSize')*1 // 读取用户配置
            const resizeImg = (image, size) => {
              const {width, height} = image.getSize()
              return (width > height) ? image.resize({width:size}) : image.resize({height:size})
            }
            switch(fileType) {
              case 'jpeg':
                imgClip = resizeImg(receivedImage, imgClipSize)
                break;
              case 'jpg':
                imgClip = resizeImg(receivedImage, imgClipSize)
                break;
              default:
                imgClip = image
            }
            clipboard.writeImage(imgClip)

            // 显示系统通知
            const notification = new Notification({
              title: 'File --> Picture folder',
              body: `click me to open ${file.name}`,
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
    const url = './static/img/alipay_qrcode.jpeg'
    // 格式必须为 binary 否则会出错
    var content =  fs.readFileSync(url,"binary");
    res.writeHead(200, "Ok");
    res.write(content,"binary"); //格式必须为 binary，否则会出错
    res.end();
})

// step4.开始监听请求
app.listen(4000, ()=>{
    console.log('Server is running at http://localhost:4000')
})
// http.createServer(app).listen('4000')

module.exports = app;