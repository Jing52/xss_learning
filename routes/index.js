var express = require('express');
var router = express.Router();

var comments = {};//设定个缓存

//编写一个具有编码功能的函数
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

/* GET home page. */
router.get('/', function(req, res, next) {
	res.set('X-XSS-Protection',0);
  	res.render('index', { title: 'Express'});
});

//定义一个评论的接口
router.get('/comment', function(req, res, next) {
	comments.v = html_encode(req.query.comment);
})

//定义用户拉取评论的接口
router.get('/getComment', function(req, res, next) {
	res.json({
		comment:comments.v
	})
})

module.exports = router;
