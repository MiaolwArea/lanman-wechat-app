// comment.js
// 获取应用实例
var app = getApp();

let pageConfig = {
  data: {
    goodList: null,
    chooseIndex: 5,
    thoughtWord: '非常好',
    imageList: []
  },
  // 数据缓存区
  store: {
    url: {
      // 订单详情
      orderDetailUrl: app.globalData.isDebug ? 'orderDetail' : '/wechatapp/order/detail',
      // 资源上传
      uploadUrl: app.globalData.isDebug ? 'uploadUrl' : '/wechatapp/media/upload',
    },
    orderId: '',
    thought: {
      1: '很差',
      2: '差',
      3: '一般',
      4: '好',
      5: '非常好',
    }
  },
  onLoad: function (opt) {
    let _this = this;

    _this.store['orderId'] = opt.order_id;
    // 获取初始化数据 
    app.ApiConfig.ajax(_this.store['url'].orderDetailUrl + '?order_id=' + _this.store['orderId'], function (res) {
      if (res.success) {
        _this.setData({
          goodList: res.data.goods
        });
      }
    });
  },
  // 打分
  chooseStar(e){
    let _this = this
      , index = e.target.dataset.index;
    
    _this.setData({
      chooseIndex: index - 1,
      thoughtWord: _this.store['thought'][index]
    });
  }, 
  chooseImg() {
    let _this = this;

    wx.chooseImage({
      sizeType: ['original', 'compressed'],  
      sourceType: ['album', 'camera'], 
      success: function (res) {
        let tempFilePaths = res.tempFilePaths;
        
        if ((tempFilePaths.length + _this.data.imageList.length) > 9){
          wx.showToast({
            title: '不能超过9张',
            icon: 'loading',
            duration: 1000
          })
          return;
        }
        wx.uploadFile({
          url: 'https://api.lanman.cn/wechatapp/media/upload', 
          filePath: tempFilePaths[0],
          header: {
            sso: app.globalData.sso,
            token: app.globalData.token,
          },
          name: 'media',
          success: function (res) {
            var data = res.data;
            console.log(res)
            //do something
          }
        })
        _this.setData({
          imageList: _this.data.imageList.concat(tempFilePaths),
        })
      }
    }) 
  },
  // 预览图片
  // previewImage(e) {
  //   let imgsUrl = e.target.dataset.imgs;
    
  //   wx.previewImage({
  //     urls: imgsUrl
  //   })
  // },
  delImage(e){
    wx.showModal({
      content: '确定删除？',
      cancelColor: '#808080',
      confirmColor: '#000',
      success: function (res) {
        if (res.confirm) {
          // doding
        }
      },
    })
  }
}

Page(pageConfig)
