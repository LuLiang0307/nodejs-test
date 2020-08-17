window.jQuery = function() {}
window.jQuery.ajax = function(options) {
    let url
    if (arguments.length === 1) {
        url = options.url
    } else if (arguments.length === 2) {
        url = options[0].url
        options = options[1]
    }
    let method = options.method
    let body = options.body
    let successFn = options.successFn
    let failFn = options.failFn
    let headers = options.headers
    var request = new XMLHttpRequest()
    request.open(method, url)
    for (let key in headers) {
        let value = headers[key]
        request.setRequestHeader(key, value)
    }
    request.onreadystatechange = function() {
        if (request.readyState === 4) {
            if (request.status >= 200 && request.status < 300) {
                successFn.call(undefined, request.responseText)
            } else if (request.readyState >= 400) {
                failFn.call(undefined, request)
            }
        }

    }
    request.send(body)
}
window.$ = window.jQuery
myButton.addEventListener('click', function(e) {
    window.jQuery.ajax({
        method: 'POST',
        url: '/xxx',
        body: 'a=1&&b=2',
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'frank': '18'
        },
        successFn: (responseText) => { console.log(1) },
        failFn: (request) => { console.log(2) }
    })
})