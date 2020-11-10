#### 介绍

​	一键发送iPhone 截屏 网址 剪切板 到Windows剪切板. 安装包可以在[演示地址](https://www.bilibili.com/video/BV1rv41167ye/)评论区找到.

<iframe src="//player.bilibili.com/player.html?aid=245105772&bvid=BV1rv41167ye&cid=250627595&page=1" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

##### 实现原理

​	使用Express开启一个http服务器,监听局域网内的POST请求.

##### 使用

* 下载依赖

  ```shell
  npm install
  ```

* 开始项目

  ```shell
  npm start
  ```

* 打包成桌面应用

  ```shell
  npm run make
  ```



#### 代办事项
* 想法
  * 思考一下有没有必要做成云剪切板
  * 思考一下是否需要端对端加密
  * 思考一下如何向iPhone发送文件
* 在配置文件中保存用户设置
* 发送网页时,同时附带已经阅读到的位置






#### 更新日志
##### 20201101
* 解决 桌面端点击通知可能不跳转到资源管理器的问题
* 解决 iPhone拍摄的照片无法复制到剪切板

##### 20201030 

* 添加了一点点样式
* 如果通知中有网页, 点击通知可以打开网页.
