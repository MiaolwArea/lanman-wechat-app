// goodsDetial.js
// 获取应用实例
let app = getApp()
import { pageAction, formatTime } from '../../../utils/util'

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
    commentList: [],
    goodsType: 1,
    goodsColors: {}
    // lazyLoad: {
    //   index: 3
    // }
  },
  // 数据缓存区
  store: {
    url: {
      // 商品详情
      goodsDetialUrl: app.globalData.isDebug ? 'goodsDetial' : '/wechatapp/goods/detail',
      // 加入购物车
      addCartUrl: app.globalData.isDebug ? 'addCart' : '/wechatapp/cart/add',
      // 评论列表
      commentlist: app.globalData.isDebug ? 'commentlist' : '/wechatapp/goods/commentlist',
    },
    bnGoodsID: [], // 选中色号商品ID
    pageNum: 1,
    goodsId: null,
    limitNum: 0
  },
  onLoad: function (opt) {
    let _this = this;

    _this.store['goodsId'] = opt.goods_id;
    // 商品详情
    app.ApiConfig.ajax(_this.store['url'].goodsDetialUrl + '?goods_id=' + _this.store['goodsId'], function (res) {
      let data = res.data;

      if (res.success) {
        // 购物车入口，设置色号坐标
        let bgi = opt.bn_goods_id || ''
          , goodsColors = data.goods_colors
          , goodsColorsAry = {}
          , bgiAry = [];

        for (let i = 0; i < goodsColors.length; i++) {
          if (data.goods_type != 2) {
            if (goodsColors[i].bn_goods_id == bgi) {
              _this.setData({
                currentTab: i
              })
            }
          } else {
            if (bgi){
              bgiAry = bgi.split(',');
              goodsColorsAry[goodsColors[i].bn_goods_id] = {
                isSelected: (bgiAry.indexOf(goodsColors[i].bn_goods_id) > -1) 
              };
            }else{
              goodsColorsAry[goodsColors[i].bn_goods_id] = {
                isSelected: (i == 0)
              };
            }
          }
        }
        if (bgi) {
          _this.store['bnGoodsID'].push(bgi);
        } else {
          _this.store['bnGoodsID'].push(data.goods_colors[0].bn_goods_id);
        }
        _this.store['limitNum'] = data.limit_num;
        // 设置初始值
        _this.setData({
          goodsDetial: data,
          cartNum: (data.cart_goods_num < 100 ? data.cart_goods_num : 99),
          goodsType: data.goods_type,
          goodsColors: goodsColorsAry
        });
      }
    });
  },
  onReachBottom: function () {
    if (this.data.isTabOn2 === 'on') {
      wx.showLoading({
        title: "加载中"
      });
      this.getCommentList();
      this.store['pageNum']++;
    }
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
    let _this = this
      , goodsColorsAry = _this.data.goodsColors
      , bngoodsid = e.target.dataset.bngoodsid
      , pos = _this.store['bnGoodsID'].indexOf(bngoodsid);

    _this.setData({
      currentTab: e.currentTarget.dataset.index
    });
    // 限制条件
    if (_this.data.goodsType == 2) {
      if ((_this.store['bnGoodsID'].length == _this.store['limitNum']) && (goodsColorsAry[bngoodsid].isSelected == false)) {
        return;
      }
      goodsColorsAry[bngoodsid].isSelected = !goodsColorsAry[bngoodsid].isSelected;
      if (goodsColorsAry[bngoodsid].isSelected){
        _this.store['bnGoodsID'].push(bngoodsid);
      }else{
        _this.store['bnGoodsID'].splice(pos, 1);
      }
      _this.setData({
        goodsColors: goodsColorsAry
      });
    }else{
      _this.store['bnGoodsID'][0] = bngoodsid;
    }
  },
  changeIndex(e) {
    this.setData({
      currentTab: e.detail.current
    })
  },
  // 标签切换
  swichTab(e) {
    this.store['pageNum'] = 1;
    if (e.currentTarget.dataset.index == 1) {
      this.setData({
        isTabOn1: "on",
        isTabOn2: ""
      })
    } else {
      this.setData({
        isTabOn1: "",
        isTabOn2: "on"
      });
    }
  },
  getCommentList() {
    let _this = this
      , count = 15;

    // 用户评价
    app.ApiConfig.ajax(_this.store['url'].commentlist + '?page=' + _this.store['pageNum'] + '&count=' + count + '&goods_id=' + _this.store['goodsId'], function (res) {
      let data = res.data;

      if (res.success) {
        for (let i = 0; i < data.length; i++) {
          data[i].add_time = formatTime(data[i].add_time);
        };
        _this.setData({
          commentList: _this.data.commentList.concat(data)
        });
        wx.hideLoading();
      }
    });
  },
  // 预览图片
  previewImage(e){
    let current = e.target.dataset.src
      , imgsUrl = e.target.dataset.imgs;  

    wx.previewImage({
      current: current, 
      urls: imgsUrl
    })  
  },
  // 加入购物车 
  addCart(e) {
    let _this = this
      , cartNum = _this.data.cartNum
      , isBuyNow = e.target.dataset.action || null;

    app.ApiConfig.ajax(_this.store['url'].addCartUrl, {
      bn_goods_id: _this.store['bnGoodsID'].join(','),
      goods_id: _this.store['goodsId'],
      goods_type: _this.data.goodsType
    }, function (res) {
      if (res.success) {
        cartNum++;
        if (cartNum < 100) {
          _this.setData({
            cartNum: cartNum
          })
        } else {
          _this.setData({
            cartNum: 99
          })
        }
        // 立即购买
        if (isBuyNow != null) {
          wx.redirectTo({
            url: '../../shoppingCart/pay/pay?cart_id=' + res.data.cart_id
          })
        }
      }
    }, 'POST');
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
    url: '/pages/goods/detial/detial'
  })
};

Page(pageConfig)
