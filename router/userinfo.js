// 导入 express
const express = require('express')
// 创建路由对象
const router = express.Router()
// 导入用户信息的处理函数模块
const {
  getUserInfo,
  updateUserInfo,
  updatePassword,
  updateAvatar
} = require('../router_handler/userinfo')
// 导入验证数据合法性的中间件
const expressJoi = require('@escook/express-joi')
// 导入需要的验证规则对象
const {
  update_userinfo_schema,
  update_password_schema,
  update_avatar_schema
} = require('../schema/user')

// 获取用户的基本信息
router.get('/userinfo', getUserInfo)
// 更新用户的基本信息
router.post('/userinfo', expressJoi(update_userinfo_schema), updateUserInfo)
// 重置密码的路由
router.post('/updatepwd',expressJoi(update_password_schema),updatePassword)
// 更新用户头像的路由
router.post('/update/avatar',expressJoi(update_avatar_schema),updateAvatar)

// 向外共享路由对象
module.exports = router