import request from '../../../utils/request';
import PubSub from 'pubsub-js';
// pages/recommendSong/recommendSong.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    day: '',
    month: '',
    recommendList: [], //推荐列表区域
    index: 0, //点击音乐的下表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //判断用户是否登录
    let userInfo = wx.getStorageSync('userinfo');
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none',
        success: () => {
          wx.reLaunch({
            url: '/pages/login/login',
          });
        },
      });
    }
    //更新日期的数据
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1,
    });
    this.getRecommendList();
    //订阅来自songDeatil页面发布的消息
    PubSub.subscribe('switchType', (msg, type) => {
      let { recommendList, index } = this.data;
      if (type === 'pre') {
        index === 0 && (index = recommendList.length);
        index -= 1;
      } else {
        index === recommendList.length - 1 && (index = -1);
        index += 1;
      }
      //更新下表
      this.setData({
        index,
      });
      let musicId = recommendList[index]?.id;
      //将ID回传给songDetail页面
      PubSub.publish('musicId', musicId);
    });
  },
  getCurrentPages(e) {
    console.log(e);
  },
  //获取用户每日推荐数据
  async getRecommendList() {
    let recommendListData = await request('/recommend/songs');
    this.setData({
      recommendList: recommendListData.data.recommend,
    });
  },
  toSongDetail(event) {
    let { song, index } = event.currentTarget.dataset;
    this.setData({
      index,
    });
    // 路由跳转传参
    wx.navigateTo({
      //不能将song作为参数进行传递,因为过长会被截取掉
      //  url: '/pages/songDetail/songDetail?song=' + JSON.stringify(song),
      url: '/songPackage/pages/songDetail/songDetail?musicId=' + song.id,

      success: (result) => {},
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
