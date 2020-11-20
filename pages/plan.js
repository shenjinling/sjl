//写入数据
function render_list(list) {
    var tbody =  $("#list-tbody").empty();
    for (i in list) {
        var plan = list[i];

        var row = $('<tr>');
        $('<td>').text(plan['p_mno']).appendTo(row);
        $('<td>').text(plan['mname']).appendTo(row);
        $('<td>').text(plan['p_cno']).appendTo(row);
        $('<td>').text(plan['cname']).appendTo(row);
        $('<td>').text(plan['pterm']).appendTo(row);

        var btn_edit = $('<button>')
            .text('修改')
            .on( "click", (function(plan) {
                return function( event ) {
                    var pn = plan['pn'];
                    console.log('edit: '+ pn );
                    edit_plan(pn);
                }
            })(plan));

        var btn_del = $('<button>')
            .text('删除')
            .on( "click", (function(item) { 
                return function( event ) {
                    delete_plan(item['pn']);
                }
            })(plan));

        $('<td>').append(btn_edit).append(btn_del).appendTo(row);
        row.appendTo(tbody);
    }
}


//刷新页面
function load_list() {
	$.ajax({
        type: 'GET',
  		url: "/plan/",
        data: '',
        dataType: 'json' 
	})
    .done(function(data) {
        render_list(data);
    });
}


//URL
function get_details( pn) {
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
function edit_plan(pn) {
   
    //点击修改执行
    function put_plan() {
        var item = {};
        var pn = $('#frm-plan input[name="pn"]').val();
        var p_mno = $('#frm-plan input[name="p_mno"]').val();
        item['pn'] = pn;
        item['p_mno'] = p_mno;
        item['p_cno'] = $('#frm-plan input[name="p_cno"]').val();
        item['pterm'] = $('#frm-plan input[name="pterm"]').val();
        var jsondata = JSON.stringify(item);
        $.ajax({ 
            type: 'PUT', 
            url: '/plan/'+pn,
            data: jsondata,
            dataType: 'json' 
        })
        .done(function(){
            load_list1(p_mno);
            $('#dlg-plan-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    }

    $.ajax({ 
        type: 'GET', 
        url: '/plan/' + pn,
        dataType: 'json' 
    })
    .then(function(item) {
        $('#frm-plan input[name="pn"]').val(item['pn']);
        $('#frm-plan input[name="p_mno"]').val(item['p_mno']);
        $('#frm-plan input[name="p_cno"]').val(item['p_cno']);
        $('#frm-plan input[name="pterm"]').val(item['pterm']);
        $('#frm-plan').off('submit').on('submit', put_plan);
        $('#frm-plan input:submit').val('修改')
        $('#dlg-plan-form').show()
    }); 
}


//增加
function register_plan() {
    // 因为新添和修改都使用和这个表单，因此需要置空这个表单
    $('#frm-plan input[name="pn"]').val('');
    $('#frm-plan input[name="p_mno"]').val('');
    $('#frm-plan input[name="p_cno"]').val('');
    $('#frm-plan input[name="pterm"]').val('');

    $('#frm-plan input:submit').val('新增')
    // 要先把前面事件处理取消掉，避免累积重复事件处理
    $('#frm-plan').off('submit').on('submit', function() {
        var item = {};
        var p_mno = $('#frm-plan input[name="p_mno"]').val();
        item['pn'] = $('#frm-plan input[name="pn"]').val('');
        item['p_mno'] = $('#frm-plan input[name="p_mno"]').val();
        item['p_cno'] = $('#frm-plan input[name="p_cno"]').val();
        item['pterm'] = $('#frm-plan input[name="pterm"]').val();
        
        $.ajax({ 
            type: 'POST', 
            url: '/plan/',
            data: JSON.stringify(item),
            dataType: 'json' 
        })
        .done(function(){
            load_list();
            $('#dlg-plan-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    });
    $('#dlg-plan-form').show()
}


//删除
function delete_plan(pn) {
    $.ajax({
        type: 'DELETE',
        url: '/plan/' + pn,
        dataType: 'html'
    })
    .done(function() {
        load_list();
    });
}

//搜索
function search_plan() {
    var pn = $('#plan-frm input[name="pn"]').val();
    var url='/plan/'+pn;
    $.ajax({ 
        type: 'GET', 
        url:url,
        data: '',
        dataType: 'json' 
    })
        .done(function(){
            load_list1(pn);
        });
}


function load_list1(pn) {
	$.ajax({
        type: 'GET',
  		url: "/plan/"+pn,
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
    $( "#btn-search" ).on( "click", search_plan);
    $( "#btn-new" ).on( "click", register_plan);
    $( "#btn-plan-frm-close" ).on( "click", function() {
        // 在关闭浏览器时，可能会自动提交，需要设置一个空提交方法。
        $('#frm-plan').off('submit').on('submit', function() {
            return false;
        });
        $('#dlg-plan-form').hide();
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
