//index.js
//获取应用实例
let app = getApp()
import { pageAction } from '../../utils/util'

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

    app.ApiConfig.ajax('hotGoods', function (res) {
      if (res) {
        _this.setData({
          hotGoods: _this.data.hotGoods.concat(res)
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
