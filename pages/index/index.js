// index.js
// 获取应用实例
let app = getApp()
import { pageAction } from '../../utils/util'

// 私有属性
let pageOfSeries = 1,
    pageOfGoods = 1,
    count = 5;

let pageConfig = {
  data: {
    homeInfos: [],
    series: [],
    goodsList: [],
    moveSearch: false,
    countNum: 4,
    numOfNow: 2,
    showSaerch: false,
    searchFocus: true,
    isPlay: false
  },
  // 数据缓存区
  store: {
    url: {
      // 商品列表
      homeUrl: app.globalData.isDebug ? 'homeUrl' : '/wechatapp/index/index', 
      // 商品搜索
      goodsListUrl: app.globalData.isDebug ? 'homeUrl' : '/wechatapp/goods/list' 
    },
    loadMoreOfSeries: false,
    noMoreOfSeries: false,
    noMoreOfGoods: false,
    keyword: '',
    model: {
      '414': 580,
      '375': 530
    },
    topNum: 530
  },
  onReachBottom: function () {
    if (this.data.showSaerch){
      if (!this.store['noMoreOfGoods']) {
        wx.showLoading({
          title: "加载中"
        });
        this._getGoodsList();
      }
    }else{
      if (!this.store['noMoreOfSeries']) {
        wx.showLoading({
          title: "加载中"
        });
        this.store['loadMoreOfSeries'] = true;
        this._getHomeInfos();
      }
    }
  },
  onPageScroll: function (e) {
    var _this = this;
    
    _this.setData({
      moveSearch: e.scrollTop >= _this.store['topNum'] ? true : false
    })
  },
  onLoad: function () {
    let _this = this;
    
    wx.getSystemInfo({
      success: function (res) {
        _this.store['topNum'] = _this.store['model'][res.screenWidth];
      }
    })
    wx.showLoading({
      mask: true
    });
    _this._getHomeInfos();
  },
  // 自定义事件
  _getHomeInfos: function () {
    let _this = this;
    
    if (!_this.store['noMoreOfSeries']){
      app.ApiConfig.ajax(_this.store['url'].homeUrl +
        (_this.store['loadMoreOfSeries'] ? '?page=' + pageOfSeries + '&count=' + count : ''), function (res) {
          if (res.success) {
            if (_this.store['loadMoreOfSeries']) {
              if (res.data.series.list.length != 0){
                _this.setData({
                  series: _this.data.series.concat(res.data.series.list)
                });
              }else{
                _this.store['noMoreOfSeries'] = true;
              }
            } else {
              _this.setData({
                homeInfos: res.data,
                series: _this.data.series.concat(res.data.series.list)
              })
            }
            pageOfSeries++;
          }
          wx.hideLoading();
        });
    }
  },
  playVideo(){
    this.setData({
      isPlay: true
    });
  },
  searchInfo: function(event){
    let _this = this;

    pageOfGoods = 1;
    _this.store['noMoreOfGoods'] = false;
    _this.store['keyword'] = event.detail.value;
    _this._getGoodsList();
  },
  _getGoodsList(){
    let _this = this;

    app.ApiConfig.ajax(_this.store['url'].goodsListUrl + '?search=' + _this.store['keyword'] + '&page=' + pageOfGoods + '&count=' + count, function (res) {
        if (res.success) {
          if (pageOfGoods == 1){
            _this.setData({
              goodsList: res.data
            });
          }else{
            _this.setData({
              goodsList: _this.data.goodsList.concat(res.data)
            });
          }
          pageOfGoods++;
          wx.hideLoading();
        }
      });
  },
  showSaerchPage(){
    let animation = wx.createAnimation({
        duration: 500,
        timingFunction: "linear",
        delay: 0
      })
      , _this = this;
    
    // 第一段动画 
    _this.animation = animation;  
    animation.opacity(0).step();

    _this.setData({
      animationData: animation.export()
    });
    _this.setData({
      showSaerch: !_this.data.showSaerch
    });

    // 第二段动画
    animation.opacity(1).step();
    _this.setData({
      animationData: animation.export()
    });
  }
}

// 合并公共配置
pageConfig = {...pageConfig, ...pageAction({
  url: '/pages/index/index'
})};

Page(pageConfig)
