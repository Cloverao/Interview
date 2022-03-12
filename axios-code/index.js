
// const axios1 = require('axios');
//axios实现
function Axios(config){
	this.defaults = config;
	this.interceptors = {
		request:new InterceptorManager(),
		response:new InterceptorManager()
	}
}

/**
 * 支持直接配置url的方式或者是axios(url,{})方式
 * axios(url)
 * axios(url,config)
 */
//axios-core请求函数
Axios.prototype.request = function(configOrUrl,config){
	if(typeof configOrUrl === "string"){
		config = config || {}
		config.url = configOrUrl
	}else{
		config = configOrUrl || {}
	}
	//合并配置项
	config = Object.assign(this.defaults,config)	
	if(config.method){
		config.method = config.method.toLowerCase()
	}else if(this.defaults.method){
		config.method = this.defaults.method.toLowerCase();
	}else {
		config.method = 'get';
	}
	//拦截器处理
	var promise = dispatchRequest(config)
}

function dispatchRequest(config){
	if(!config) return new Error('没有请求配置')
	config.headers = config.headers || {};
	config.data = config.data;
	utils.forEach(
	    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
	    function(method) {
	      delete config.headers[method];
	    }
	  );
	  var adapter = config.adapter || defaults.adapter;
	  return adapter(config).then(function(response){
		  return response
	  },function(reason){
		  return Promise.reject(reason)
	  })
}

//默认配置项
var defaults = {
	adapter:getDefaultAdapter(),
	 timeout: 0,
	 baseURL:"",
	 method:'get'
}

//区分不同环境适配器
function getDefaultAdapter(){
	var adapter;
	if(typeof XMLHttpRequest !== 'undefined'){
		adapter = xhrAdapter
	}else{
		// adapter =
	}
	return adapter
}

//xhr适配器
function xhrAdapter(config){
	return new Promise(function(resolve,reject){
		var requestData = config.data;
		var requestHeaders = config.headers;
		    var responseType = config.responseType;
			function done() {
			      if (config.cancelToken) {
			        config.cancelToken.unsubscribe(onCanceled);
			      }
			
			      if (config.signal) {
			        config.signal.removeEventListener("abort", onCanceled);
			      }
			    }
		var request = new XMLHttpRequest();
		var fullPath = buildFullPath(config.baseURL,config.url);
		// var parsed = config.url.parse(fullPath)
		//初始化一个请求，该方法只能在js代码中使用，原生代码中需要使用openRequest()方法
		request.open(config.method.toUpperCase(),buildURL(fullPath,config.params,config.paramsSerializer))
		request.timeout = config.teimeout;
		function onloadend(){
			if(!request){
				return
			}
			 var responseData =
			        !responseType || responseType === "text" || responseType === "json"
			          ? request.responseText
			          : request.response;
			var response = {
				data:responseData,
				status:request.status,
				statusText:request.statusText,
				config: config,
				request: request,
			}
			settle(
			        function _resolve(value) {
			          resolve(value);
			          done();
			        },
			        function _reject(err) {
			          reject(err);
			          done();
			        },
			        response
			      );
			request = null
		}
		  // 重写onload函数
		if('onloadend' in request){
			request.onloadend = onloadend
		}else{
			//使用默认处理方法readystatechange改变时的回调函数
			//readyState == 4表示已经发送请求，服务器已完成返回相应，浏览器已完成了下载响应内容
			request.onreadystatechange = function(){
				if(!request || request.readyState !==4){
					return
				}
				if(request.status === 0 && !request.responseURL){
					return
				}
				//处理错误信息
				setTimeout(onloadend,1000)
			}
		}
		//取消请求
		request.onabort = function(){
			if(!request){
				return
			}
			reject(new Error('Request aborted'+request))
			request = null
		}
		//请求报错
		request.onerror = function(){
			reject(new Error(  "Network Error"+request))
			reject = null
		}
		//请求超时处理
		// request.ontimeout = function(){
		// 	var timeoutErrorMessage = '请求超时'
		// 	if(config.timeoutErrorMessage){
		// 		timeoutErrorMessage = config.timeoutErrorMessage;
		// 	}
		// 	reject(new Error(timeoutErrorMessage))
		// 	request = null
		// }
		//处理请求头信息
		// if("setRequestHeader" in request){
		// 	utils.forEach(requestHeaders,function(val,key){
		// 		if(typeof requestData === 'undefined' && key.toLowerCase() ==='content-type'){
		// 			delete requestHeaders[key]
		// 		}else{
		// 			request.setRequestHeader(key, val);
		// 		}
		// 	})
		// }
		//一些其他处理信息
		if (!requestData) {
		    requestData = null;
		}
		// if(parsed.path === null){
		// 	reject(new Error('无效的请求地址'))
		// }
	
		request.send(requestData);
	})
}


function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!response.status || !validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(new AxiosError(
      'Request failed with status code ' + response.status,
      [AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
      response.config,
      response.request,
      response
    ));
  }
}
//构建请求地址
function  buildFullPath(baseURL,requestURL){
	return requestURL
	    ? baseURL.replace(/\/+$/, '') + '/' + requestURL.replace(/^\/+/, '')
	    : baseURL;
	
}
/**
 * axios.create(baseURL,paramsSerializer:(params)=>qs.stringify(params,{indices:false }))
 * */
//序列化参数信息
function buildURL(url,params,paramsSerializer){
	if(!params){
		return url
	}
	var serializedParams ;
	if(paramsSerializer){
		// 自定义的格式化方法
		serializedParams = paramsSerializer(params)
	}else if(toString.call(val) === "[object URLSearchParams]"){
		// 是否是查询参数->生成一段encode后的字符串
		serializedParams = params.toString();
	}else{
		//由默认程序帮你处理参数信息
		var parts = [];
		utils.forEach(params,function(val,key){
			if(val === null || val === 'undefined'){
				return
			}
			if(Array.isArray(val)){
				key = key + "[]";
			}else{
				val = [val];
			}
			utils.forEach(val,function(v){
				if(toString.call(val) === "[object Date]"){
					v = v.toISOString();
				}else if(toString.call(val) === "[object Object]"){
					v = JSON.stringify(v);
				}
			})
			parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(v));
		})
	}
	if(serializedParams){
		var hashmarkIndex = url.indexOf("#");
		if(hashmarkIndex !== -1){
			url = url.slice(0,hashmarkIndex)
		}
		url += (url.indexOf('?') ? '?' : '&')+serializedParams
	}
	
}

const utils = {
	forEach:function(obj,fn){
		if(obj === null || typeof obj === 'undefined'){
			return
		}
	}
}
//拦截器处理函数
function InterceptorManager(){
	this.handles = []
}
/**
 * 用法：axios.interceptors.request.use(function(use){
	 //requerst拦截器处理代码
 })
 * */
//注册use函数
InterceptorManager.prototype.use = function use(){}


/**
 * 使用自定义配置新建一个axios实例
 * axios.create({})
 */
//创建axios实例 
function createInstance(defaultConfig){
	var context = new Axios(defaultConfig);
	var instance = Axios.prototype.request.bind(context);
	//如果本身Instance有属性，合并属性
	instance.create = function(instanceConfig){
		return createInstance(Object.assign(defaultConfig,instanceConfig))
	}
	return instance
}

// 




// axios.interceptors.request.use(resolveFn1, rejectFn2); // 添加请求拦截器
// axios.interceptors.response.use(resolveFn2, rejectFn2); // 添加响应拦截器
// axios1.get('/get').then((res) => {
//     // 请求成功的处理
// 	console.log(res)
//   }, (err) => {
//     // 请求异常的处理
// 	console.log(err)
//   }
// );
//怎么使用node模拟 一个请求？
//Q：为什么不直接返回axios，要用一个创建实例的方法来返回呢？
/**A:因为axios内部调用的都是Axios.prototype.request方法，Axios.prototype.request默认请求为get，为了让开发这可以直接调用axios()就可以发送请求，而不是axios.get()。如果直接new一个axios对象是无法实现这种简写的。
https://blog.csdn.net/weixin_34408717/article/details/91363383
*/
//Q：xhrAdapter这边的config参数是从哪儿获取的？
//是在dispatchRequest时将配置信息传进去的
//request.open(method,url,async,user,password)
//Q:readyState 的几种状态代表什么？
/**
 * 0:代理被创建，但尚未调用open方法
 * 1：open方法被调用
 * 2：send方法被调用，并且头部喝状态已经可获得
 * 3：loading，下载中，responseText 属性已经包含部分数据
 * 4：done下载操作完成
 * */
 
 //request.state
 /**
  * 0：未发送 UNSENT
  * 0：已打开 OPENED
  * 200：LOADING
  * 200: DONE
  * */