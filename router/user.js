const express = require('express')
// 创建 路由对象
const router = express.Router()
// 导入用户路由处理函数模块
const {register, login} = require('../router_handler/user')

// 1. 导入验证表单数据的中间件
const exportJoi = require('@escook/express-joi')
// 2. 导入需要的验证规则对象
const {reg_login_schema} = require('../schema/user')

// 注册新用户
// 3. 在注册新用户的路由中，声明局部中间件，对当前请求中携带的数据进行验证
// 3.1 数据验证通过后，会把这次请求流转给后面的路由处理函数
// 3.2 数据验证失败后，终止后续代码的执行，并抛出一个全局的 Error 错误，进入全局错误级别中间件中进行处理
// 注册新用户
router.post('/register',exportJoi(reg_login_schema), register)

// 用户登录
router.post('/login',exportJoi(reg_login_schema), login)

// 测试API
router.get('/', (req,res) => {
  res.json({
    code:0,
    data:{name:'lkk',age:18}
  })
})

// 将路由对象共享出去
module.exports = router
