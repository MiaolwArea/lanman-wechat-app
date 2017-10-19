//index.js
//获取应用实例
let app = getApp()
import { pageAction } from '../../utils/util'

// let goodsListUrl = '/wechatapp/goods/list' 
let goodsListUrl = 'hotGoods' 

let pageConfig = {
  data: {
    hotGoods: [],
    noMore: "false",
    moveSearch: "false"
  },
  onReachBottom: function () {
    wx.showLoading({
      title: "加载中"
    });
    this.getHotGoods();
  },
  onPageScroll: function (e) {
    var _this = this;

    _this.setData({
      moveSearch: e.scrollTop >= 94 ? "true" : "false"
    })
  },
  onLoad: function () {
    let _this = this;
    
    _this.getHotGoods();
  },
  // 自定义事件
  getHotGoods: function () {
    let _this = this;

    app.ApiConfig.ajax(goodsListUrl, function (res) {
      if (res.success) {
        _this.setData({
          hotGoods: _this.data.hotGoods.concat(res.data)
        })
      } else {
        _this.setData({
          noMore: "true"
        })
      }
      wx.hideLoading();
    });
  },
}

// 合并公共配置
pageConfig = {...pageConfig, ...pageAction({
  url: '/pages/index/index'
})};

Page(pageConfig)
