function render_list(list) {
    var tbody =  $("#list-tbody").empty();
    for (i in list) {
        var t_grade = list[i];
        var row = $('<tr>');
        $('<td>').text(t_grade['g_cno']).appendTo(row);
        $('<td>').text(t_grade['cname']).appendTo(row);
        $('<td>').text(t_grade['g_sno']).appendTo(row);
        $('<td>').text(t_grade['sname']).appendTo(row);
        $('<td>').text(t_grade['grade']).appendTo(row);

        var btn_edit = $('<button>')
            .text('修改')
            .on( "click", (function(t_grade) {
                return function( event ) {
                    var gn = t_grade['gn'];
                    console.log('edit: '+ gn);
                    edit_t_grade(gn);
                }
            })(t_grade));
        $('<td>').append(btn_edit).appendTo(row);
        row.appendTo(tbody);
    }
}

function load_list() {
	$.ajax({
        type: 'GET',
  		url: "/t_grade/",
        data: '',
        dataType: 'json' 
	})
    .done(function(data) {
        render_list(data);
    });
}

function get_details(gn) {
  $.ajax({ 
    type: 'GET', 
    url: '/subscriptions/' + id,
    data: "subscription[title]=" + encodeURI(value),
    dataType: 'script' 
 	}); 
 
$.ajax({ 
type: 'PUT', 
url: '/subscriptions/' + id,
data: "subscription[title]=" + encodeURI(value),
dataType: 'script' 
}); 
}

function edit_t_grade(gn) {
    function put_t_grade() {
        var item = {};
        var gn = $('#frm-t_grade input[name="gn"]').val();
        var g_cno = $('#frm-t_grade input[name="g_cno"]').val();
        item['gn'] = gn;
        item['g_cno'] = $('#frm-t_grade input[name="g_cno"]').val();
        item['g_sno'] = $('#frm-t_grade input[name="g_sno"]').val();
        item['grade'] = $('#frm-t_grade input[name="grade"]').val();
        var jsondata = JSON.stringify(item);
        $.ajax({ 
            type: 'PUT', 
            url: '/t_grade/' + gn,
            data: jsondata,
            dataType: 'json' 
        })
        .done(function(){
            load_list1(g_cno);
            $('#dlg-t_grade-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    }

    $.ajax({ 
        type: 'GET', 
        url: '/t_grade/' + gn,
        dataType: 'json' 
    })
    .then(function(item) {
        $('#frm-t_grade input[name="gn"]').val(item['gn']);
        $('#frm-t_grade input[name="g_cno"]').val(item['g_cno']);
        $('#frm-t_grade input[name="g_sno"]').val(item['g_sno']);
        $('#frm-t_grade input[name="grade"]').val(item['grade']);

        $('#frm-t_grade').off('submit').on('submit', put_t_grade);
        $('#frm-t_grade input:submit').val('修改')
        $('#dlg-t_grade-form').show()
    }); 
}
function search_t_grade() {
    var gn = $('#t_grade-frm input[name="gn"]').val();
    var url='/t_grade/'+gn;
    $.ajax({ 
        type: 'GET', 
        url:url,
        data: '',
        dataType: 'json' 
    })
        .done(function(){
            load_list1(gn);
        });
}

function load_list1(gn) {
	$.ajax({
        type: 'GET',
  		url: "/t_grade/"+gn,
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
    $( "#btn-search" ).on( "click", search_t_grade);
    $( "#btn-t_grade-frm-close" ).on( "click", function() {
        // 在关闭浏览器时，可能会自动提交，需要设置一个空提交方法。
        $('#frm-t_grade').off('submit').on('submit', function() {
            return false;
        });
        $('#dlg-t_grade-form').hide();
    });

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