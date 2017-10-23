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