//写入数据
function render_list(list) {
    var tbody =  $("#list-tbody").empty();
    for (i in list) {
        var grade = list[i];
        var row = $('<tr>');
        $('<td>').text(grade['g_cno']).appendTo(row);
        $('<td>').text(grade['cname']).appendTo(row);
        $('<td>').text(grade['g_sno']).appendTo(row);
        $('<td>').text(grade['sname']).appendTo(row);
        $('<td>').text(grade['grade']).appendTo(row);
        var btn_edit = $('<button>')
            .text('修改')
            .on( "click", (function(grade) {
                return function( event ) {
                    var gn = grade['gn'];
                    console.log('edit: '+ gn );
                    edit_grade(gn);
                }
            })(grade));
        var btn_del = $('<button>')
            .text('删除')
            .on( "click", (function(item) { 
                return function( event ) {
                    delete_grade(item['gn']);
                }
            })(grade));

        $('<td>').append(btn_edit).append(btn_del).appendTo(row);
        row.appendTo(tbody);
    }
}


function load_list() {
	$.ajax({
        type: 'GET',
  		url: "/grade/",
        data: '',
        dataType: 'json' 
	})
    .done(function(data) {
        render_list(data);
    });
}



//URL
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


//修改
function edit_grade(gn) {
    //点击修改执行
    function put_grade() {
        var item = {};
        var gn = $('#frm-grade input[name="gn"]').val();
        var g_cno = $('#frm-grade input[name="g_cno"]').val();
        item['gn'] = gn;
        item['g_cno'] = g_cno
        item['g_sno'] = $('#frm-grade input[name="g_sno"]').val();
        item['grade'] = $('#frm-grade input[name="grade"]').val();
        var jsondata = JSON.stringify(item);
        $.ajax({ 
            type: 'PUT', 
            url: '/grade/'+gn,
            data: jsondata,
            dataType: 'json' 
        })
        .done(function(){
            load_list1(g_cno);
            $('#dlg-grade-form').hide()
        });
        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    }
    $.ajax({ 
        type: 'GET', 
        url: '/grade/'+gn,
        dataType: 'json' 
    })

    .then(function(item) {
        $('#frm-grade input[name="gn"]').val(item['gn']);
        $('#frm-grade input[name="g_cno"]').val(item['g_cno']);
        $('#frm-grade input[name="g_sno"]').val(item['g_sno']);
        $('#frm-grade input[name="grade"]').val(item['grade']);
        $('#frm-grade').off('submit').on('submit', put_grade);
        $('#frm-grade input:submit').val('修改')
        $('#dlg-grade-form').show()
    }); 
}



//增加
function register_grade() {
    // 因为新添和修改都使用和这个表单，因此需要置空这个表单
    $('#frm-grade input[name="gn"]').val('');
    $('#frm-grade input[name="g_cno"]').val('');
    $('#frm-grade input[name="g_sno"]').val('');
    $('#frm-grade input[name="grade"]').val('');

    $('#frm-grade input:submit').val('新增')
    // 要先把前面事件处理取消掉，避免累积重复事件处理
    $('#frm-grade').off('submit').on('submit', function() {
        var item = {};
        item['gn'] = $('#frm-grade input[name="gn"]').val('');
        item['g_cno'] = $('#frm-grade input[name="g_cno"]').val();
        item['g_sno'] = $('#frm-grade input[name="g_sno"]').val();
        item['grade'] = $('#frm-grade input[name="grade"]').val();
        
        $.ajax({ 
            type: 'POST', 
            url: '/grade/',
            data: JSON.stringify(item),
            dataType: 'json' 
        })
        .done(function(){
            load_list();
            $('#dlg-grade-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    });
    $('#dlg-grade-form').show()
}


//删除
function delete_grade(gn) {
    $.ajax({
        type: 'DELETE',
        url: '/grade/'+gn,
        dataType: 'html'
    })
    .done(function() {
        load_list();
    });
}

//搜索
function search_grade() {
    var gn = $('#grade-frm input[name="gn"]').val();
    var url='/grade/'+gn;
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
  		url: "/grade/"+gn,
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
    $( "#btn-search" ).on( "click", search_grade);
    $( "#btn-new" ).on( "click", register_grade);
    $( "#btn-grade-frm-close" ).on( "click", function() {
        // 在关闭浏览器时，可能会自动提交，需要设置一个空提交方法。
        $('#frm-grade').off('submit').on('submit', function() {
            return false;
        });
        $('#dlg-grade-form').hide();
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
