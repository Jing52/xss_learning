# XSS的定义

攻击者利用网站漏洞把恶意的脚本代码（通常包括HTML代码和JavaScript脚本）注入到网页中，当其他用户浏览这些网页时，就会执行其中的恶意代码，对受害用户可能采取cookie窃取、会话劫持、钓鱼欺骗。

# XSS的攻击方式

## 反射型

发出请求时，XSS代码出现在URL中，作为输入提交到服务器端，服务器解析后响应，XSS代码随响应内容一起传回浏览器，最后浏览器解析执行XSS代码。这个过程像一次反射，故叫反射XSS。

### 举例

本例使用nodejs构建项目，演示反射型XSS攻击。

#### 创建目录

首先，我们先创建一个目录`xssfilter`并且进入该目录

```
$ mkdir xssfilter
$ cd xssfilter
```



在该目录继续创建一个目录`xss`，用于创建我们整个的XSS攻击的模拟服务。

```
$ mkdir xss
$ cd xss
```



![image](http://upload-images.jianshu.io/upload_images/14481291-fb49b88b1f52786f?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



#### 搭建web项目

使用[express](http://www.expressjs.com.cn/)框架快速搭建整个的应用服务

```
$ express -e ./
```



![image](http://upload-images.jianshu.io/upload_images/14481291-3654fb41d8de8689?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 依赖

安装一下所有的依赖

```
$ npm install
```



![image](http://upload-images.jianshu.io/upload_images/14481291-629ee17cfe35c080?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 目录结构

看一下目录结构

![image](http://upload-images.jianshu.io/upload_images/14481291-68b0efe84ee4d2c3?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 启动服务

```
$ npm start
```



![image](http://upload-images.jianshu.io/upload_images/14481291-edcc226a0899cef1?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



#### 页面

访问`localhost:3000`，看是否展示成功

![image](http://upload-images.jianshu.io/upload_images/14481291-2d75dba41350afa9?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 演示

接下来我们就要开始反射型XSS的演示了

##### js

```
xss:req.query.xss
```



![image](http://upload-images.jianshu.io/upload_images/14481291-7b2eda5466397e63?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

我们在此设置一个查询的字段来获取用户在URL中写的search内容

##### 视图层

```
<div class="">
	<%- xss%>
</div>
```

我们在视图层展示这个内容

![image](http://upload-images.jianshu.io/upload_images/14481291-4aa15915ee1405e9?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

接下来重启一下，查看一下带有值后展示的是啥样的

![image](http://upload-images.jianshu.io/upload_images/14481291-fbfa2e6e905895d3?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

由此，我们发现，值已经展示。

接下来，我们开始一些有攻击性的脚本

```
xss=<img src="null" onerror="alert(1);"/>
```

打开页面发现

![image](http://upload-images.jianshu.io/upload_images/14481291-821dfdfe37add220?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这是因为Chrome会自动拦截XSS攻击

我们设置下不让浏览器对XSS拦截

```
res.set('X-XSS-Protection',0);
```

![image](http://upload-images.jianshu.io/upload_images/14481291-d28e5222d10916fc?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

重启服务，打开浏览我们会看到XSS攻击成功

![image](http://upload-images.jianshu.io/upload_images/14481291-eed37d25bbb453ed?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

黑客会将一些攻击脚本在网页上通过引诱式点击植入广告、页面篡改等，典型的比如<iframe>



## 存储型

存储型XSS与反射型XSS的差别仅在于，提交的代码会存储到服务器端（内存，数据库，文件系统等），下次调用的时候就不需要再提交XSS代码。

存储型XSS只能读取缓存或者数据库了

![image](http://upload-images.jianshu.io/upload_images/14481291-654c3a641e51204c?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



# XSS的防范措施

## 编码

对用户输入的数据进行HTML Entity编码



![编码](http://upload-images.jianshu.io/upload_images/14481291-2c51bc6ec616300d?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



## 过滤

将用户输入的不安全的内容给过滤掉

比如：

移除用户上传的DOM属性，如onerror等

移除用户上传的Style节点、Script节点、Iframe节点等



## 校正

避免直接对HTML Entity解码

使用DOM Parse转换，校正不配对的DOM标签



# 实战

## 构造接口

通过构建Node服务和建立一个评论功能，实例演示XSS的攻击与预防。

如何构建Node服务我就不重复赘述了，在之前介绍反射型XSS中已经讲过，这边我依然使用这个服务来实战。

### 设定个缓存

```
var comments = {};
```



### 编写一个具有编码功能的函数

```
function html_encode(str){
	var result = "";
	if(str.length==0){
		return "";
	}
	result = str.replace(/&/g,"&gt;");
	result = result.replace(/</g,"&lt;");
	result = result.replace(/>/g,"&gt;");
	result = result.replace(/\s/g,"&nbsp;");
	result = result.replace(/\'/g,"&#39;");
	result = result.replace(/\"/g,"&quot;");
	result = result.replace(/\n/g,"</br>");
	return result;
};
```



### 定义一个评论的接口

```
router.get('/comment', function(req, res, next) {
	comments.v = html_encode(req.query.comment);
})
```



### 定义一个用户拉取评论的接口

```
router.get('/getComment', function(req, res, next) {
	res.json({
		comment:comments.v
	})
})
```

### ![image](http://upload-images.jianshu.io/upload_images/14481291-8e4816237218f338?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 防范措施

### ejs

```
<textarea name="name" rows="8" cols="80" id="text">
	<p>sks<img src="null" alt="" onerror="alert(1)" /></p>
</textarea>

<button type="button" name="button" id="btn">评论</button>
<button type="button" name="button" id="get">获取评论</button>
```

![image](http://upload-images.jianshu.io/upload_images/14481291-c8669e63f82d1dab?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

`<textarea>`用于用户输入区域

`<button>`用于提交评论和拉取评论信息

通过这样，我们就实现了一个模拟的XSS攻击



### js

#### 获取对象

```
var btn = document.getElementById("btn");
var get = document.getElementById("get");
var txt = document.getElementById("text");
```

#### 添加评论点击事件

```
btn.addEventListener("click",function(){
	......
}
```



##### ajax请求

```
var xhr = new XMLHttpRequest();
```

##### url

```
var url = '/comment?comment='+txt.value;
```

因为是get请求

##### 打开对象

在客户端向服务端发送之前，首先打开对象，告诉对象是以`GET`方式打开

```
xhr.open('GET',url,true);
```

##### 定义对象在客户端响应的方式

```
xhr.onreadystatechange = function(){
    if(xhr.readyState==4){
        if(xhr.status==200){
        	console.log(xhr);
        }else{
        	console.log("error");
        }
    }
}
```

##### 发送

```
xhr.send();
```

![image](http://upload-images.jianshu.io/upload_images/14481291-16bf216cf1318016?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 添加请求评论点击事件

```
get.addEventListener("click",function(){
	......
}
```

##### ajax请求

```
var xhr = new XMLHttpRequest();
```

##### url

```
var url = '/getComment';
```

因为是get请求

##### 打开对象

在客户端向服务端发送之前，首先打开对象，告诉对象是以`GET`方式打开

```
xhr.open('GET',url,true);
```

##### 定义对象在客户端响应的方式

- 导入js

  ```
  <script src='/public/javascripts/encode.js'></script>
  <script src='/public/javascripts/domParse.js'></script>
  ```

  自行去第三方库下载

- 定义一个函数

  ```
  var prase = function(str){
  	var results = '';
  	try{
  		
  	}catch(e){
  		//TODO handle the exception
  	}finally{
  
  	}
  }
  ```

- 解码

  ```
  HTMLParse(he.unescape(str,{strict:true}),{});
  ```

  `he`是`encode.js`提供的

  `unescape()`对输入一种反转义的过程

  `HTMLParse()`在反转义的基础上进行domParse，获得我们能正常使用的结果

- 配对校验

  ```
  start:function(tag,attrs,unary){//tag:标签；attrs:将属性组成数组；unary:是否是单标签
  	results += '<'+tag;
  	for(int i=0,len=attrs.length;i<len;i++){
  		results += " "+attrs[i].name+'="'+attrs[i].escaped+'"';
  	}
  	results += (unary?"/";"")+">";
  	},
  end:function(tag){
  	results += "</"+tag+">";
  },
  chars:function(text){
  	results += text;
  },
  comment:function(text){//注释
  	results += "<!--"+text+"-->"
  }
  ```

  查看一下完整代码

  ```
  <script type="text/javascript">
  	var prase = function(str){
  	var results = '';
  	try{
  		HTMLParse(he.unescape(str,{strict:true}),{
  			start:function(tag,attrs,unary){//tag:标签；attrs:将属性组成数组；unary:是否是单标签
  				results += '<'+tag;
  				for(int i=0,len=attrs.length;i<len;i++){
  					results += " "+attrs[i].name+'="'+attrs[i].escaped+'"';
  				}
  				results += (unary?"/";"")+">";
  			},
  			end:function(tag){
              	results += "</"+tag+">";
              },
              chars:function(text){
              	results += text;
              },
              comment:function(text){//注释
              	results += "<!--"+text+"-->"
              }
          });
          return results;
      }catch(e){
      	console.log(e);
      }finally{
  
  	}
  }
  </script>
  ```

  ![image](http://upload-images.jianshu.io/upload_images/14481291-9aab26ae81e21537?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

- 定义对象客户端响应方式

  ```
  xhr.onreadystatechange = function(){
      if(xhr.readyState==4){
          if(xhr.status==200){
          	var com = prase(JSON.parse(xhr.response).comment);
          }else{
          	console.log("error");
          }
      }
  }
  ```


##### 发送

```
xhr.send();
```

#### 过滤、校正

##### 把获取的com转换成DOM节点

```
var info = document.createElement('span');
info.innerHTML(com);
document.body.appendChild(info);
```

重启一下，打开浏览器

![](https://upload-images.jianshu.io/upload_images/14481291-a82d8e777ea11e2d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击评论，然后再点击获取评论，来模拟浏览器加载服务端评论内容的行为

![image.png](https://upload-images.jianshu.io/upload_images/14481291-54a6a3c8e9e9e213.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看下怎么执行的

这边有`p`标签、`sks`文本、`img`标签，在`img`标签里，有个`src`属性，为<font color='red'>null</font>，看下控制台,报错：`Failed to load resource`，因此触发了`onerror`属性。

![image.png](https://upload-images.jianshu.io/upload_images/14481291-74f3de677cfa7eb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

##### 引诱式攻击

![image.png](https://upload-images.jianshu.io/upload_images/14481291-acb0238af381d5d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击评论，再点击获取评论

![image.png](https://upload-images.jianshu.io/upload_images/14481291-9b9a0c98da967660.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

点击`攻击我`

![image.png](https://upload-images.jianshu.io/upload_images/14481291-b310acd9d90854c8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这就是引诱式攻击

到此，我们发现，并没有屏蔽掉XSS攻击，那是因为我们并没有进行过滤

##### 过滤

```
if(tag=='script'||tag=='style'||tag=='link'||tag=='iframe'||tag=='frame'){
	return;
}
```

这个就是去过滤这些标签

把之前的代码删掉，因为这段代码就包含了那些含有XSS攻击的脚本，从而保证我们获取信息的安全性，避免XSS脚本执行的空间。

```
for(int i=0,len=attrs.length;i<len;i++){
	results += " "+attrs[i].name+'="'+attrs[i].escaped+'"';  						
}
```

打开浏览器，重新操作，发现已经成功拦截了XSS攻击，看下控制台，我们发现`img`标签下的属性被自动过滤掉了。

![image.png](https://upload-images.jianshu.io/upload_images/14481291-4ea3b6f128671e5e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



