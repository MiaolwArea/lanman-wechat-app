//adress.js
//获取应用实例
let app = getApp()

Page({
  data: {
    customItem: "全部",
    userInfo: {},
    adress: [],
    isEdit: false,
    region: [],
    adressInfo: {}
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
  // 编辑地址详细信息
  editAdress(e) {
    let _this = this
      , id = e.target.dataset.id || null;

    if (id){
      app.ApiConfig.ajax('getAdressInfo?id=' + e.target.dataset.id, function (res) {
        if (res) {
          _this.setData({
            adressInfo: res,
            region: [res.province, res.city, res.district]
          })
        }
      })
    }
    _this.setData({
      isEdit: true
    })
  },
  bindChange(e) {
    let cityAry = e.detail.value
      , customItem = this.data.customItem;
    
    for (let i = 0; i < cityAry.length; i++) {
      if (cityAry[i] == customItem){
        cityAry[i] = '';
      }
    }
    this.setData({
      region: cityAry
    })
  }
})
