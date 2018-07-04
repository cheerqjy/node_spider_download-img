var ejs=require("ejs");
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var request = require('request');
var fs = require('fs');
var express=require('express');//引入模块
var cheerio=require('cheerio');
var superagent=require('superagent');
var async = require("async");//处理异步


var app=express();

// ejs页面
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html',ejs.__express);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 存放爬到的数据 的数组
var arr=[];

app.get('/',function(req,res,next){
    superagent.get('http://www.123rf.com.cn/%E5%85%8D%E7%89%88%E7%A8%8E%E5%9B%BE%E7%89%87/%E8%81%9A%E4%BC%9A.html')//请求页面地址
        .end(function(err,sres){//页面获取到的数据
            if(err) return next(err);
            console.log(sres.text,999)
            var $=cheerio.load(sres.text);//用cheerio解析页面数据


            // 下面就是通过cheerio去找html网页中的数据，并存放到arr中
            $(".searchpage-gallery .gallery-item-thumb-content").each(function(index,element){
                console.log(element)
                var $eleItem=$(element).find('.uitooltip');
                arr.push(
                    {
                        href: $eleItem.attr('src'),
                        filename:$eleItem.attr('filename')
                    }
                );
            });
            console.log(arr)
            // 通过ejs 返回给前台页面
            res.render('index',{arr:arr});
        })
});

// 对应前台页面的下载功能
app.get('/download.do',function(req,res){
    let results=arr.splice(0,90)
    async.each(results,function iteratee(item, callback){
        // 获取图片地址
        var urls = item.href;
        // 获取图片名字
        var objName = item.filename+'.jpg';
        console.log(urls,999)
        // 构建目标路径，到项目根目录下新建uploads文件夹，用来存放下载的图片
        var basePath = './uploads/';  
        var targetPath = basePath+ "/tmp"; 
        // 下载图片 
        download(urls,basePath, objName);    
    })
})

// 图片下载函数
// uri：图片网络地址
// dir：目标路径
// filename：图片名字
function download(uri, dir,filename){  
    request.head(uri, function(err, res, body){  
        request(uri).pipe(fs.createWriteStream(dir + "/" + filename));  
    });  
}; 

app.listen(8888, function () {
    console.log('抓取成功~~~');
});