
$( document ).ready(function() {
	var button = $("div.header");
    console.log( "ready!" );
	
	$(document).on('click','.nav_hamburger',function(){
		
		toggleMenu();
		
		
	});
	
	

	$(".nav_menu_item[href='#well']").click(function(event){
		//event.preventDefault();
		var page = $(this).attr("href");
		console.log(page);
		//stopper = 1;
		//$("#canvas").fadeOut();
		toggleMenu();
		
	});

	$(".nav_menu_item[href='#gauss']").click(function(event){
		//event.preventDefault();
		
		
		if(stopper != 0){
			var page = $(this).attr("href");
			console.log(page);
			//$("#canvas").fadeIn();
			stopper = 0;
			toggleMenu();
		}
		
		
	});
	
	
	function toggleMenu(){
		if(button.hasClass("hidden")){
			button.removeClass("hidden");
		}else{
			button.addClass("hidden");

		}
		
	}
	
});
