$(document).ready(function(){

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

})