// goodsDetial.js
//获取应用实例
let app = getApp()
import { pageAction } from '../../utils/util'

// let countHeight = 0; // 图片总高度
// let windowWidth = wx.getSystemInfoSync().windowWidth; // 屏宽
// let scrollTopHeight = null; // 图片块距离顶部高度
// let isOdd = false;  // 图片加载防重

// // 计算单图高度
// function countPixHeight(width, height){
//   return Math.ceil(height / (width / windowWidth));
// }
let pageConfig = {
  data: {
    goodsDetial: {},
    currentTab: 0,
    isTabOn1: "on",
    isTabOn2: "",
    // lazyLoad: {
    //   index: 3
    // }
  },
  onLoad: function (opt) {
    let _this = this;

    app.ApiConfig.ajax('goodsDetial', function (res) {
      if (res) {
        _this.setData({
          goodsDetial: res
        })
      }
    });
  },
  onPageScroll: function (e) {
    let _this = this;

    // if (scrollTopHeight != null && e.scrollTop > (scrollTopHeight + countHeight - wx.getSystemInfoSync().windowHeight - 100)){
    //   _this.setData({
    //     lazyLoad: {
    //       index: 6
    //     }
    //   })
    // }
  },
  // 自定义事件
  // 切换轮播
  swichSwiper(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.index
    })
  },
  changeIndex(e) {
    this.setData({
      currentTab: e.detail.current
    })
  },
  // 标签切换
  swichTab(e) {
    if (e.currentTarget.dataset.index == 1) {
      this.setData({
        isTabOn1: "on",
        isTabOn2: ""
      })
    } else {
      this.setData({
        isTabOn1: "",
        isTabOn2: "on"
      })
    }
  },
  // 加入购物车 
  addCart(e) {
    let _this = this
      , goodsDetial = _this.data.goodsDetial
      , id = e.target.dataset;

    app.ApiConfig.ajax('addCart?id=' + id, function (res) {
      if (res) {
        goodsDetial.goodsNum++;
        if (goodsDetial.goodsNum < 100) {
          _this.setData({
            goodsDetial: goodsDetial
          })
        }
      }
    });
  },
  buyNow(e) {
    this.addCart(e);
    wx.switchTab({
      url: '../shoppingCart/shoppingCart'
    })
  },
  // 懒加载图片
  // countHeight(e) {
  //   if(isOdd){
  //     countHeight += countPixHeight(e.detail.width, e.detail.height);
  //   }
  //   isOdd = !isOdd;
  // },
  // infoTouchStart(e){
  //   if (scrollTopHeight == null){
  //     scrollTopHeight = e.currentTarget.offsetTop;
  //   }
  // }
}
// 合并公共配置
pageConfig = {
  ...pageConfig, ...pageAction({
    url: '/pages/goodsDetial/goodsDetial'
  })
};

Page(pageConfig)
