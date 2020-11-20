function render_list(list) {
    var tbody =  $("#list-tbody").empty();
    for (i in list) {
        var major = list[i];

        var row = $('<tr>');
        $('<td>').text(major['mno']).appendTo(row);
        $('<td>').text(major['mname']).appendTo(row);

        var btn_edit = $('<button>')
            .text('修改')
            .on( "click", (function(major) {
                return function( event ) {
                    var mno = major['mno'];
                    console.log('edit: ' + mno);
                    edit_major(mno);
                }
            })(major));

        var btn_del = $('<button>')
            .text('删除')
            .on( "click", (function(item) { 
                return function( event ) {
                    delete_major(item['mno']);
                }
            })(major));

        $('<td>').append(btn_edit).append(btn_del).appendTo(row);


        row.appendTo(tbody);
    }
}

function load_list() {
	$.ajax({
        type: 'GET',
  		url: "/major/",
        data: '',
        dataType: 'json' 
	})
    .done(function(data) {
        render_list(data);
    });
}

function get_details(mno) {
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

function edit_major(mno) {
    function put_major() {
        var item = {};
        var mno = $('#frm-major input[name="mno"]').val();
        item['mno'] = mno;
        item['mname'] = $('#frm-major input[name="mname"]').val();
        var jsondata = JSON.stringify(item);
        $.ajax({ 
            type: 'PUT', 
            url: '/major/' + mno,
            data: jsondata,
            dataType: 'json' 
        })
        .done(function(){
            load_list();
            $('#dlg-major-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    }

    $.ajax({ 
        type: 'GET', 
        url: '/major/' + mno,
        dataType: 'json' 
    })
    .then(function(item) {
        $('#frm-major input[name="mno"]').val(item['mno']);
        $('#frm-major input[name="mname"]').val(item['mname']);

        $('#frm-major').off('submit').on('submit', put_major);
        $('#frm-major input:submit').val('修改')
        $('#dlg-major-form').show()
    }); 

}


function random_create_major() {
	var rand = Math.floor((Math.random()*1000000)+1000000);
	var req_data = {
		name: "测试-" + rand,
		no: "S#R" + rand
	};

	$.ajax({ 
    	type: 'POST', 
    	url: '/major/',
    	data: JSON.stringify(req_data),
    	dataType: 'json',
 	})
    .done(function(data) {
        load_list();
    }); 

}


function register_major() {
    // 因为新添和修改都使用和这个表单，因此需要置空这个表单
    $('#frm-major input[name="mno"]').val('');
    $('#frm-major input[name="mname"]').val('');


    $('#frm-major input:submit').val('新增')
    // 要先把前面事件处理取消掉，避免累积重复事件处理
    $('#frm-major').off('submit').on('submit', function() {
        var item = {};
        item['mno'] = $('#frm-major input[name="mno"]').val();
        item['mname'] = $('#frm-major input[name="mname"]').val();
        
        $.ajax({ 
            type: 'POST', 
            url: '/major/',
            data: JSON.stringify(item),
            dataType: 'json' 
        })
        .done(function(){
            load_list();
            $('#dlg-major-form').hide()
        });

        return false; // 在AJAX下，不需要浏览器完成后续的工作。
    });
    $('#dlg-major-form').show()
}


function delete_major(mno) {
    $.ajax({
        type: 'DELETE',
        url: '/major/' + mno,
        dataType: 'html'
    })
    .done(function() {
        load_list();
    });
}

//----------------------------------------------------
$(document).ready(function() {
	
    $( "#btn-radd" ).on( "click", function( event ) {
        random_create_major();
    });
    $( "#btn-refresh" ).on( "click", load_list);
    $( "#btn-new" ).on( "click", register_major);
    $( "#btn-major-frm-close" ).on( "click", function() {
        // 在关闭浏览器时，可能会自动提交，需要设置一个空提交方法。
        $('#frm-major').off('submit').on('submit', function() {
            return false;
        });
        $('#dlg-major-form').hide();
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