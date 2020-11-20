//写入数据
function render_list(list) {
    var tbody =  $("#list-tbody").empty();
    for (i in list) {
        var tmission = list[i];

        var row = $('<tr>');
        $('<td>').text(tmission['tm_cno']).appendTo(row);
        $('<td>').text(tmission['cname']).appendTo(row);
        $('<td>').text(tmission['tname']).appendTo(row);
        $('<td>').text(tmission['tmtime']).appendTo(row);
        $('<td>').text(tmission['tmplace']).appendTo(row);
        $('<td>').text(tmission['tmweek']).appendTo(row);

        var btn_edit = $('<button>')
            .text('修改')
            .on( "click", (function(tmission) {
                return function( event ) {
                    var tmn = tmission['tmn'];
                    console.log('edit: '+ tmn );
                    edit_tmission(tmn);
                }
            })(tmission));

        var btn_del = $('<button>')
            .text('删除')
            .on( "click", (function(item) { 
                return function( event ) {
                    delete_tmission(item['tmn']);
                }
            })(tmission));

        $('<td>').append(btn_edit).append(btn_del).appendTo(row);
        row.appendTo(tbody);
    }
}


//刷新页面
function load_list() {
	$.ajax({
        type: 'GET',
  		url: "/tmission/",
        data: '',
        dataType: 'json' 
	})
    .done(function(data) {
        render_list(data);
    });
}


//URL
function get_details( tmn) {
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

//修改
function edit_tmission(tmn) {
   
    //点击修改执行
    function put_tmission() {
        var item = {};
        var tmn = $('#frm-tmission input[name="tmn"]').val();
        var tm_cno = $('#frm-tmission input[name="tm_cno"]').val();
        item['tmn'] =tmn;
        item['tm_cno'] = tm_cno;
        item['tm_tno'] = $('#frm-tmission input[name="tm_tno"]').val();
        item['tmtime'] = $('#frm-tmission input[name="tmtime"]').val();
        item['tmplace'] = $('#frm-tmission input[name="tmplace"]').val();
        item['tmweek'] = $('#frm-tmission input[name="tmweek"]').val();
        var jsondata = JSON.stringify(item);
        $.ajax({ 
            type: 'PUT', 
            url: '/tmission/'+tmn,
            data: jsondata,
            dataType: 'json' 
        })
        .done(function(){
            load_list1(tm_cno);
            $('#dlg-tmission-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    }

    $.ajax({ 
        type: 'GET', 
        url: '/tmission/' + tmn,
        dataType: 'json' 
    })
    .then(function(item) {
        $('#frm-tmission input[name="tmn"]').val(item['tmn']);
        $('#frm-tmission input[name="tm_cno"]').val(item['tm_cno']);
        $('#frm-tmission input[name="tm_tno"]').val(item['tm_tno']);
        $('#frm-tmission input[name="tmtime"]').val(item['tmtime']);
        $('#frm-tmission input[name="tmplace"]').val(item['tmplace']);
        $('#frm-tmission input[name="tmweek"]').val(item['tmweek']);
        $('#frm-tmission').off('submit').on('submit', put_tmission);
        $('#frm-tmission input:submit').val('修改')
        $('#dlg-tmission-form').show()
    }); 
}


//增加
function register_tmission() {
    // 因为新添和修改都使用和这个表单，因此需要置空这个表单
    $('#frm-tmission input[name="tmn"]').val('');
    $('#frm-tmission input[name="tm_cno"]').val('');
    $('#frm-tmission input[name="tm_tno"]').val('');
    $('#frm-tmission input[name="tmtime"]').val('');
    $('#frm-tmission input[name="tmplace"]').val('');
    $('#frm-tmission input[name="tmweek"]').val('');

    $('#frm-tmission input:submit').val('新增')
    // 要先把前面事件处理取消掉，避免累积重复事件处理
    $('#frm-tmission').off('submit').on('submit', function() {
        var item = {};
        item['tmn'] = $('#frm-tmission input[name="tmn"]').val('');
        item['tm_cno'] = $('#frm-tmission input[name="tm_cno"]').val();
        item['tm_tno'] = $('#frm-tmission input[name="tm_tno"]').val();
        item['tmtime'] = $('#frm-tmission input[name="tmtime"]').val();
        item['tmplace'] = $('#frm-tmission input[name="tmplace"]').val();
        item['tmweek'] = $('#frm-tmission input[name="tmweek"]').val();
        
        $.ajax({ 
            type: 'POST', 
            url: '/tmission/',
            data: JSON.stringify(item),
            dataType: 'json' 
        })
        .done(function(){
            load_list();
            $('#dlg-tmission-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    });
    $('#dlg-tmission-form').show()
}


//删除
function delete_tmission(tmn) {
    $.ajax({
        type: 'DELETE',
        url: '/tmission/' + tmn,
        dataType: 'html'
    })
    .done(function() {
        load_list();
    });
}

//搜索
function search_tmission() {
    var tmn = $('#tmission-frm input[name="tmn"]').val();
    var url='/tmission/'+tmn;
    $.ajax({ 
        type: 'GET', 
        url:url,
        data: '',
        dataType: 'json' 
    })
        .done(function(){
            load_list1(tmn);
        });
}

function load_list1(tmn) {
	$.ajax({
        type: 'GET',
  		url: "/tmission/"+tmn,
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
    $( "#btn-search" ).on( "click", search_tmission);
    $( "#btn-new" ).on( "click", register_tmission);
    $( "#btn-tmission-frm-close" ).on( "click", function() {
        // 在关闭浏览器时，可能会自动提交，需要设置一个空提交方法。
        $('#frm-tmission').off('submit').on('submit', function() {
            return false;
        });
        $('#dlg-tmission-form').hide();
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
