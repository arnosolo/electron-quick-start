const express = require('express');
const clipboardy = require('clipboardy');
const bodyParser = require('body-parser');
const formidable = require("formidable")
// const images = require("images")
const fs = require("fs")
const os = require('os')
const path = require('path')
const { Notification, shell, clipboard, nativeImage } = require('electron')

// 1.创建express对象
const app = express();

// 2.加载插件
// 在Express 中没有内置获取表单POST请求体的API,使用这个插件使其能够解析POST内容
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

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
      title: '消息 --> 剪切板',
      body: `${msg}`,
      icon: path.join(__dirname,'./static/img/clipboard.png'),
    })
    notification.show()
    // 提取消息中的网址
    const urlArray = msg.match(/((https?:\/\/)+[\w-]+(\.[\w-]+)+\.?(:\d+)?(\/\S*)?)/g);
    console.log('urlArray:',urlArray);
    // 点击通知打开网页
    notification.on('click' , () => {
      shell.openExternal(urlArray[0])
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
    //   console.log(files);
      for (let key in files) {
        let file = files[key]
        // 过滤空文件
        if (file.size == 0 && file.name == '') continue

        // 保存文件到Pictures文件夹
        const fileName = file.name.split('.')[0]
        const fileType = file.name.split('.')[1]
        const oldPath = file.path
        const newPath = homedir + '\\Pictures\\' + fileName + '_' + Date.now() + '.' + fileType
        // fs.rename 是移动文件
        // fs.rename(oldPath, newPath, (error) => {
        //     if (error) throw error
        //     console.log('File received:', file.name);
        // })
        var readStream = fs.createReadStream(oldPath)
        var writeStream = fs.createWriteStream(newPath)
        readStream.pipe(writeStream)
        
        // 将图片添加到剪切板
        const image = nativeImage.createFromPath(file.path)
        clipboard.writeImage(image)
        // fs.readFile(file.path, (err, data) => {
        //   const image = nativeImage.createFromBuffer(data)
        //   clipboard.writeImage(image)
        // })

        // 显示系统通知
        const notification = new Notification({
            title: '文件 --> Pictures文件夹',
            body: `${file.name}`,
            icon: path.join(__dirname,'./static/img/clipboard.png'),
        })
        notification.show()
        // 点击通知跳转到资源管理器
        notification.on('click' , () => {
            shell.showItemInFolder(newPath)
            console.log('Notification clicked:', file.name)
        })
    }
    
    res.send({code:1, msg:'File transfer success.'})
  })
});
  
// 4.开始监听请求
app.listen(4000, ()=>{
    console.log('Server is running at http://localhost:4000')
})

module.exports = app;