let API_HOST = "https://api.lanman.cn/";
let DEBUG = false;

let Mock = require('../mock/mockData.js');

let headerParam = null; 

function setHeader(param) {
  if (typeof param === 'object') {
    headerParam = param;
  }
}
function ajax() {
  if (typeof arguments[1] === 'function') {
    Array.prototype.splice.call(arguments, 1, 0, {})
  }
  let url = arguments[0];
  let data = arguments[1];
  let fn = arguments[2];
  let method = arguments[3] || 'get';
  let header = arguments[4] || headerParam || null;
  
  // 格式化POST数据
  (function(){
    Object.keys(data).forEach(item => {
      if (typeof data[item] === 'object'){
        data[item] = JSON.stringify(data[item])
      }
    });
  })()
  
  if (!DEBUG) {
    wx.request({
      url: API_HOST + url,
      method: method ? method : 'get',
      data: data,
      header: { "Content-Type": "application/x-www-form-urlencoded", ...header },
      success: function (res) {
        fn(res.data);
      }
    });
  } else {
    // 模拟数据
    url = url.split('?')[0];
    let res = {
      success: 1,
      msg: "请求成功",
      errno: 0,
      data: Mock[url]
    }
    fn(res);
  }
}

module.exports = {
  ajax: ajax,
  setHeader: setHeader
}