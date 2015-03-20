var port = process.env.PORT || 60605;
var io = require('socket.io')(port);
console.log('start listening? %d', port);
var gamedata = { 	gf : {x : 50, y : 50},
									cherry : {x: null, y: null},
									speed:4,
									interval:1000,
								},
		snake1 = {dir : [{x: 1, y: 0}], snake: {seg: [{x:0, y:0},{x:0, y:0},{x:0, y:0},{x:0, y:0},{x:0, y:0}]}};
		snake2 = {dir : [{x: 1, y: 0}], snake: {seg: [{x:0, y:0},{x:0, y:0},{x:0, y:0},{x:0, y:0},{x:0, y:0}]}};
		player1='';
		player2='';
/*
		setInterval(function(){
			console.dir([player1, player2, port]);
		}, 5000);
*/
io.on('connect', function (socket) {
	if(player1==''){
		player1=(socket.id).toString();
		socket.emit('join', 'dir1');
	}else{
		if(player2==''){
			player2=(socket.id).toString();
			socket.emit('join', 'dir2');
		}
	}
	with(snake1){
		setInterval(function(){
			for(var i=snake.seg.length-1;i>0 ;i--) {
				snake.seg[i].x=snake.seg[i-1].x;
				snake.seg[i].y=snake.seg[i-1].y;
			}	
			snake.seg[0].x+=dir[0].x;
			snake.seg[0].y+=dir[0].y;
			if(snake.seg[0].x>gamedata.gf.x-1)	snake.seg[0].x=0
			if(snake.seg[0].y>gamedata.gf.y-1)	snake.seg[0].y=0
			if(snake.seg[0].x<0)	snake.seg[0].x=gamedata.gf.x-1
			if(snake.seg[0].y<0)	snake.seg[0].y=gamedata.gf.y-1

			io.emit('snake1', snake);

			if(dir.length>1){
				dir.splice(0, 1);
			}
		},gamedata.interval/gamedata.speed);
	}
	with(snake2){
		setInterval(function(){
			for(var i=snake.seg.length-1;i>0 ;i--) {
				snake.seg[i].x=snake.seg[i-1].x;
				snake.seg[i].y=snake.seg[i-1].y;
			}	
			snake.seg[0].x+=dir[0].x;
			snake.seg[0].y+=dir[0].y;
			if(snake.seg[0].x>gamedata.gf.x-1)	snake.seg[0].x=0
			if(snake.seg[0].y>gamedata.gf.y-1)	snake.seg[0].y=0
			if(snake.seg[0].x<0)	snake.seg[0].x=gamedata.gf.x-1
			if(snake.seg[0].y<0)	snake.seg[0].y=gamedata.gf.y-1

			io.emit('snake2', snake);

			if(dir.length>1){
				dir.splice(0, 1);
			}
		},gamedata.interval/gamedata.speed);
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
