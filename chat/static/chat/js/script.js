$(document).ready(function(){

	///
	/// Login form submission
	///

	$('#login_form').submit(function(){
		event.preventDefault()

		var fields = {};
		$('#login_form').find(":input").each(function() {
			fields[this.name] = $(this).val();
		});
		
		$.getJSON('/checklogin', fields, function(data){
			if(data['success']){
				location.reload();
			}else{
				$('#invalid').css('display','initial')
			}
		});

	})


	///
	/// Register form submission
	///

	$('#register_form').submit(function(){
		event.preventDefault()

		var fields = {};
		$('#register_form').find(":input").each(function() {
			fields[this.name] = $(this).val();
		});
		
		$.getJSON('/register', fields, function(data){
			if(data['taken']){
				$('#username_taken').css('display', 'initial')
			} else {
				$('#username_taken').css('display', 'none')
			}
			if(!data['match']){
				$('#passwords_unmatched').css('display', 'initial')
			} else {
				$('#passwords_unmatched').css('display', 'none')
			}
			if(!data['taken'] && data['match']){
				location.reload()
			}
		});

	})


	///
	/// Topic proposal
	///

	$('#topic-proposal').submit(function(){
		event.preventDefault()
		var fields = {};
		$('#topic-proposal').find(":input").each(function() {
			fields[this.name] = $(this).val();
		});


		$.getJSON('/newtopic', fields, function(data){
			location.reload()
		});
	})


	///
	/// Start new chat
	///

	$("input[name^='newchat']").click(function(){
		id = $(this).attr('name').substr(8)
		$.getJSON('/newchat', {'id':id}, function(data){
			$('#chatbar').append(data['chat-window'])
		})
	})

	///
	/// Send message
	///
	/*
	$("#chatbar").on('submit', function(){
		event.preventDefault()
		$form = $("form[id^='newmessage']")
		id = $form.attr('id').substr(11)

		var fields = {};
		$form.find(":input").each(function() {
			fields[this.name] = $(this).val();
		});
		fields['id'] = id
		$.getJSON('/newmessage', fields, function(data){
			$("#chat-window-" + id).replaceWith(data['chat-window'])

		});
	})
	*/
	$(document).delegate('form', 'submit', function(event) {
		event.preventDefault()
	    var $form = $(this);
	    var id = $form.attr('id');
	    var fields = {};
		$form.find(":input").each(function() {
			fields[this.name] = $(this).val();
		});
	    fields['id'] = id.substr(11)

	    if(id.startsWith("newmessage")){
	    	$.getJSON('/newmessage', fields, function(data){
	    		$("#chat-window-"+id).replaceWith(data['chat-window'])
	    	})
	    }
	});


	///
	/// Update chat every 2 seconds
	///

	update_chats()
	setInterval(update_chats, 5000);

})

function update_chats(){ 
	    $.getJSON('/updatechats', function(data){
	    	$('#chatbar').html("")
	    	for (ind in data['chat-windows']) {
	    		$('#chatbar').append(data['chat-windows'][ind])
	    	}
	    })  
	}