var value = 0;
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
			$(".movable").each(function(){
				let x = $( this ).css("top");
				let valx = parseInt($( "#menu_container" ).height());
				let xx = parseInt(x.substring(0, x.length - 2)) + valx;
				
				value = valx;
				$( this ).css({top: xx });
			});
		}else{
			button.addClass("hidden");
			$(".movable").each(function(){
				let x1 = $( this ).css("top");
				let valx1 = parseInt($( "#menu_container" ).height());
				let xx1 = parseInt(x1.substring(0, x1.length - 2)) - value;
				
				$( this ).css({top: xx1 });
			});
		}
		
	}
	
});
