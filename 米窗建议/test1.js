var app = ['QQ' , 'WeiXin' , 'music' , 'backup','B站','taobao'];
var taobao_id = 5;
var backup_id = 1;
var cur_clip = '';//当前剪贴板
var longClick = 111;
var firstapp_dis = 250;
var app_2_space = 163;
var app_dis = [];
var storage = storages.create("curdata");
// swipe(LW_tool_para[0], LW_tool_para[1], LW_tool_para[2], LW_tool_para[3], LW_tool_para[4]);
// 触发侧边栏参数
var LW_tool_para = [1,240,200,240,20];
//-------------------------初始化参数函数
function init_para()
{
  for(let i = 0; i < app.length; i++)
  {
    if(i == 0) app_dis[i] = firstapp_dis;
    else app_dis[i] = app_dis[i-1] + app_2_space;
  }
}

//扩大 小窗大小函数
function augmentWindow()
{
  setTimeout(function()
  {
    swipe(900, 1500, 1000, 1600, 50);
  } , 500);
}
//打开app小窗函数
function open_APP_LW(appid)
{
  "auto";
  toast(app[appid] + '小窗启动');
  //滑动触发侧边栏
  swipe(LW_tool_para[0], LW_tool_para[1], LW_tool_para[2], LW_tool_para[3], LW_tool_para[4]);
  setTimeout(function()
  {
    //点击对应app开启小窗
    click(120,app_dis[appid]);
    // augmentWindow();
  } , 400);
}
//输入appid
function put_cur_appid(appid)
{
  storage.put("cur_appid" , appid);
}
//长按判断剪贴板后启动对应小窗
function checkClipAndPut() {
  $settings.setEnabled("foreground_service", true);

  var w = floaty.window(
    <frame gravity="center" visibility="invisible">
      <text id="text"></text>
    </frame>
  );
  ui.run(function () {
    w.requestFocus();
    setTimeout(() => {
      cur_clip = getClip();
      log("剪贴板当前内容：" + cur_clip);
      w.close();
      if(cur_clip.indexOf('【淘宝】') != -1 && cur_clip.indexOf('http') != -1)
        put_cur_appid(taobao_id);
      else put_cur_appid(backup_id);
    }, 1);
  });
 }
//-----------------------主程序
init_para();//初始化参数
var appid = storage.get("cur_appid");

//判断是否是长按 ， 因为长按启动时的appid约定为111,短按直接打开app
if(appid == longClick)
{
  //长按先检查剪贴板
  checkClipAndPut();
  //延迟等待一下读取剪贴板，因为是读取剪贴板是异步函数
  setTimeout(function()
  {
    //重新读一下当前appid
    appid = storage.get("cur_appid");
    open_APP_LW(appid);
    // augmentWindow();
  } , 100);
}
else{
  open_APP_LW(appid);
}
