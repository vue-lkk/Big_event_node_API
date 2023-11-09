// 导入 mysql 模块
const mysql = require('mysql')

// 创建数据库连接对象
const db = mysql.createPool({
  host:'127.0.0.1',     // 数据库的 IP 地址
  post:3306,            // 数据库端口(默认3306)
  user:'root',          // 登录数据库的账号
  password:'admin123',  // 登录数据库的密码
  database:'my_db_01'   // 指定要操作哪个数据库
})

// 向外共享 db 数据库连接对象
module.exports = db