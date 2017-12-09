// logger.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  // 标签切换
  swichTab(e) {
    let _this = this
      , Ecurrent = e.target.dataset.current;

    if (_this.data.currentTab === Ecurrent) {
      return false;
    } else {
      _this.setData({
        currentTab: Ecurrent
      })
    }
  },
})