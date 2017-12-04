// 转发分享
export const pageAction = (data) => {
  let title = data.title || '烂熳口红';
  let url = data.url || '/pages/index/index';

  return {
    onShareAppMessage: function (res) {
      if (res.from === 'button') {
        // 来自页面内转发按钮
        console.log(res.target)
      }
      return {
        title: title,
        path: url,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    }
  }
}
// 追加地址栏参数信息
export const appendParamForUrl = (url, param) => {
  
  Object.keys(url).forEach(attr => {
    let count = 0;

    Object.keys(param).forEach(item => {
      if (count == 0){
        url[attr] = `${url[attr]}?${item}=${param[item]}`;
      }else{
        url[attr] = `${url[attr]}&${item}=${param[item]}`;
      }
      count++;
    });
  });
  return url;
}
// 格式化时间戳
export const formatTime = (time, format = 'yyyy-MM-dd') => {
  if (/^[0-9]*$/.test(time) == false) {
    return time;
  }

  let date = new Date(parseInt(time) * 1000);

  function padLeftZero(str) {
    return ('00' + str).substr(str.length);
  }
  if (/(y+)/.test(format)) {
    format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  let o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'h+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds()
  };
  for (let k in o) {
    if (new RegExp(`(${k})`).test(format)) {
      let str = o[k] + '';
      format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str));
    }
  }

  return format;
}
// json型数组删除指定元素
export const delElm = (pos, ary) => {
  if(typeof pos === 'object'){
    let key = null
      , val = null
      , index = 0;

    for (var item in pos){
      key = item;
      val = pos[item];
    }
    for (let i = 0; i < ary.length; i++) {
      if (ary[i][key] == val){
        index = i;
        break;
      }
    }
    
    ary.splice(index, 1);
    return ary;
  } else if (typeof pos === 'number') {
    ary.splice(pos, 1);
    return ary;
  }
}
// 格式化小数目
export const formatNum = (num, len) => {
  let floatNum = parseFloat(num)
    , lenn = len || 2
    , i = lenn
    , lenNum = 1;

  while (i--){
    lenNum *= 10;
  }
  if (floatNum == undefined || floatNum == null || lenn < 0) {
    return false;
  }
  let floatNumN = Math.round(floatNum * lenNum) / lenNum
    , floatNumS = floatNumN.toString()
    , point = floatNumS.indexOf('.');

  if (point < 0) {
    point = floatNumS.length;
    floatNumS += '.';
  }
  while (floatNumS.length <= point + lenn) {
    floatNumS += '0';
  }
  return floatNumS;    
}
