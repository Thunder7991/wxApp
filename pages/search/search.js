/*
 * @Author: your name
 * @Date: 2021-04-11 20:56:02
 * @LastEditTime: 2021-04-14 09:31:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \Wechat_demo\pages\search\search.js
 */
import request from '../../utils/request';
// pages/search/search.js
let isSend = false;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    placeholderContent: '', //placeholder 默认值
    hotList: [], //热搜榜数据
    searchContent: '', //搜索的数据
    searchList: [], //pip
    historyList: [], //搜索历史记录表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInitData();
    this.getSearchHistory();
  },
  //初始化数据
  async getInitData() {
    let placeholderData = await request('/search/default');
    let hostListData = await request('/search/hot/detail');
    let index = 0;
    let needHostDataMap = hostListData.data.data.map((item) => {
      item.iid = index++;
      return item;
    });
    this.setData({
      placeholderContent: placeholderData.data.data.showKeyword,
      hotList: needHostDataMap,
    });
  },
  //获取本地历史记录的功能函数
  getSearchHistory() {
    let historyList = wx.getStorageSync('searchHistory');
    if (historyList) {
      this.setData({
        historyList,
      });
    }
  },
  //监听输入框
  handleInputChange(event) {
    this.setData({
      searchContent: event.detail.value.trim(),
    });
console.log(isSend);
    if (isSend) {
      return;
    }
    isSend = true;
    this.getSearchList();
    setTimeout(() => {
      isSend = false;
    }, 300);
  },
  async getSearchList() {
    if (!this.data.searchContent) {
      this.setData({
        searchList: [],
      });
      return;
    }
    let { searchContent, historyList } = this.data;
    //发请求获取关键字模糊匹配数据
    let searchListData = await request('/search', { keywords: searchContent, limit: 10 });
    this.setData({
      searchList: searchListData.data.result.songs,
    });

    //将搜索的关键字添加到历史记录中
    if (historyList.indexOf(searchContent) !== -1) {
      historyList.splice(historyList.indexOf(searchContent), 1);
    } else {
    }
    historyList.unshift(searchContent);
    this.setData({
      historyList,
    });
    wx.setStorageSync('searchHistory', historyList);
  },
  //清空搜索内容
  clearSearchContent() {
    this.setData({
      searchContent: '',
      searchList: [],
    });
  },
  //删除搜索历史记录
  deleteSearchHistory() {
    wx.showModal({
      title: '',
      content: '确认删除吗？',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#3CC51F',
      success: (result) => {
        if (result.confirm) {
          //清空data中的historyList
          this.setData({
            historyList: [],
          });
          //移除缓存
          wx.removeStorageSync('searchHistory');  
        }
      },
      fail: () => {},
      complete: () => {},
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},
});
