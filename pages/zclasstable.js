$(document).ready(function(){
    $("td").each(function(){
        var a = $(this).text();
        if( a ){
            $(this).addClass("exsist");   
        };
    });

    $(".exsist").each(function(){
        $(this).html($(this).text().replace(/#/ig, "<br />"));    
    });
         
});

