/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */
// 导入数据库操作模块
const db = require('../db/index')
// 引入对用户密码进行加密模块
const bcrypt = require('bcryptjs')
// 生成Token模块
const jwt = require('jsonwebtoken')
// 导入配置文件
const config = require('../config')


// 注册用户的处理函数
exports.register = (req, res) => {
  // 获取客户端提交到服务器的用户信息
  const userInfo = req.body
  // 定义 查找SQL 语句
  const sql = 'select * from ev_users where username=?'
  // 执行 SQL 语句并根据结果判断用户名是否被占用
  db.query(sql,[userInfo.username],(err, results) => {
    // 执行 SQL 语句失败
    if(err){
      return res.cc(err)
    }
    // 用户名被占用
    if(results.length > 0)  return res.cc('用户名被占用，请更换其他用户名！')
    // TODO: 用户名可用，继续后续流程...
  })
  
  // 对用户的密码,进行 bcrype 加密，返回值是加密之后的密码字符串
  userInfo.password = bcrypt.hashSync(userInfo.password, 10)
  // 定义 插入SQL 语句
  const sql1 = 'insert into ev_users set ?'
  // 调用  db.query()  执行 SQL 语句，插入新用户
  db.query(sql1,{username:userInfo.username,password:userInfo.password},(err,results) => {
    // 执行 SQL 语句失败
    if(err) return res.cc(err)
    // SQL 语句执行成功，但影响行数不为 1
    if(results.affectedRows !== 1) return res.cc('注册用户失败，请稍后再试！')
    // 注册成功
    res.cc('注册成功！',0)
  })
  
}

// 登录的处理函数
exports.login = (req, res) => {
  // 获取客户端提交到服务器的用户信息
  const userInfo = req.body
  // 定义 SQL 语句
  const sql = `select * from ev_users where username=?`
  // 执行 SQL 语句 根据用户名称查询用户的信息
  db.query(sql,userInfo.username,(err,results) => {
    // 执行 SQL 语句失败
    if(err) return res.cc(err)
    // 执行 SQL 语句成功，但是查询到数据条数不等于 1
    if(results.length !== 1) return res.cc('登录失败')
    // TODO：判断用户输入的登录密码是否和数据库中的密码一致
    // 拿着用户输入的密码,和数据库中存储的密码进行对比
    const compareResult = bcrypt.compareSync(userInfo.password,results[0].password)
    // 如果对比的结果等于 false, 则证明用户输入的密码错误
    if(!compareResult) return res.cc('登录失败')
    // 剔除完毕之后，user 中只保留了用户的 id, username, nickname, email 这四个属性的值
    const user = {...results[0], password:'', user_pic:''}
    const tokenStr = jwt.sign(user,config.jwtSecreKey,{
      expiresIn: '10h',// token 有效期为 10 个小时
    })
    res.send({
      status: 0,
      message: '登录成功！',
      // 为了方便客户端使用 Token，在服务器端直接拼接上 Bearer 的前缀
      token: 'Bearer ' + tokenStr,
    })
    
  })
}