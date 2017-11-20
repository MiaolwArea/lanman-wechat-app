// goodsList.js
// 获取应用实例
let app = getApp()
import { pageAction, appendParamForUrl } from '../../utils/util'

let pageConfig = {
  data: {
    goodsList: []
  },
  // 数据缓存区
  store: {
    url: {
      // 商品列表
      goodsListUrl: app.globalData.isDebug ? 'goodsList' : '/wechatapp/goods/list'
    },
    seriesId: null,
    pageNum: 1,
    noMore: false,
    count: 10
  },
  onLoad: function (opt) {
    let _this = this;
    
    _this.store['seriesId'] = opt.series_id;
    // 地址参数处理
    appendParamForUrl(_this.store['url'], {
      sso: app.globalData.sso
    });
    // 商品详情
    this._getGoodsList();
  },
  onReachBottom: function () {
    if (!this.store['noMore']){
      wx.showLoading({
        title: "加载中"
      });
      this.store['pageNum']++;
      this._getGoodsList();
    }
  },
  _getGoodsList(){
    let _this = this;

    app.ApiConfig.ajax(_this.store['url'].goodsListUrl + '&page=' + _this.store['pageNum'] + '&count=' + _this.store['count'] + '&series_id=' + _this.store['seriesId'], function (res) {
      if (res.success) {
        if (res.data.length != 0) {
          _this.setData({
            goodsList: _this.data.goodsList.concat(res.data)
          })
        }else{
          _this.store['noMore'] = true;
        }
        wx.hideLoading();
      }
    });
  }
}
// 合并公共配置
pageConfig = {
  ...pageConfig, ...pageAction({
    url: '/pages/goods/list'
  })
};

Page(pageConfig)
