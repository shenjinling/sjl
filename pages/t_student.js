function render_list(list) {
    var tbody =  $("#list-tbody").empty();
    for (i in list) { 
        var t_student = list[i];

        var row = $('<tr>');
        $('<td>').text(t_student['cno']).appendTo(row);
        $('<td>').text(t_student['cname']).appendTo(row);
        $('<td>').text(t_student['sno']).appendTo(row);
        $('<td>').text(t_student['sname']).appendTo(row);
        row.appendTo(tbody);
    }
}
function load_list() {
	$.ajax({
        type: 'GET',
  		url: "/t_student/",
        data: '',
        dataType: 'json' 
	})
    .done(function(data) {
        render_list(data);
    });
}

//URL编码
function get_details(tno) {
  $.ajax({ 
    type: 'get', 
    url: '/subscriptions/' + id,
    data: "subscription[title]=" + encodeURI(value),
    dataType: 'script' 
 	}); 
}

function search_t_student() {
    var cno = $('#t_student-frm input[name="cno"]').val();
    var url='/t_student/'+cno;
    $.ajax({ 
        type: 'GET', 
        url:url,
        data: '',
        dataType: 'json' 
    })
        .done(function(){
            load_list1(cno);
        });
}

function load_list1(cno) {
	$.ajax({
        type: 'GET',
  		url: "/t_student/"+cno,
        data: '',
        dataType: 'json' 
	})
    .done(function(data) {
        render_list(data);
    });
}
//----------------------------------------------------
$(document).ready(function() {
    $( "#btn-refresh" ).on( "click", load_list);
    $( "#btn-search" ).on( "click", search_t_student);
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