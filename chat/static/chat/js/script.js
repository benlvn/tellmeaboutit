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

	})

	get_topics()

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
		console.log("hello")
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
	/// Hide topic
	///

	$("input[name^='toggle-topic']").click(function(){
		id = $(this).attr('name').substr(13)
		$.getJSON('/toggle-topic', {'id':id}, function(data){
			location.reload()
		})
	})

	///
	/// Send message
	///

	$(document).delegate('form', 'submit', function(event) {
		event.preventDefault()
	    var $form = $(this);
	    var id = $form.attr('id');
	    var elclass = $form.attr('class')
	    var fields = {};

	    fields['id'] = id
	    fields['class'] = elclass

		$form.find(":input").each(function() {
			fields[this.name] = $(this).val();
		});
	    

	    if(id && id.startsWith("newmessage")){
	    	fields['id'] = id.substr(11)
	    	$.getJSON('/newmessage', fields, function(data){
	    		$("#chat-window-"+id).replaceWith(data['chat-window'])
	    	})
	    }

	    if(id == "login_form"){
	    	$.getJSON('/checklogin', fields, function(data){
				if(data['success']){
					location.reload();
				}else{
					$('#invalid').css('display','initial')
				}
			});
	    }

	    if(id && id.startsWith("send-new-chat")){
	    	fields['id'] = id.substr(14)
	    	chat_pos = $(this).parent().attr('id')
	    	$.getJSON('/newchat', fields, function(data){
	    		$("#" + chat_pos).replaceWith(data['chat-window'])
	    	})
	    }
	});


	///
	/// Click topic
	///

	$(document).on('click', '.topic', function(){	
		id = $(this).attr('id').substr(6)
		$.getJSON('/newchat-window', {'id':id}, function(data){
			string = data['chat-window']
			$newchat = $('<div/>').html(string).contents();
			if (open_chats[0]) {
				$newchat.attr('id', 'chat-right')
				open_chats[0] = false
			} else if (open_chats[1]) {
				$newchat.attr('id', 'chat-middle')
				open_chats[1] = false
			} else if (open_chats[2]) {
				$newchat.attr('id', 'chat-left')
				open_chats[2] = false;
			} else {
				$('#chat-left').remove()
				$newchat.attr('id', 'chat-left')
			}
			$('.chat-bar').append($newchat)
		})
	})

	open_chats = [true, true, true]






	///
	/// Update chat every 5 seconds
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

function get_topics(){
	$.getJSON('/get-topics', {}, function(data){
		topics = data['topics']
		for (var i=0; i < topics.length; ++i) {
			topic_id = topics[i]['id']

			info = {'id' : topic_id,
					'col' : (i%4 + 1)}

			$.getJSON('/topic-display', info, function(data){
				$('.topics-col:nth-child(' + data['col'] + ')').append(data['topic-display'])
			})
			last_i = i
		}
	})
}

