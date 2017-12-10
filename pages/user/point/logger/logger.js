// logger.js
var app = getApp()
import { formatTime } from '../../../../utils/util'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 1,
    loggerInfo: null,
    loggerList: []
  },
  // 数据缓存区
  store: {
    url: {
      // 积分详情
      loggerUrl: app.globalData.isDebug ? 'loggerUrl' : '/wechatapp/point/log',
    },
    loadMore: false,
    count: 10,
    page: 1,
    noMore: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;

    _this._getLoggerInfo(1);
  },
  _getLoggerInfo(typeNum) {
    let _this = this;

    wx.showLoading();
    app.ApiConfig.ajax(_this.store['url'].loggerUrl +
      '?type=' + typeNum + '&page=' + _this.store['page'] + '&count=' + _this.store['count'], function (res) {
        if (res.success) {
          let list = res.data.list;

          if (res.data.info){
            _this.setData({
              loggerInfo: res.data.info
            });
          }
          if (res.data.list) {
            for (let i = 0; i < list.length; i++) {
              list[i].add_time = formatTime(list[i].add_time);
            };
            _this.setData({
              loggerList: _this.data.loggerList.concat(list)
            });
            _this.store['page']++;
          }else{
            _this.store['noMore'] = true;
          }
          
          wx.hideLoading();
        }
      })
  },
  // 标签切换
  swichTab(e) {
    let _this = this
      , Ecurrent = e.target.dataset.current;

    if (_this.data.currentTab === Ecurrent) {
      return false;
    } else {
      _this.setData({
        currentTab: Ecurrent,
        loggerList: []
      });
      _this.store['page'] = 1;
      _this._getLoggerInfo(Ecurrent);
    }
  },
  // 到底自动加载
  onReachBottom: function () {
    if (!this.store['noMore']) {
      wx.showLoading({
        title: "加载中"
      });
      this._getLoggerInfo(this.data.currentTab);
    }
  },
})