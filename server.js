var port = process.env.PORT || 60605;
var io = require('socket.io')(port);
console.log('start listening? %d', port);
var gamedata = { 	gf : {x : 50, y : 50},
									cherry : {x: null, y: null},
									speed:20,
									interval:1000,
								},
		snake1 = {score: 0, dir : [{x: 0, y: 1}], snake: {seg: [{x:0, y:1},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
		snake2 = {score: 0, dir : [{x: 1, y: 0}], snake: {seg: [{x:1, y:0},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
		player1='';
		player2='';
/*
		setInterval(function(){
			console.dir([player1, player2, port]);
		}, 5000);
*/
function collision(needle) {
		var haystack = snake1.snake.seg;
		//console.log(haystack, needle);
    var length = haystack.length;
    for(var i = 1; i < length; i++) {
        if(haystack[i].x == needle.x&&haystack[i].y == needle.y){
					return true;
				}
    }
		var haystack = snake2.snake.seg;
		//console.log(haystack, needle);
    var length = haystack.length;
    for(var i = 1; i < length; i++) {
        if(haystack[i].x == needle.x&&haystack[i].y == needle.y){
					return true;
				}
    }
    return false;
}

function setcherry(){
	with(gamedata){
		cherry.x = Math.round((Math.random()*(gf.x-1)));
		cherry.y = Math.round((Math.random()*(gf.y-1)));
	}
}

	setInterval(function(){
		(function(s) {
			if(collision(s.snake.seg[0])){
				snake2 = {score: snake2.score+1, dir : [{x: 1, y: 0}], snake: {seg: [{x:1, y:0},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
				s.dir = [{x: 0, y: 1}]
				s.snake = {seg: [{x:0, y:1},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]};
				console.log('snake1');
				io.emit('resetfield', true);
				setcherry();
				io.emit('setcherry', gamedata.cherry);
				io.emit('score', {snake1: snake1.score, snake2: snake2.score, lose: 'snake1'});
			}
	
			if(s.snake.seg[0].x==gamedata.cherry.x&&s.snake.seg[0].y==gamedata.cherry.y){
				s.snake.seg[s.snake.seg.length]={x: s.snake.seg[s.snake.seg.length-1].x, y: s.snake.seg[s.snake.seg.length-1].y};
				io.emit('delcherry', gamedata.cherry);
				setcherry();
				io.emit('setcherry', gamedata.cherry);
			}

			for(var i=s.snake.seg.length-1;i>0 ;i--) {
				s.snake.seg[i].x=s.snake.seg[i-1].x;
				s.snake.seg[i].y=s.snake.seg[i-1].y;
			}	
			s.snake.seg[0].x+=s.dir[0].x;
			s.snake.seg[0].y+=s.dir[0].y;
			if(s.snake.seg[0].x>gamedata.gf.x-1)	s.snake.seg[0].x=0
			if(s.snake.seg[0].y>gamedata.gf.y-1)	s.snake.seg[0].y=0
			if(s.snake.seg[0].x<0)	s.snake.seg[0].x=gamedata.gf.x-1
			if(s.snake.seg[0].y<0)	s.snake.seg[0].y=gamedata.gf.y-1

			io.emit('snake1', s.snake);

			if(s.dir.length>1){
				s.dir.splice(0, 1);
			}
		}(snake1));
	},gamedata.interval/gamedata.speed);

	setInterval(function(){
		(function(s) {
			if(collision(s.snake.seg[0])){
				snake1 = {score: snake1.score+1, dir : [{x: 0, y: 1}], snake: {seg: [{x:0, y:1},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
				s.dir = [{x: 1, y: 0}];
				s.snake = {seg: [{x:1, y:0},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]};
				io.emit('resetfield', true);
				setcherry();
				io.emit('setcherry', gamedata.cherry);
				io.emit('score', {snake1: snake1.score, snake2: snake2.score, lose: 'snake2'});
			}
			if(s.snake.seg[0].x==gamedata.cherry.x&&s.snake.seg[0].y==gamedata.cherry.y){
				s.snake.seg[s.snake.seg.length]={x: s.snake.seg[s.snake.seg.length-1].x, y: s.snake.seg[s.snake.seg.length-1].y};
				io.emit('delcherry', gamedata.cherry);
				setcherry();
				io.emit('setcherry', gamedata.cherry);
			}
			for(var i=s.snake.seg.length-1;i>0 ;i--) {
				s.snake.seg[i].x=s.snake.seg[i-1].x;
				s.snake.seg[i].y=s.snake.seg[i-1].y;
			}	
			s.snake.seg[0].x+=s.dir[0].x;
			s.snake.seg[0].y+=s.dir[0].y;
			if(s.snake.seg[0].x>gamedata.gf.x-1)	s.snake.seg[0].x=0
			if(s.snake.seg[0].y>gamedata.gf.y-1)	s.snake.seg[0].y=0
			if(s.snake.seg[0].x<0)	s.snake.seg[0].x=gamedata.gf.x-1
			if(s.snake.seg[0].y<0)	s.snake.seg[0].y=gamedata.gf.y-1

			io.emit('snake2', s.snake);
			if(s.dir.length>1){
				s.dir.splice(0, 1);
			}
		}(snake2));
	},gamedata.interval/gamedata.speed);


io.on('connect', function (socket) {

	io.emit('score', {snake1: snake1.score, snake2: snake2.score});
	setcherry();
	io.emit('setcherry', gamedata.cherry);
	console.log(gamedata.cherry);
	console.log({snake1: snake1.score, snake2: snake2.score});

	if(player1==''){
		player1=(socket.id).toString();
		socket.emit('join', 'dir1');
	}else{
		if(player2==''){
			player2=(socket.id).toString();
			socket.emit('join', 'dir2');
		}
	}

	socket.emit('gamedata', gamedata );

  socket.on('dir1', function (indir) {
		with(snake1){
			if (indir.dir.x==-1&&dir[dir.length-1].x!= 1) { dir.push(indir.dir); }
			if (indir.dir.y==-1&&dir[dir.length-1].y!= 1) { dir.push(indir.dir); }
			if (indir.dir.x== 1&&dir[dir.length-1].x!=-1) { dir.push(indir.dir); }
			if (indir.dir.y== 1&&dir[dir.length-1].y!=-1) { dir.push(indir.dir); }
			//console.log(dir);
		}
	});
  socket.on('dir2', function (indir) {
		with(snake2){
			if (indir.dir.x==-1&&dir[dir.length-1].x!= 1) { dir.push(indir.dir); }
			if (indir.dir.y==-1&&dir[dir.length-1].y!= 1) { dir.push(indir.dir); }
			if (indir.dir.x== 1&&dir[dir.length-1].x!=-1) { dir.push(indir.dir); }
			if (indir.dir.y== 1&&dir[dir.length-1].y!=-1) { dir.push(indir.dir); }
			//console.log(dir);
		}
	});

  socket.on('disconnect', function () {
		if(player1==(socket.id).toString()){
			player1='';
		}
		if(player2==(socket.id).toString()){
			player2='';
		}

    io.emit('user disconnected');
		console.log('user disconected');
  });
});
