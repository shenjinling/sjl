
function render_list(list) {
    var tbody =  $("#list-tbody").empty();
    for (i in list) {
        var teacher = list[i];

        var row = $('<tr>');
        $('<td>').text(teacher['tno']).appendTo(row);
        $('<td>').text(teacher['tname']).appendTo(row);
        $('<td>').text(teacher['tsex']).appendTo(row);
        $('<td>').text(teacher['ttitle']).appendTo(row);

        var btn_edit = $('<button>')
            .text('修改')
            .on( "click", (function(teacher) {
                return function( event ) {
                    var tno = teacher['tno'];
                    console.log('edit: ' + tno);
                    edit_teacher(tno);
                }
            })(teacher));

        var btn_del = $('<button>')
            .text('删除')
            .on( "click", (function(item) { 
                return function( event ) {
                    delete_teacher(item['tno']);
                }
            })(teacher));

        $('<td>').append(btn_edit).append(btn_del).appendTo(row);


        row.appendTo(tbody);
    }
}

function load_list() {
	$.ajax({
        type: 'GET',
  		url: "/teacher/",
        data: '',
        dataType: 'json' 
	})
    .done(function(data) {
        render_list(data);
    });
}

function get_details(tno) {
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

function edit_teacher(tno) {
    function put_teacher() {
        var item = {};
        var tno = $('#frm-teacher input[name="tno"]').val();
        item['tno'] = tno;
        item['tname'] = $('#frm-teacher input[name="tname"]').val();
        item['tsex'] = $('#frm-teacher input[name="tsex"]').val();
        item['ttitle'] = $('#frm-teacher input[name="ttitle"]').val();
        var jsondata = JSON.stringify(item);
        $.ajax({ 
            type: 'PUT', 
            url: '/teacher/' + tno,
            data: jsondata,
            dataType: 'json' 
        })
        .done(function(){
            load_list();
            $('#dlg-teacher-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    }

    $.ajax({ 
        type: 'GET', 
        url: '/teacher/' + tno,
        dataType: 'json' 
    })
    .then(function(item) {
        $('#frm-teacher input[name="tno"]').val(item['tno']);
        $('#frm-teacher input[name="tname"]').val(item['tname']);
        $('#frm-teacher input[name="tsex"]').val(item['tsex']);
        $('#frm-teacher input[name="ttitle"]').val(item['ttitle']);

        $('#frm-teacher').off('submit').on('submit', put_teacher);
        $('#frm-teacher input:submit').val('修改')
        $('#dlg-teacher-form').show()
    }); 

}


function random_create_teacher() {
	var rand = Math.floor((Math.random()*1000000)+1000000);
	var req_data = {
		name: "测试-" + rand,
		no: "S#R" + rand
	};

	$.ajax({ 
    	type: 'POST', 
    	url: '/student/',
    	data: JSON.stringify(req_data),
    	dataType: 'json',
 	})
    .done(function(data) {
        load_list();
    }); 

}


function register_teacher() {
    // 因为新添和修改都使用和这个表单，因此需要置空这个表单
    $('#frm-teacher input[name="tno"]').val('');
    $('#frm-teacher input[name="tname"]').val('');
    $('#frm-teacher input[name="tsex"]').val('');
    $('#frm-teacher input[name="ttitle"]').val('');


    

    $('#frm-teacher input:submit').val('新增')
    // 要先把前面事件处理取消掉，避免累积重复事件处理
    $('#frm-teacher').off('submit').on('submit', function() {
        var item = {};
        item['tno'] = $('#frm-teacher input[name="tno"]').val();
        item['tname'] = $('#frm-teacher input[name="tname"]').val();
        item['tsex'] = $('#frm-teacher input[name="tsex"]').val();
        item['ttitle'] = $('#frm-teacher input[name="ttitle"]').val();
        
        $.ajax({ 
            type: 'POST', 
            url: '/teacher/',
            data: JSON.stringify(item),
            dataType: 'json' 
        })
        .done(function(){
            load_list();
            $('#dlg-teacher-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    });
    $('#dlg-teacher-form').show()
}


function delete_teacher(tno) {
    $.ajax({
        type: 'DELETE',
        url: '/teacher/' + tno,
        dataType: 'html'
    })
    .done(function() {
        load_list();
    });
}

//----------------------------------------------------
$(document).ready(function() {
	
    $( "#btn-radd" ).on( "click", function( event ) {
        random_create_teacher();
    });
    $( "#btn-refresh" ).on( "click", load_list);
    $( "#btn-new" ).on( "click", register_teacher);
    $( "#btn-teacher-frm-close" ).on( "click", function() {
        // 在关闭浏览器时，可能会自动提交，需要设置一个空提交方法。
        $('#frm-teacher').off('submit').on('submit', function() {
            return false;
        });
        $('#dlg-teacher-form').hide();
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