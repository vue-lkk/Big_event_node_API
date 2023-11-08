const path = require('path')
const db = require('../db/index')
const fs = require('fs')


// 发布新文章的处理函数
// upload.single() 是一个局部生效的中间件，用来解析 FormData 格式的表单数据
// 将文件类型的数据，解析并挂载到 req.file 属性中
// 将文本类型的数据，解析并挂载到 req.body 属性中
exports.addArticle = (req, res) => {
  console.log(req.body) // 文本类型的数据
  console.log('--------分割线----------')
  console.log(req.file) // 文件类型的数据
  
  if(!req.file || req.file.fieldname !== 'cover_img') return res.cc('文章封面是必须数!')

  // TODO：表单数据合法，继续后面的处理流程...
  const articleInfo = {
    // 标题、内容、状态、所属的分类Id
    ...req.body,
    // 文章封面在服务器端的存放路径,并拼接好后缀名
    cover_img:path.join('/uploads', req.file.filename + path.extname(req.file.originalname)),
    // 文章发布时间
    pub_data:new Date(),
    // 文章作者的Id
    author_id:req.user.id,
  }

  // 将老的文件名改成新的与后缀的文件  #同步写法
  fs.renameSync(req.file.path, req.file.path + path.extname(req.file.originalname))

  const sql = `insert into ev_articles set ?`
  db.query(sql, articleInfo, (err, results) => {
    if(err) return res.cc(err)
    if(results.affectedRows !== 1) return res.cc('发布文章失败!')
    res.cc('发布文章成功！')
  })
}

// 获取文章的列表数据的处理函数
exports.articleList = (req, res) => {
  const {pagenum, pagesize, cate_id, state} = req.body
  // const sql = `select * from ev_articles where is_delete=0 order by id desc`
  // const sql =  `select * from ev_articles limit 3,3`  // limit 几条，偏移量
  // 偏移量的计算公式为: (页码值 - 1) * 每页显示多少条数据
  let $offset = (pagenum - 1) * pagesize
  let sql = ''
  let countSql = ''
  if(cate_id && state) {
    sql = `select * from ev_articles where is_delete=0 and cate_id=${cate_id} and state='${state}' order by id desc limit ${$offset},${pagesize}`
    countSql = `select count(*) as total from ev_articles where is_delete=0 and cate_id=${cate_id} and state='${state}'`
  }else if (cate_id && ! state){
    sql = `select * from ev_articles where is_delete=0 and cate_id=${cate_id}  order by id desc limit ${$offset},${pagesize}`
    countSql = `select count(*) as total from ev_articles where is_delete=0 and cate_id=${cate_id}`
  }else if (!cate_id && state){
    sql = `select * from ev_articles where is_delete=0 and state='${state}' order by id desc limit ${$offset},${pagesize}`
    countSql = `select count(*) as total from ev_articles where is_delete=0 and state='${state}'`
  }else{
    // 查询总数据数
    sql = `select * from ev_articles where is_delete=0 order by id desc limit ${$offset},${pagesize}`
    countSql = `select count(*) as total from ev_articles where is_delete=0`
  }

  db.query(sql, (err, results) => {
    if(err) return res.cc(err)
    db.query(countSql,(err, results1) => {
      let total = results1[0].total
      res.send({
        status:0,
        message:'获取文章列表成功!',
        data:results,
        total
      })
    })
  })
}


// 删除文章数据的处理函数
exports.deleteCateById = (req, res) => {
  const sql =  `update ev_articles set is_delete=1 where id=?`
  db.query(sql, req.params.id, (err, results) => {
    // 执行 SQL 语句失败
    if(err) return res.cc('err')
    // SQL 语句执行成功，但是影响行数不等于 1
    if(results.affectedRows !== 1) return res.cc('删除文章失败!')
    // 删除文章分类成功
    res.cc('删除文章成功!')
  })
}


// 根据Id查找文章
exports.getArticleById  = (req, res) => {
  const sql = `select * from ev_articles where id=?`
  db.query(sql, req.params.id,(err, results) => {
    // 执行 SQL 语句失败
    if(err) return res.cc(err)
    
		// SQL 语句执行成功，但是没有查询到任何数据
    if(results.length !== 1) return res.cc('获取文章数据失败!')
    // 把数据响应给客户端
    res.send({
      status:0,
      message:'获取文章数据成功!',
      data:results[0]
    })
  })
}

// 更新文章内容
exports.editArticle =async (req,res) => {
  console.log(req.body) // 文本类型的数据
  console.log('--------分割线----------')
  console.log(req.file) // 文件类型的数据

  //先查询有没有这个文章有没有名称撞车
	const sqlStr = `select * from ev_articles where id != ? and title = ?`
  //执行查重操作
	db.query(sqlStr, [req.body.id, req.body.title], (err, results) => {
		if (err) return res.cc(err)
		if (results[0]) {
			return res.cc('文章标题不能重复！')
		}
		if (!req.file || req.file.fieldname !== 'cover_img')
			return res.cc('文章封面是必选参数！')
		// 证明数据都是合法的，可以进行后续业务逻辑的处理
		// 处理文章的信息对象
		const articleInfo = {
			// 标题、内容、发布状态、所属分类的Id
			...req.body,
      // 文章封面在服务器端的存放路径,并拼接好后缀名
      cover_img:path.join('/uploads', req.file.filename + path.extname(req.file.originalname)),
			// 文章的发布时间
			pub_data: new Date(),
			
		}
    // 将老的文件名改成新的与后缀的文件  #同步写法
    fs.renameSync(req.file.path, req.file.path + path.extname(req.file.originalname))

		const sql = `update ev_articles set ? where id=?`
		db.query(sql, [articleInfo, req.body.id], (err, results) => {
			if (err) return res.cc(err)
			if (results.affectedRows !== 1) return res.cc('编辑文章失败！')
			res.cc('编辑文章成功！', 0)
		})
	})
}

