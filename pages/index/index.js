/*
 * @Author: your name
 * @Date: 2021-04-06 17:23:34
 * @LastEditTime: 2021-04-11 20:47:30
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \Wechat_demo\pages\index\index.js
 */
import request from '../../utils/request';
// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    bannerList: [], //轮播数据
    recommendList: [], //推荐歌单
    topList: []
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  async onLoad() {
    // if (wx.getUserProfile) {
    //   this.setData({
    //     canIUseGetUserProfile: true
    //   })
    // }
    let res = await request('/banner', {
      type: 1
    })
    this.setData({
      bannerList: res.data.banners
    })
    let recommend = await request('/personalized', {
      limit: 10
    })
    this.setData({
      recommendList: recommend.data.result
    })
    //获取排行榜数据
    let index = 0
    let resultArr = [];
    while (index < 5) {
      let topListData = await request('/top/list', {
        idx:index++
      })
      let topListItem = {
        name: topListData.data.playlist.name,
        tracks: topListData.data.playlist.tracks.slice(0, 3)
      }
      resultArr.push(topListItem)
      this.setData({
        topList:resultArr
      })
    }
  
  },
  toRecommendSong(){
    wx.navigateTo({
      url:'/songPackage/pages/recommendSong/recommendSong'
    })
  }
})