// goodsDetial.js
//获取应用实例
let app = getApp()
import { pageAction, appendParamForUrl, formatTime } from '../../utils/util'

let url = {
  goodsDetialUrl: app.globalData.isDebug ? 'goodsDetial' : '/wechatapp/goods/detail',
  addCartUrl: app.globalData.isDebug ? 'addCart' : '/wechatapp/cart/add',
  commentlist: app.globalData.isDebug ? 'commentlist' : '/wechatapp/goods/commentlist',
};

let bnGoodsID = 0; // 选中色号商品ID

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
    cartNum: 0,
    commentList: null
    // lazyLoad: {
    //   index: 3
    // }
  },
  onLoad: function (opt) {
    let _this = this, page = 1, count = 15;
    
    // 地址参数处理
    appendParamForUrl(url, {
      sso: app.globalData.sso
    });
    // 商品详情
    app.ApiConfig.ajax(url.goodsDetialUrl + '&goods_id=' + opt.goods_id, function (res) {
      let data = res.data;

      if (res.success) {
        _this.setData({
          goodsDetial: data,
          cartNum: data.cart_goods_num
        });
        bnGoodsID = data.goods_colors[0].bn_goods_id;
      }
    });
    // 用户评价
    app.ApiConfig.ajax(url.commentlist + '&page=' + page + '&count=' + count + '&goods_id=' + opt.goods_id, function (res) {
      let data = res.data;

      if (res.success) {
        for(let i = 0; i < data.length; i++){
          data[i].add_time = formatTime('1508681549');
        };
        _this.setData({
          commentList: data
        });
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
    });
    bnGoodsID = e.target.dataset.goosid;
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
      , cartNum = _this.data.cartNum;
    
    app.ApiConfig.ajax(url.addCartUrl, {
      bn_goods_id: bnGoodsID
    }, function (res) {
      if (res.success) {
        cartNum++;
        if (cartNum < 100) {
          _this.setData({
            cartNum: cartNum
          })
        }else{
          _this.setData({
            cartNum: 99
          })
        }
      }
    }, 'POST');
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
