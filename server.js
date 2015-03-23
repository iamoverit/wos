var port = process.env.PORT || 60606;
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
		snakes[0] = {name: "snake1", lives: 10, dir : [{x: 0, y: 0}], seg: [{x:2, y:2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]};
		break
	case 1:
		snakes[1] = {name: "snake2", lives: 10, dir : [{x: 0, y: 0}], seg: [{x:gamedata.gf.x-2, y:gamedata.gf.y-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]};
		break
	case 2:
		snakes[2] = {name: "snake3", lives: 10, dir : [{x: 0, y: 0}], seg: [{x:-2, y:gamedata.gf.y-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]};
		break
	case 3:
		snakes[3] = {name: "snake4", lives: 10, dir : [{x: 0, y: 0}], seg: [{x:gamedata.gf.x-2, y:-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]};
		break
	default:
		snakes[0] = {name: "snake1", lives: 10, dir : [{x: 0, y: 0}], seg: [{x:2, y:2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]};
		snakes[1] = {name: "snake2", lives: 10, dir : [{x: 0, y: 0}], seg: [{x:gamedata.gf.x-2, y:gamedata.gf.y-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]};
		snakes[2] = {name: "snake3", lives: 10, dir : [{x: 0, y: 0}], seg: [{x:-2, y:gamedata.gf.y-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]};
		snakes[3] = {name: "snake4", lives: 10, dir : [{x: 0, y: 0}], seg: [{x:gamedata.gf.x-2, y:-2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}]};
	}
 	for(var i = 0; i < snakes.length; i++) {
		io.emit('lives', {lose: snakes[i].name, lives: snakes[i].lives});
	}
}
	
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
 		for(var i = 0; i < snakes.length; i++) {
			var haystack = snakes[i];
			if(haystack.seg.length){
    		for(var j = 1; j < haystack.seg.length; j++) {
        	if(haystack.seg[j].x == needle.x&&haystack.seg[j].y == needle.y){
						//console.log(haystack.seg);
						return [true, haystack];
					}
		    }
			}
		}
    return [false];
}

function setcherry(){
	with(gamedata){
		if(cherry.x !== null&&cherry.y!==null) {
			io.emit('delcherry', cherry);
		}
			cherry.x = Math.round((Math.random()*(gf.x-1)));
			cherry.y = Math.round((Math.random()*(gf.y-1)));
		io.emit('setcherry', cherry);
	}
}

		function move(s) {
			if(s.lives>0){
			//console.log(s);
			var col=collision(s.seg[0]);
			//console.log(col);
			if(col[0]){
				if(col[1].seg.length-2>4){
					col[1].seg.length=col[1].seg.length-2;
				}
				s.lives = s.lives-1;
				s.dir = [{x: 0, y: 0}];
				s.seg = [{x:1, y:0},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}];
				io.emit('lives', {lose: s.name, lives: s.lives});
				//io.emit('resetfield', true);
				//setcherry();
			}

			if(s.seg[0].x==gamedata.cherry.x&&s.seg[0].y==gamedata.cherry.y){
				s.seg[s.seg.length]={x: s.seg[s.seg.length-1].x, y: s.seg[s.seg.length-1].y};
				setcherry();
			}

			if(s.dir[0].x!=0||s.dir[0].y!=0){
				io.emit('snake', {name: s.name, seg: [s.seg[0], s.seg[s.seg.length-4]||s.seg[s.seg.length-3], s.seg[s.seg.length-1]]});
				for(var i=s.seg.length-1;i>0 ;i--) {
					s.seg[i].x=s.seg[i-1].x;
					s.seg[i].y=s.seg[i-1].y;
				}	
				s.seg[0].x+=s.dir[0].x;
				s.seg[0].y+=s.dir[0].y;
				if(s.seg[0].x>gamedata.gf.x-1)	s.seg[0].x=0
				if(s.seg[0].y>gamedata.gf.y-1)	s.seg[0].y=0
				if(s.seg[0].x<0)	s.seg[0].x=gamedata.gf.x-1
				if(s.seg[0].y<0)	s.seg[0].y=gamedata.gf.y-1
			}

			if(s.dir.length>1){
				s.dir.splice(0, 1);
			}

			}
		};

	setInterval(function(){
	var alllives=0;
	var winner=null;
 	for(var i = 0; i < snakes.length; i++) {
		if(snakes[i].lives>0){
			alllives++;
			winner=snakes[i].name;
		}
	}
	if(alllives==1){
		resetsnakes();
		io.emit('winner is', winner);
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
	//resetsnakes();

	socket.on('latency', function (fn) {
		fn();
	});

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
			snakes[0].seg.length=0;
		}
		if(player2==(socket.id).toString()){
			player2='';
			snakes[1].seg.length=0;
		}
		if(player3==(socket.id).toString()){
			player3='';
			snakes[2].seg.length=0;
		}
		if(player4==(socket.id).toString()){
			player4='';
			snakes[3].seg.length=0;
		}

    io.emit('user disconnected');
		console.log('user disconected');
  });
});
