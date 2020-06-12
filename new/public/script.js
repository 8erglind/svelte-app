$('a[href^="#"]').click(function( ) {
	$('html, body').animate({
	  'scrollLeft': $('[name="' + $.attr(this, 'href').substr(1) + '"]').offset().left
	}, 500);

	return false;
});