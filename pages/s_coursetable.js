function render_list(list) {
    var tbody =  $("#list-tbody").empty();
    for (i in list) {
        var s_coursetable = list[i];

        var row = $('<tr>');
        $('<td>').text(s_coursetable['cname']).appendTo(row);
        $('<td>').text(s_coursetable['tname']).appendTo(row);
        $('<td>').text(s_coursetable['tmtime']).appendTo(row);
        $('<td>').text(s_coursetable['tmplace']).appendTo(row);
        $('<td>').text(s_coursetable['tmweek']).appendTo(row);
        $('<td>').text(s_coursetable['pterm']).appendTo(row);
        row.appendTo(tbody);
    }
}

function load_list() {
	$.ajax({
        type: 'GET',
  		url: "/s_coursetable/",
        data: '',
        dataType: 'json' 
	})
    .done(function(data) {
        render_list(data);
    });
}


//URL编码
function get_details(sno) {
  $.ajax({ 
    type: 'get', 
    url: '/subscriptions/' + id,
    data: "subscription[title]=" + encodeURI(value),
    dataType: 'script' 
 	}); 
}
//----------------------------------------------------
$(document).ready(function() {
    load_list();
});

//---设置AJAX缺省的错误处理方式
//---有时需要禁止全局错误处理时，可以在调用ajax时增添{global: false}禁止
$(document).ajaxError(function(event, jqxhr, settings, exception) {
    var msg = jqxhr.status + ': ' + jqxhr.statusText + "\n\n";
    if (jqxhr.status == 404 || jqxhr.status == 405 ) { 
        msg += "访问REST资源时，URL错误或该资源的请求方法\n\n"
        msg += settings.type + '  ' + settings.url  
    } else {
        msg += jqxhr.responseText;
    }
    alert(msg);
});