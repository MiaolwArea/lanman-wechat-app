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