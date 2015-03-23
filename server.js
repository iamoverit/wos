var port = process.env.PORT || 60605;
var io = require('socket.io')(port);
//console.log('start listening? %d', port);

var gamedata = { 	gf : {x : 50, y : 50},
									cherry : {x: null, y: null},
									speed:16,
									interval:1000,
								},
		snakes = [{}];

function resetsnakes(id){
	switch (id) {
	case 0:
		snakes[0] = {name: "snake1", lives: 10, dir : [{x: 0, y: 0}], snake: {seg: [{x:2, y:2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
		break
	case 1:
		snakes[1] = {name: "snake2", lives: 10, dir : [{x: 0, y: 0}], snake: {seg: [{x:gamedata.gf.x-2, y:gamedata.gf.y-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
		break
	case 2:
		snakes[2] = {name: "snake3", lives: 10, dir : [{x: 0, y: 0}], snake: {seg: [{x:-2, y:gamedata.gf.y-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
		break
	case 3:
		snakes[3] = {name: "snake4", lives: 10, dir : [{x: 0, y: 0}], snake: {seg: [{x:gamedata.gf.x-2, y:-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
		break
	default:
		snakes[0] = {name: "snake1", lives: 10, dir : [{x: 0, y: 0}], snake: {seg: [{x:2, y:2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
		snakes[1] = {name: "snake2", lives: 10, dir : [{x: 0, y: 0}], snake: {seg: [{x:gamedata.gf.x-2, y:gamedata.gf.y-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
		snakes[2] = {name: "snake3", lives: 10, dir : [{x: 0, y: 0}], snake: {seg: [{x:-2, y:gamedata.gf.y-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
		snakes[3] = {name: "snake4", lives: 10, dir : [{x: 0, y: 0}], snake: {seg: [{x:gamedata.gf.x-2, y:-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]}};
	}
}
resetsnakes();
		
		player1='';
		player2='';
		player3='';
		player4='';
/*
		setInterval(function(){
			console.dir([player1, player2, port]);
		}, 5000);
*/
function collision(needle) {
		snakes.forEach(function(snake){
			var haystack = snake;
			console.log(haystack, needle);
			if(typeof haystack.snake !== 'undefined'){
    		var length = haystack.snake.seg.length;
    		for(var i = 1; i < length; i++) {
        	if(haystack.snake.seg[i].x == needle.x&&haystack.snake.seg[i].y == needle.y){
						return [true, haystack];
					}
		    }
			}
		});
    return [false];
}

function setcherry(){
	with(gamedata){
		cherry.x = Math.round((Math.random()*(gf.x-1)));
		cherry.y = Math.round((Math.random()*(gf.y-1)));
	}
}

		function move(s) {
			if(s.lives>0){
			var col=collision(s.snake.seg[0]);
			if(col[0]){
				if(col[1].snake.seg.length-2>4){
					col[1].snake.seg.length=col[1].snake.seg.length-2;
				}
				col[1].snake = {seg: col[1].snake.seg};
				s.lives = s.lives-1, 
				s.dir = [{x: 1, y: 0}];
				s.snake = {seg: [{x:1, y:0},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]};
				//io.emit('resetfield', true);
				setcherry();
				io.emit('setcherry', gamedata.cherry);
				io.emit('lives', {lose: s.name, lives: s.lives});
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

			io.emit(s.name, s.snake);
			if(s.dir.length>1){
				s.dir.splice(0, 1);
			}
			}
		};

	setInterval(function(){
	var alllives=0;
	snakes.forEach(function(snake){
			alllives+=snake.lives;
	});
	if(alllives==0){
		resetsnakes();
	}
	if(player1!=""){
		move(snakes[0]);
	}
	if(player2!=""){
		move(snakes[1]);
	}
	if(player3!=""){
		move(snakes[2]);
	}
	if(player4!=""){
		move(snakes[3]);
	}
	},gamedata.interval/gamedata.speed);


io.on('connect', function (socket) {

	socket.on('latency', function (fn) {
		fn();
	});

	//io.emit('lives', {snake1: snake1.lives, snake2: snake2.lives, snake3: snake3.lives, snake4: snake4.lives});
	setcherry();
	io.emit('setcherry', gamedata.cherry);
	//console.log(gamedata.cherry);
	//console.log({snake1: snake1.lives, snake2: snake2.lives});

	if(player1==''){
		player1=(socket.id).toString();
		socket.emit('join', 'dir1');
		resetsnakes(0);
	}else{
		if(player2==''){
			player2=(socket.id).toString();
			socket.emit('join', 'dir2');
			resetsnakes(1);
		}else{
			if(player3==''){
				player3=(socket.id).toString();
				socket.emit('join', 'dir3');
				resetsnakes(2);
			}else{
				if(player4==''){
					player4=(socket.id).toString();
					socket.emit('join', 'dir4');
					resetsnakes(3);
				}
			}
		}
	}

	socket.emit('gamedata', gamedata );

  socket.on('dir1', function (indir) {
		with(snakes[0]){
			if (indir.dir.x==-1&&dir[dir.length-1].x!= 1) { dir.push(indir.dir); }
			if (indir.dir.y==-1&&dir[dir.length-1].y!= 1) { dir.push(indir.dir); }
			if (indir.dir.x== 1&&dir[dir.length-1].x!=-1) { dir.push(indir.dir); }
			if (indir.dir.y== 1&&dir[dir.length-1].y!=-1) { dir.push(indir.dir); }
			//console.log(dir);
		}
	});
  socket.on('dir2', function (indir) {
		with(snakes[1]){
			if (indir.dir.x==-1&&dir[dir.length-1].x!= 1) { dir.push(indir.dir); }
			if (indir.dir.y==-1&&dir[dir.length-1].y!= 1) { dir.push(indir.dir); }
			if (indir.dir.x== 1&&dir[dir.length-1].x!=-1) { dir.push(indir.dir); }
			if (indir.dir.y== 1&&dir[dir.length-1].y!=-1) { dir.push(indir.dir); }
			//console.log(dir);
		}
	});
  socket.on('dir3', function (indir) {
		with(snakes[2]){
			if (indir.dir.x==-1&&dir[dir.length-1].x!= 1) { dir.push(indir.dir); }
			if (indir.dir.y==-1&&dir[dir.length-1].y!= 1) { dir.push(indir.dir); }
			if (indir.dir.x== 1&&dir[dir.length-1].x!=-1) { dir.push(indir.dir); }
			if (indir.dir.y== 1&&dir[dir.length-1].y!=-1) { dir.push(indir.dir); }
			//console.log(dir);
		}
	});
  socket.on('dir4', function (indir) {
		with(snakes[3]){
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
			snakes[0].snake.seg.length=0;
		}
		if(player2==(socket.id).toString()){
			player2='';
			snakes[1].snake.seg.length=0;
		}
		if(player3==(socket.id).toString()){
			player3='';
			snakes[2].snake.seg.length=0;
		}
		if(player4==(socket.id).toString()){
			player4='';
			snakes[3].snake.seg.length=0;
		}

    io.emit('user disconnected');
		console.log('user disconected');
  });
});
