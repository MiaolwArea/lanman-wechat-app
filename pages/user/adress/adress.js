//adress.js
//获取应用实例
let app = getApp();
let editId = null;

let pageConfig = {
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
  // 删除地址
  delAdress(e) {
    let dataset = e.target.dataset;

    if (dataset.isdefault == 0) {
      // app.ApiConfig.ajax('delAdress', {
      //   id: e.target.dataset.id
      // }, function (res) {
      //   if (res) {
      //     wx.showModal({
      //       title: '',
      //       content: '删除成功！',
      //       showCancel: false
      //     })
      //   }
      // });
    } else {
      wx.showModal({
        title: '',
        content: '默认地址不能删除！',
        showCancel: false
      })
    }
  },
  // 编辑地址详细信息
  editAdress(e) {
    let _this = this;
    editId = e.target.dataset.id;

    if (editId) {
      app.ApiConfig.ajax('getAdressInfo?id=' + editId, function (res) {
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
  // 地区选择
  bindChange(e) {
    let cityAry = e.detail.value
      , customItem = this.data.customItem;

    for (let i = 0; i < cityAry.length; i++) {
      if (cityAry[i] == customItem) {
        cityAry[i] = '';
      }
    }
    this.setData({
      region: cityAry
    })
  },
  // 保存
  formSubmit(e) {
    let dataObj = e.detail.value
      , region = this.data.region;

    dataObj.province = region[0];
    dataObj.city = region[1];
    dataObj.district = region[2];
    if (editId) {
      dataObj.id = editId;
    }
    console.log(dataObj);
    // app.ApiConfig.ajax('postAdressInfo', dataObj, function (res) {
    //   if (res) {

    //   }
    // })
  }
}

Page(pageConfig)
