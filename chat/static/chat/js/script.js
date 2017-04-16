$(document).ready(function(){

	///
	/// Form submission
	///

	$(document).delegate('form', 'submit', function(event) {

		event.preventDefault()
	    $form = $(this);

	    fields = {};

	    id = $form.attr('id');
	    elclass = $form.attr('class')
	    fields['id'] = id
	    fields['class'] = elclass

		$form.find(":input").each(function() {
			fields[this.name] = $(this).val();
		});


		///
		/// Register
		///

		if(id === "register_form"){
			$.getJSON('/register', fields, function(data){

				// Username taken
				if(data['taken']){
					$('#username_taken').css('display', 'initial')
				} else {
					$('#username_taken').css('display', 'none')
				}

				// Passwords don't match
				if(!data['match']){
					$('#passwords_unmatched').css('display', 'initial')
				} else {
					$('#passwords_unmatched').css('display', 'none')
				}

				// Good job
				if(!data['taken'] && data['match']){
					location.reload()
				}
			});
		}

	    
	    ///
	    /// Log in
	    ///

	    if(id == "login_form"){
	    	$.getJSON('/login', fields, function(data){
				if(data['success']){
					location.reload();
				}else{
					$('#invalid').css('display','initial')
				}
			});
	    }


	    ///
	    /// Topic proposal
	    ///

	    if(id == "topic-proposal"){
	    	$.getJSON('/new-topic', fields, function(data){
	    		 $('input[name="new-topic"]').val('');
			});
	    }


	    ///
	    /// Sent chat
	    ///

	    if(id && id.startsWith("send-new-chat")){
	    	fields['id'] = id.substr(14)
	    	chat_pos = $(this).parent().attr('id')
	    	$.getJSON('/new-chat', fields, function(data){
	    		$("#" + chat_pos).replaceWith(data['chat-window'])
	    	})
	    }
	});


	///
	/// Click topic
	///

	open_chats = [true, true, true]
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


	get_topics()


	///
	/// Update chat every 5 seconds
	///

	update_chats()
	setInterval(update_chats, 5000);

})



function update_chats(){ 
    $.getJSON('/update-chats', function(data){
    	
    })  
}

open_columns = [true, true, true, true]

function get_topics(){
	$.getJSON('/get-topics', {}, function(data){

		topics = data['topics']

		for (topic_id in topics) {

			$.getJSON('/topic-display', {'id': topic_id}, function(data){

					for(col = 0; col < 4; col++){
						if(col == 3){
							open_columns = [true, true, true, true]
							break
						} else if (open_columns[col]) {
							open_columns[col] = false
							break
						}
					}

				$('.topics-col:nth-child(' + (col+1) + ')').append(data['topic-display'])
			})
		}
	})
}

