var http = require('http')
var fs = require('fs')
var url = require('url')
const { resolve } = require('path')
var port = process.argv[2]

if (!port) {
    console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
    process.exit(1)
}

var server = http.createServer(function(request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /******** 从这里开始看，上面不要看 ************/

    console.log('有个傻子发请求过来啦！路径（带查询参数）为：' + pathWithQuery)

    if (path === '/') {
        let string = fs.readFileSync('./index.html', 'utf8')
        let strings = request.headers.cookie.split(';')
        let hash = {}
        for (let i = 0; i < strings.length; i++) {
            let parts = strings[i].split('=')
            let key = parts[0].trim()
            let value = parts[1].trim()
            hash[key] = value
        }
        let email = hash.sign_in_email
        let users = fs.readFileSync('./db/users')
        users = JSON.parse(users)
        var foundUser
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email) {
                foundUser = users[i]
                break;
            }
        }
        if (foundUser) {
            string = string.replace('__password__', foundUser.password)
        } else {
            string = string.replace('__password__', '不知道')
        }
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        response.write(string)
        response.end()
    } else if (path === '/sign_up' && method === 'GET') { //请求页面
        let string = fs.readFileSync('./sign_up.html', 'utf8')
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        response.write(string)
        response.end()
    } else if (path === '/sign_up' && method === 'POST') { //提交表单
        readBody(request).then((body) => {
            let hash = {}
            let strings = body.split('&')
            strings.forEach((string) => {
                let parts = string.split('=')
                let key = parts[0]
                let value = parts[1]
                hash[key] = decodeURIComponent(value)
            });
            let { email, password, password_comfirm } = hash
            if (email.indexOf('@') === -1) {
                response.statusCode = 400
                response.setHeader('Content-Type', 'application/json;charset=utf-8')
                response.write(`{
                    "email":"invalid"
            }`)
            } else if (password !== password_comfirm) {
                response.statusCode = 400
                response.write('password not match')
            } else {
                let users = fs.readFileSync('./db/users')
                try {
                    users = JSON.parse(users)
                } catch (ex) {
                    users = []
                }
                let inUse = false
                for (let i = 0; i < users.length; i++) {
                    if (users[i].email === email) {
                        inUse = true
                        break;
                    }
                }
                if (inUse) {
                    response.statusCode = 400
                    response.write('email is use')
                } else {
                    users.push({ email: email, password: password })
                    let usersString = JSON.stringify(users)
                    fs.writeFileSync('./db/users', usersString)
                    response.statusCosde = 200
                }

            }
            response.end()
        })
    } else if (path === '/sign_in' && method === 'GET') {
        let string = fs.readFileSync('./sign_in.html', 'utf8')
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        response.write(string)
        response.end()
    } else if (path === '/sign_in' && method === 'POST') {
        readBody(request).then((body) => {
            let hash = {}
            let strings = body.split('&')
            strings.forEach((string) => {
                let parts = string.split('=')
                let key = parts[0]
                let value = parts[1]
                hash[key] = decodeURIComponent(value)
            });
            let { email, password } = hash
            let users = fs.readFileSync('./db/users')
            try {
                users = JSON.parse(users)
            } catch (ex) {
                users = []
            }
            let found
            for (let i = 0; i < users.length; i++) {
                if (users[i].email === email && users[i].password === password) {
                    found = true
                    break;
                }
            }
            if (found) {
                // Set-Cookie: <cookie-name>=<cookie-value> 
                response.setHeader('Set-Cookie', `sign_in_email = ${email}`)
                response.statusCode = 200
            } else {
                response.statusCode = 401
            }
            response.end()
        })
    } else if (path === '/main.js') {
        let string = fs.readFileSync('./main.js', 'utf8')
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/javascript;charset=utf-8')
        response.write(string)
        response.end()
    } else if (path === '/xxx') {
        response.statusCode = 200
        response.setHeader('Content-Type', 'text/json;chatset=utf-8')
        response.setHeader('Access-Type', 'http://frank.com:8001')
        response.write(`
        {
            "note":{
                "to": "小谷",
                "from": "方方",
                "heading":"打招呼",
                "content": "hi"
            }
        }
        `)
        response.end()
    } else {
        response.statusCode = 404
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        response.write(`你输入的路径不存在对应的内容`)
        response.end()
    }

    /******** 代码结束，下面不要看 ************/
})

function readBody(request) {
    return new Promise((resolve, reject) => {
        let body = []
        request.on('data', (chunk) => {
            body.push(chunk)
        }).on('end', () => {
            body = Buffer.concat(body).toString()
            resolve(body)
        })
    })
}
server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)