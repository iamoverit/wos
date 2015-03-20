var socket = io.connect('http://10.1.1.67:81/');
var dir = '';

$( document ).ready(function() {

	var $tr = $('<tr></tr>');
	var $td = $('<td></td>');
	var $gf = $('#gamefield tbody');
  socket.on('join', function (data) {
		dir=data;
    console.log(data);
  });
  socket.on('gamedata', function (data) {
    //console.log(data);
		for(i=1;i<=data.gf.x;i++){
			$td.clone().appendTo($tr);
		}
		for(i=1;i<=data.gf.y;i++){
			$tr.clone().appendTo($gf);
		}
  });
  socket.on('snake1', function (snake) {
		$gf.find('tr:eq('+snake.seg[0].y+') td:eq('+snake.seg[0].x+')').addClass('snake1');
		$gf.find('tr:eq('+snake.seg[snake.seg.length-1].y+') td:eq('+snake.seg[snake.seg.length-1].x+')').removeClass('snake1');
    //console.log(JSON.stringify(snake));
  });
  socket.on('snake2', function (snake) {
		$gf.find('tr:eq('+snake.seg[0].y+') td:eq('+snake.seg[0].x+')').addClass('snake2');
		$gf.find('tr:eq('+snake.seg[snake.seg.length-1].y+') td:eq('+snake.seg[snake.seg.length-1].x+')').removeClass('snake2');
    //console.log(JSON.stringify(snake));
  });
});

	$('*').on('keydown', function( event ) {
    if (event.keyCode > 36 && event.keyCode < 41) {
			event.preventDefault();
			if (event.keyCode==37) { socket.emit(dir, {dir: {x: -1, y:  0}}); }
			if (event.keyCode==38) { socket.emit(dir, {dir: {x:  0, y: -1}}); }
			if (event.keyCode==39) { socket.emit(dir, {dir: {x:  1, y:  0}}); }
			if (event.keyCode==40) { socket.emit(dir, {dir: {x:  0, y:  1}}); }
		}
	});

/*
*/