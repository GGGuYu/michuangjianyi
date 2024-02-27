//激活悬浮窗之前检查了前台app，避免了闪烁
//offwindows百分百关闭，解决了永不消失的bug
//只要图标存在就一定可以点击关闭，解决了不可点击的bug
//show之前检查屏幕朝向，设置对应位置
//屏幕转向不影藏，转而设置悬浮窗对应位置
//click时更具当前屏幕朝向出发不同脚本
//导入Java&Android包
importClass(android.bluetooth.BluetoothSocket)
importClass(android.bluetooth.BluetoothAdapter)
importClass(android.bluetooth.BluetoothDevice)
importClass(android.bluetooth.BluetoothServerSocket)
importClass(android.bluetooth.BluetoothClass)
importClass(android.bluetooth.BluetoothProfile)
// importClass(android.content.BroadcastReceiver)
importClass(java.util.UUID)
importClass(java.io.BufferedReader);
importClass(java.io.IOException);
importClass(java.io.InputStream);
importClass(java.io.InputStreamReader);
importClass(java.io.OutputStream);
importClass(java.io.PrintWriter);
importPackage(android.content);
//常量池  基础参数
var REQUEST_ENABLE_BT = 1
var audio_type = 3;
var longClick = 111;//表示长按时的特殊appid
var cur_audioDevice_state = 0;//0表示没有耳机连接 ， 1表示有耳机连接的状态
var cur_app_id = 0;//当前appid
var musicapp_id = 2;
var app = ['QQ' , 'WeiXin' , 'music' , '菜鸟' , 'b站','taobao'];
var app_img_id = ['qq.jpg' , 'mm.jpg' ,'music.jpg','cainiao.jpg'];//图片路径的顺序对应app注册库的顺序
var dic = {"mm" : 1 , "qq" : 0 , "ss":3};//包名对应APPid
var kwset = ["mm" , "qq" , "ss"];//关键字仓库，记录登记了哪些kw
var img_path_pre = 'file://img/';//图片文件夹路径前缀
var img_qq = 'file://img/qq.jpg';
var img_mm = 'file://img/mm.jpg';
var taobao_id = 5;
var backup_id = 3;
var cur_clip = '';//当前剪贴板
var time = 0;//定时器
var storage = storages.create("curdata");
var path = "./test1.js";
var path_2 = "./test2.js";
var device_w = device.width;
var device_h = device.height;
var cur_screen_oritation = getScreenDirection();
//检查设备支持蓝牙 并获取蓝牙适配器
var bluetoothAdapter = BluetoothAdapter.getDefaultAdapter()
if (bluetoothAdapter == null) {
    toastLog("抱歉，您的设备不支持蓝牙")
    exit()
}
log("已获取到设备蓝牙适配器：" + bluetoothAdapter)

//检查蓝牙状态测试test函数
function checkAdapterEnabled(adapter)
{
  if (adapter.isEnabled()) {
    toastLog("蓝牙已开启")
  } else {
    toastLog("蓝牙处于关闭")
  }
}

//在蓝牙开启的情况下，检测当前是否存在音频蓝牙设备连接
function haveAudioDevice()
{
  let devices = bluetoothAdapter.getBondedDevices();
  // let option = new Array();

  if (devices.size() > 0) {
      for (let iterator = devices.iterator(); iterator.hasNext();) {
          let bluetoothDevice = iterator.next();
          // option.push("设备：" + bluetoothDevice.getName() + "\n地址：" + bluetoothDevice.getAddress() + "\nuuid：" + bluetoothDevice.getUuids().toString());
          //log("设备：" + bluetoothDevice.getName() + "\n");
          //log("此设备连接状态：" + String(bluetoothDevice.isConnected()));
          //log("此设备类型: " + bluetoothDevice.type);
          if(bluetoothDevice.isConnected() && bluetoothDevice.type == 3) return true;
      }
  }
  return false;
}

//每11秒(一个周期)检查蓝牙耳机是否 断连 的函数
function check_audioDevice_gone()
{
  if(bluetoothAdapter.isEnabled())
  {//蓝牙开着在，但耳机掉了
    if(!haveAudioDevice())
    {
      cur_audioDevice_state = 0;
      return true;
    }
  }
  else
  {//蓝牙都已经掉了
    cur_audioDevice_state = 0;  
    return true;
  }
  return false;
}

//检测到蓝牙耳机的第一次连接，就激活悬浮窗启动音乐小窗的封装函数
function audioDevice_music_LW()
{
  //蓝牙是否开启 如果开启才能检测是否有连接
  if(bluetoothAdapter.isEnabled())
  {
    //若虽然蓝牙是打开的 但是此时是连接状态 因此处于一直连接着的状态
    //所以不管 每11秒检查一下是否断开了就行，因为断开了一般很久才连接 11秒够了
    //也就是一次持续的连接默认至少持续11秒，这样可以大幅度减少检查次数
    //所以只管一开始没连接，现在连接了的状态
    if(cur_audioDevice_state != 1)//之前不是连接状态
    {
      if(haveAudioDevice())
      {
        cur_audioDevice_state = 1;
        put_cur_appid(musicapp_id);
        activateWindow();
      }
    }
  }else cur_audioDevice_state = 0;
}

//1竖屏 2横屏 横竖屏判断函数
function getScreenDirection() {
    return context.getResources().getConfiguration().orientation;
}
//-------------------------------------------悬浮窗
//检查小窗脚本是否存在
if(!files.exists(path) || !files.exists(path_2)){
  toast("脚本文件不存在: " + path);
  exit();
}
//悬浮窗定义
var window = floaty.window(
  <frame id="menu" visibility="gone" w="50dp" h="50dp" gravity="center" alpha="1">
      <img id="action_new" src = "{{img_path_pre + app_img_id[0]}}" />
      <button id="action" text="(~" visibility="gone" />
  </frame>
);
window.setPosition(device_w-180 , device_h / 7);
window.exitOnClose();
var execution = null;

//设置悬浮窗竖向时的位置
function set_position_normal()
{
    window.setPosition(device_w-180 , device_h / 7);
}
//设置屏幕横向时悬浮窗位置
function set_position_unnormal()
{
    //此时之前存的宽和高颠倒了
    window.setPosition(device_h-300 , 180);
}
//悬浮窗点击触发
window.action_new.click(()=>{
  if(window.action.getText() == '^_^' || window.action.getText() == '(~'){
      if(getScreenDirection() == 1)
          execution = engines.execScriptFile(path);
      else execution = engines.execScriptFile(path_2);
      window.action.setText('(~');
      hideWindow();
  }else{
      if(execution){
          execution.getEngine().forceStop();
      }
  }
});
 
//悬浮窗长按
// window.action.longClick(()=>{
// //  window.setAdjustEnabled(!window.isAdjustEnabled());
// //  return true;
//   let sgin = window.action.getText();
//   if(sgin == '^_^' || sgin == '(~'){
//     put_cur_appid(longClick);
//     execution = engines.execScriptFile(path);
//   }else{
//     if(execution){
//         execution.getEngine().forceStop();
//     }
// }
        
// });
//显示悬浮窗函数
function showWindow()
{
    if(getScreenDirection() == 1)
        set_position_normal();
    else set_position_unnormal();
    setTimeout(() => { ui.run(() => { window.menu.attr("visibility", "visible"); }); }, 20)
}
//隐藏悬浮窗函数
function hideWindow()
{
  setTimeout(() => { ui.run(() => { window.menu.attr("visibility", "gone"); }); }, 10)
}
//激活悬浮窗按钮函数
function activateWindow()
{
  if(window.action.getText() == '(~'){
      window.action.setText('^_^');
      time = 0;
  }
  
  let appid = storage.get("cur_appid");
  if(!check_activeApp_curApp_same(appid))
  {
    put_app_img();
    showWindow();
  }
}
//在前台app中不启动建议悬浮窗，因此判断将要启动的app是否是前台app
function check_activeApp_curApp_same(appid)
{
    let cur_pkg = currentPackage();
    let kw = '';
    kw = cur_pkg.substr(cur_pkg.length-2,cur_pkg.length);
    //log('cur_pkg = ' + cur_pkg);
    //log('kw = '+kw);
    if(isNeedProgram(kw))
    {
        if(dic[kw] == appid)
            return true;
    }
    return false;
}
//熄灭悬浮窗函数
function offWindow()
{
  if(window.action.getText() == '^_^'){
      window.action.setText('(~');
     
  }
  hideWindow();
}
//且当横屏时 隐藏悬浮窗 竖屏显示悬浮窗
function keep_screenAndWindow_same()
{
  if(getScreenDirection() == 1)
  {
    if(cur_screen_oritation != 1)
    {
      cur_screen_oritation = 1;
      set_position_normal();
    }
  }else 
  {
    if(cur_screen_oritation != 2)
    {
      cur_screen_oritation = 2;
      set_position_unnormal();
    }
  }
}
//保持程序执行的定时器，并且判断点亮11秒后应该熄灭悬浮窗
//且当横屏时 隐藏悬浮窗 竖屏显示悬浮窗
setInterval(()=>{
  keep_screenAndWindow_same();
  //checkForeappAndAct();
  audioDevice_music_LW();
  time += 1;
  if(time % 11 == 0)
  {
    check_audioDevice_gone();
    offWindow();
  }
  time = time%12;
}, 1000);

//--------------------------------------------------
auto();
//-----------------------------------------监听模块
events.observeNotification();
//监听到通知时做出动作
events.onNotification(function(notification){
    printNotification(notification);
    let package_name = notification.getPackageName();
    let keyword = package_name[package_name.length-2]+package_name[package_name.length-1];
    log("keyword = " + keyword);
    if(keyword == 'ss')
    {
        if(package_name[package_name.length-3] != 'e')
            keyword = ' ';
    }
    //如果程序是注册在kwset中的话 就激活悬浮窗
    if(isNeedProgram(keyword))
    {
      //log("进来了");
      put_cur_appid(dic[keyword]);
      activateWindow();
    }
});
//提示
toast("程序已经启动！");
//通知信息打印函数
function printNotification(notification){
    log("应用包名: " + notification.getPackageName());
    log("通知文本: " + notification.getText());
    // log("通知优先级: " + notification.priority);
    // log("通知目录: " + notification.category);
    // log("通知时间: " + new Date(notification.when));
    // log("通知数: " + notification.number);
    // log("通知摘要: " + notification.tickerText);
}
//脚本通信用来将appid传递给小窗脚本
function put_cur_appid(appid)
{
  storage.put("cur_appid" , appid);
  cur_app_id = appid;
  if(appid == musicapp_id)
  {
    toastLog("先生,音乐就绪^_^");
  }
}
//设置app图标
function put_app_img()
{
  setTimeout(() => { ui.run(() => { window.action_new.attr("src", img_path_pre+app_img_id[cur_app_id]) }); }, 10);
}
//判断当前通知程序的包名的keyword，是否是注册在kwset中的程序
function isNeedProgram(keyword)
{
  for(let i = 0;i < kwset.length;i++)
  {
    if(kwset[i] == keyword) return true;
  }
  return false;
}
//判断当前前台程序是否是悬浮窗对应程序
function checkForeappAndAct()
{
    let cur_pkg = currentPackage();
    let kw = '';
    
    kw = cur_pkg.substr(cur_pkg.length-2,cur_pkg.length);
    //log('cur_pkg = ' + cur_pkg);
    //log('kw = '+kw);
    if(isNeedProgram(kw))
    {
        if(dic[kw] == cur_app_id)
            offWindow();
    }
}