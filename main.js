myButton.addEventListener('click',function(e){
    var request = new XMLHttpRequest()
    request.onreadystatechange = function(){
        if(request.readyState === 4){
            if(request.status >=200 && request.status < 300){
                let string = request.responseText
                let object = window.JSON.parse(string)
                console.log(object.note)
            }else if(request.readyState >= 400){
                console.log('fail')
            }
        }
     
    }
    request.open('GET','/xxx')
    request.send()
})