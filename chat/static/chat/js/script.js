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

	    if(elclass == ("send-message")){

	    	chat_id = id.substr(17)
	    	text = fields['message']

	    	send_message({'text':text, 'chat_id':chat_id})

	    	$('input[name="message"]').val('');
	    	
	    }
	});


	///
	/// Click topic
	///

	$(document).on('click', '.topic', function(){

		elclass = $(this).attr('class')
		id = $(this).attr('id')
		topic_id = id.substr(6)

		$.getJSON('/new-chat-window', {'id':topic_id}, function(data){

			string = data['chat-window']

			open_chat(data['chat-window'])
		})
	})


	///
	/// Click chat list item
	///

	$(document).on('click', '.chat-list-item', function(){
		id = $(this).attr('id')
		chat_id = id.substr(10)

		$(this).find('.new-message .new-message-dot').css('display', 'none')

		$.getJSON('/open-chat-window', {'id':chat_id}, function(data){
			string = data['chat-window']

			open_chat(data['chat-window'])

		})

	})

	$(document).on('click', '.close-chat', function(){
		chat_id = $(this).attr('name').substr(6)
		ind = $.inArray(chat_id.toString(), open_chats)
		if(ind == 0){
			// chat right
			$('.chat-right').remove()

			$('.chat-middle').addClass('chat-right')
			$('.chat-middle').removeClass('chat-middle')

			$('.chat-left').addClass('chat-middle')
			$('.chat-left').removeClass('chat-left')

			open_chats[0] = open_chats[1]
			open_chats[1] = open_chats[2]
			open_chats[2] = ''

			minimized_chats[0] = minimized_chats[1]
			minimized_chats[1] = minimized_chats[2]
			minimized_chats[2] = false
		} else if (ind == 1){
			// chat mid
			$('.chat-middle').remove()

			$('.chat-left').addClass('chat-middle')
			$('.chat-left').removeClass('chat-left')

			open_chats[1] = open_chats[2]
			open_chats[2] = ''

			minimized_chats[1] = minimized_chats[2]
			minimized_chats[2] = false
		} else if (ind == 2){
			// chat left
			$('.chat-left').remove()
			open_chats[2] = ''
			minimized_chats[2] = false
		}
	})

	$(document).on('click', '.minimize-chat', function(){
		chat_id = $(this).attr('name').substr(9)
		ind = $.inArray(chat_id.toString(), open_chats)

		if(ind == 0){
			// chat right
			if(minimized_chats[0]){
				$('.chat-right').css('bottom', '0px')
				minimized_chats[0] = false
			} else {
				$('.chat-right').css('bottom', '-370px')
				minimized_chats[0] = true
			}
			
			
		} else if (ind == 1){
			// chat mid
			if(minimized_chats[1]){
				$('.chat-middle').css('bottom', '0px')
				minimized_chats[1] = false
			} else {
				$('.chat-middle').css('bottom', '-370px')
				minimized_chats[1] = true
			}
		} else if (ind == 2){
			// chat left
			if(minimized_chats[2]){
				$('.chat-left').css('bottom', '0px')
				minimized_chats[2] = false
			} else {
				$('.chat-left').css('bottom', '-370px')
				minimized_chats[2] = true
			}
		}
	})


	get_topics()


	///
	/// Update chat every 2seconds
	///

	setInterval(recieve_messages, 2000);

})

chat_info = {}


open_columns = [true, true, true, true]

function get_topics(){
	$.getJSON('/get-topics', {}, function(data){

		topics = data['topics']

		for (ind in topics) {

			topic = topics[ind]

			$.getJSON('/topic-display', {'id': topic['id']}, function(data){

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


function open_chat(string){
	$newchat = $('<div/>').html(string).contents();

	ind = $.inArray($newchat[1]['id'].substr(5), open_chats)

	if(ind == -1){
		if (open_chats[0] == '') {
			$newchat.attr('class', "chat-window" + ' chat-right')
			open_chats[0] = $newchat[1]['id'].substr(5)

		} else if (open_chats[1] == '') {

			$newchat.attr('class', "chat-window" + ' chat-middle')
			open_chats[1] = $newchat[1]['id'].substr(5)

		} else if (open_chats[2] == '') {

			$newchat.attr('class', "chat-window" + ' chat-left')
			open_chats[2] = $newchat[1]['id'].substr(5);

		} else {

			$('.chat-left').remove()
			$newchat.attr('class', "chat-window" + ' chat-left')
			open_chats[2] = $newchat[1]['id'].substr(5);

		}
		$('.chat-bar').append($newchat)
	}
	

}

//
// Chat control
//

open_chats = ['', '', '']
minimized_chats = [false, false, false]

function send_message(message){
	$.getJSON("/new-message", message)

	$item_copy = $('#chat-list-' + chat_id)
	$('#chat-list-' + chat_id).remove()
	$('#chat-list').prepend($item_copy)

	open_ind = $.inArray(message['chat_id'], open_chats)

	if(open_ind != -1){
		add_message(open_ind, text, true)
	}

}

function recieve_messages(){
	$.getJSON("/recieve-messages", {}, function(data){
		messages = data['messages']

		for(i=0; i<messages.length; ++i){

			message = messages[i]
			text = message['text']
			chat_id = message['chat_id']

			$item_copy = $('#chat-list-' + chat_id)
			$item_copy.find('.new-message .new-message-dot').css('display', 'block')
			$('#chat-list-' + chat_id).remove()
			$('#chat-list').prepend($item_copy)


			open_ind = $.inArray(chat_id.toString(), open_chats)

			if(open_ind != -1){
				add_message(open_ind, text, false)
			}
		}
	})
}

function add_message(ind, text, sent){

	if (sent) {
		cl = 'sent-message'
	} else {
		cl = 'recieved-message'
	}

	$message = $('<div/>').html('<div class="message"><div class="' + cl + '"><p>' + text + '</p></div></div>').contents()

	if(ind == 0){
		console.log('hey')
		// chat right
		$('.chat-right .chat-log').append($message)
	} else if (ind == 1){
		// chat mid
		$('.chat-middle .chat-log').append($message)
	} else if (ind == 2){
		// chat left
		$('.chat-left .chat-log').append($message)
	}
}
