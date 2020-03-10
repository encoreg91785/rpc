# rpc
初始化流程 mysql -> manager -> rpc -> socketServer -> httpServer
# 結構
manager 中央管理系統  
server RPC方法 需要將方法放入module.exports.rpc中 才會被呼叫到 onClose 當socket斷線會執行  
class 所有新增需要同步的Class 繼承syncClass index.js所有Class統一放入  
