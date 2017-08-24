let API_HOST = "";
let DEBUG = true;

var Mock = require('../mock/mockData.js')

function ajax(data = '', fn, method = "get", header = {}) {
  if (!DEBUG) {
    wx.request({
      url: config.API_HOST + data,
      method: method ? method : 'get',
      data: {},
      header: header ? header : { "Content-Type": "application/json" },
      success: function (res) {
        fn(res);
      }
    });
  } else {
    // 模拟数据
    var res = Mock[data];
    fn(res);
  }
}

module.exports = {
  ajax: ajax
}