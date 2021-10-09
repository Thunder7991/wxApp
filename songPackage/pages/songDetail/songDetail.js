import request from '../../../utils/request';
import PubSub from 'pubsub-js';
import moment from 'moment';
const appInstance = getApp();
// pages/songDetail/songDetail.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, //是否播放
    song: {}, //歌曲详情对象
    musicId: '',
    musicLink: '', //音樂的链接
    currentTime: '00:00', //实时时间
    durationTime: '00:00', //总时间
    currentWidth: 0, //实时进度条的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let musicId = options.musicId;
    this.setData({
      musicId,
    });
    this.getMusicInfo(musicId);
    //进入页面的时候判断页面是否正在播放
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      //x修改当前页面的播放状态
      this.setData({
        isPlay: true,
      });
    }

    //创建控制音乐播放的实例
    // properties(src(m4a, aac, mp3, wav),startTime,title,epname,singer,coverImgUrl,webUrl,protocol)
    this.backAudioManager = wx.getBackgroundAudioManager();
    /**
     * @description: 如果用户操作控制音乐的播放/暂停按钮
     * @param {*}
     * @return {*}
     */
    this.backAudioManager.onPlay(() => {
      //修改音乐播放的状态
      this.changePlayState(true);
      appInstance.globalData.musicId = musicId;
    });
    this.backAudioManager.onPause(() => {
      this.changePlayState(false);
    });
    this.backAudioManager.onStop(() => {
      this.changePlayState(false);
    });


    //监听音乐自动播放完毕
    this.backAudioManager.onEnded(() => {
      //关闭当前的音乐
      this.backAudioManager.stop();
      //自定切换到下一首
      PubSub.subscribe('musicId', (msg, musicId) => {
        this.getMusicInfo(musicId);
        //自动播放音乐
        this.musicControl(true, musicId);
        PubSub.unsubscribe('musicId');
      });
      PubSub.publish('switchType', 'next')
      //将进度条变为0
      this.setData({
        currentWidth: 0,
        currentTime: '00:00'
      })
    });
    //监听音乐播放的进度
    this.backAudioManager.onTimeUpdate(() => {
      let currentTime = moment(this.backAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backAudioManager.currentTime / this.backAudioManager.duration * 450
      this.setData({
        currentTime,
        currentWidth
      })
    })
  },
  //修改播放状态的函数
  changePlayState(isPlay) {
    this.setData({
      isPlay,
    });
    appInstance.globalData.isMusicPlay = isPlay;
  },
  //获取音乐详情功能的函数
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', {
      ids: musicId
    });
    let durationTime = moment(songData.data.songs[0].dt).format('mm:ss');
    this.setData({
      song: songData.data.songs[0],
      durationTime,
    });
    //动态修改窗口的标题
    wx.setNavigationBarTitle({
      title: this.data.song.name,
    });
  },
  //点击播放暂停的回调
  handleMusicPlay() {
    let isPlay = !this.data.isPlay;
    //修改是否播放的状态
    /*  this.setData({
      isPlay,
    }); */
    let {
      musicId,
      musicLink
    } = this.data;
    this.musicControl(isPlay, musicId, musicLink);
  },
  //控制音乐播放和暂停的函数
  async musicControl(isPlay, musicId, musicLink) {
    //音乐播放
    if (isPlay) {
      if (!musicLink) {
        //获取播放链接
        let musicLinkData = await request('/song/url', {
          id: musicId
        });
        musicLink = musicLinkData.data.data[0].url;
        this.setData({
          musicLink,
        });
      }

      this.backAudioManager.src = musicLink;
      this.backAudioManager.title = this.data.song.name;
    } else {
      //音乐暂停
      this.backAudioManager.pause();
    }
  },
  //点击切歌的回调
  handleSwitch(event) {
    let type = event.currentTarget.id;
    //关闭当前的音乐
    this.backAudioManager.stop();
    //订阅来自recommendSong页面发布的musicId
    PubSub.subscribe('musicId', (msg, musicId) => {
      this.getMusicInfo(musicId);
      //自动播放音乐
      this.musicControl(true, musicId);
      PubSub.unsubscribe('musicId');
    });
    //发布消息数据给recommendSong页面
    PubSub.publish('switchType', type);
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