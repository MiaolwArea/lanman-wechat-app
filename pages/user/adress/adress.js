//adress.js
//获取应用实例
let app = getApp()
let city = require('../../../utils/city')
let level1City = []
  , level2City = []
  , level3City = [];

Page({
  data: {
    userInfo: {},
    adress: [],
    isEdit: false,
    city01: [],
    city02: [],
    city03: []
  },
  onLoad: function () {
    let _this = this;

    if (app.globalData.userInfo) {
      _this.setData({
        userInfo: app.globalData.userInfo
      })
    }
    // 获取初始化数据 
    app.ApiConfig.ajax('adress', function (res) {
      if (res) {
        _this.setData({
          adress: res
        })
      }
    });
    // 初始化选择器
    _this._selectCity();

  },
  //事件处理函数
  // 设置默认地址
  radioChange(e) {
    // app.ApiConfig.ajax('setAdress', {
    //   id: e.detail.value
    // }, function (res) {
    //   if (res) {
    //     _this.setData({
    //       adress: res
    //     })
    //   }
    // });
  },
  // 
  editAdress() {
    this.setData({
      isEdit: true
    })
  },
  bindChange(e) {
    this._selectCity(e.detail.value[0], e.detail.value[1]);
  },
  _selectCity(level1 = '北京市', level2 = 0) {
    let level1Index = 0, level2Index = 0;

    if (this.data.city01.length != 0) {
      level1Index = level1;
      level1 = this.data.city01[level1];
    } 
    level2Index = level2;
    if (level1City.length == 0){
      Object.keys(city.city).forEach(itemid => {
        let childStore = [];
        level1City.push(itemid);
        Object.keys(city.city[itemid]).forEach((itemid2, index) => {
          childStore.push(itemid2);
          level3City = city.city[itemid][itemid2];
        })
        level2City.push(childStore);
      })
    }
    level3City = city.city[level1][level2City[level1Index][level2Index]];
    this.setData({
      city01: level1City,
      city02: level2City[level1Index],
      city03: level3City
    })
  }
})
