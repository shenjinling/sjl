
function render_list(list) {
    var tbody =  $("#list-tbody").empty();
    for (i in list) {
        var course = list[i];

        var row = $('<tr>');
        $('<td>').text(course['cno']).appendTo(row);
        $('<td>').text(course['cname']).appendTo(row);
        $('<td>').text(course['ccredit']).appendTo(row);

        var btn_edit = $('<button>')
            .text('修改')
            .on( "click", (function(course) {
                return function( event ) {
                    var cno = course['cno'];
                    console.log('edit: ' + cno);
                    edit_course(cno);
                }
            })(course));

        var btn_del = $('<button>')
            .text('删除')
            .on( "click", (function(item) { 
                return function( event ) {
                    delete_course(item['cno']);
                }
            })(course));

        $('<td>').append(btn_edit).append(btn_del).appendTo(row);


        row.appendTo(tbody);
    }
}

function load_list() {
	$.ajax({
        type: 'GET',
  		url: "/course/",
        data: '',
        dataType: 'json' 
	})
    .done(function(data) {
        render_list(data);
    });
}

function get_details(cno) {
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

function edit_course(cno) {
    function put_course() {
        var item = {};
        var cno = $('#frm-course input[name="cno"]').val();
        item['cno'] = cno;
        item['cname'] = $('#frm-course input[name="cname"]').val();
        item['ccredit'] = $('#frm-course input[name="ccredit"]').val();
        var jsondata = JSON.stringify(item);
        $.ajax({ 
            type: 'PUT', 
            url: '/course/' + cno,
            data: jsondata,
            dataType: 'json' 
        })
        .done(function(){
            load_list();
            $('#dlg-course-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    }

    $.ajax({ 
        type: 'GET', 
        url: '/course/' + cno,
        dataType: 'json' 
    })
    .then(function(item) {
        $('#frm-course input[name="cno"]').val(item['cno']);
        $('#frm-course input[name="cname"]').val(item['cname']);
        $('#frm-course input[name="ccredit"]').val(item['ccredit']);
    
        $('#frm-course').off('submit').on('submit', put_course);
        $('#frm-course input:submit').val('修改')
        $('#dlg-course-form').show()
    }); 

}


function random_create_course() {
	var rand = Math.floor((Math.random()*1000000)+1000000);
	var req_data = {
		name: "测试-" + rand,
		no: "S#R" + rand
	};

	$.ajax({ 
    	type: 'POST', 
    	url: '/course/',
    	data: JSON.stringify(req_data),
    	dataType: 'json',
 	})
    .done(function(data) {
        load_list();
    }); 

}


function register_course() {
    // 因为新添和修改都使用和这个表单，因此需要置空这个表单
    $('#frm-course input[name="cno"]').val('');
    $('#frm-course input[name="cname"]').val('');
    $('#frm-course input[name="ccredit"]').val('');



    

    $('#frm-course input:submit').val('新增')
    // 要先把前面事件处理取消掉，避免累积重复事件处理
    $('#frm-course').off('submit').on('submit', function() {
        var item = {};
        item['cno'] = $('#frm-course input[name="cno"]').val();
        item['cname'] = $('#frm-course input[name="cname"]').val();
        item['ccredit'] = $('#frm-course input[name="ccredit"]').val();
        
        $.ajax({ 
            type: 'POST', 
            url: '/course/',
            data: JSON.stringify(item),
            dataType: 'json' 
        })
        .done(function(){
            load_list();
            $('#dlg-course-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    });
    $('#dlg-course-form').show()
}


function delete_course(cno) {
    $.ajax({
        type: 'DELETE',
        url: '/course/' + cno,
        dataType: 'html'
    })
    .done(function() {
        load_list();
    });
}

//----------------------------------------------------
$(document).ready(function() {
	
    $( "#btn-radd" ).on( "click", function( event ) {
        random_create_course();
    });
    $( "#btn-refresh" ).on( "click", load_list);
    $( "#btn-new" ).on( "click", register_course);
    $( "#btn-course-frm-close" ).on( "click", function() {
        // 在关闭浏览器时，可能会自动提交，需要设置一个空提交方法。
        $('#frm-course').off('submit').on('submit', function() {
            return false;
        });
        $('#dlg-course-form').hide();
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