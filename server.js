var port = process.env.PORT || 60606;
var io = require('socket.io')(port);
//console.log('start listening? %d', port);

var gamedata = { 	gf : {x : 50, y : 50},
									cherry : {x: null, y: null},
									speed:16,
									interval:1000,
								},
    snake$ = {
        name: "Unnamed",
				player: "",
				lives: 10, dir : [{x: 0, y: 0}], seg: [{x:2, y:2},{x:null, y:null},{x:null, y:null},{x:null, y:null},{x:null, y:null}],
    },
		snakes = [];

function resetsnake(id, name, player){
	console.log(id, name, player);
	snakes.push(clone(snake$, {name: name, player: player, dir : [{x: 0, y: 0}]}));
 	for(var i = 0; i < snakes.length; i++) {
		io.emit('lives', {lose: snakes[i].name, lives: snakes[i].lives});
	}
	//console.log(snakes);
}

function clone(proto, properties){
    properties.__proto__ = proto;
    return properties;
}

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
		s.lives = s.lives-1;                                7
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
	//console.log(players);
	var alllives=0;
	var allplayers=0;
	var winner=null;
 	for(var i = 0; i < snakes.length; i++) {
		if(snakes[i].player!=""){
			allplayers++;
		}
	}

 	for(var i = 0; i < snakes.length; i++) {
		if(snakes[i].lives>0){
			alllives++;
			winner=snakes[i].name;
		}
	}
	if(alllives==1&&allplayers>1){
	for(i=0;i<snakes.length;i++){
		if(typeof snakes[i]!=='undefined'){
			resetsnake(i, snakes[i].name, snakes[i].player);
		}
	}
		io.emit('winner is', winner);
	}
	for(i=0;i<snakes.length;i++){
		move(snakes[i]);
	}
	},gamedata.interval/gamedata.speed);

for(i=0;i<4;i++){
	var id=(i+1);
	resetsnake(i, 'snake'+id, '');
	console.log(i, 'snake'+id, ' - - - ');
}

io.on('connect', function (socket) {
	for(i=0;i<snakes.length;i++){
		if(typeof snakes[i]!=='undefined'){
			if(snakes[i].player===''){
				console.log('on connect',i, snakes[i].name, (socket.id).toString());
				resetsnake(i, snakes[i].name, (socket.id).toString());
				//break;
			}
		}
	}
	//console.log(snakes);
	socket.emit('join', 'dir');

	socket.on('latency', function (fn) {
		fn();
	});

	setcherry();
	io.emit('setcherry', gamedata.cherry);
	//console.log(gamedata.cherry);
	//console.log({snake1: snake1.lives, snake2: snake2.lives});

	socket.emit('gamedata', gamedata );

  socket.on('dir', function (indir) {
		for(i=0;i<snakes.length;i++){
			if(snakes[i].player===(socket.id).toString()){
				//console.log(i, snakes[i].name);
				with(snakes[i]){
					if (indir.dir.x===-1&&dir[dir.length-1].x!== 1) { dir.push(indir.dir); }
					if (indir.dir.y===-1&&dir[dir.length-1].y!== 1) { dir.push(indir.dir); }
					if (indir.dir.x=== 1&&dir[dir.length-1].x!==-1) { dir.push(indir.dir); }
					if (indir.dir.y=== 1&&dir[dir.length-1].y!==-1) { dir.push(indir.dir); }
					//console.log(dir);
				}
			}
		}
		//console.log(index, players, snakes[index]);
	});

  socket.on('disconnect', function () {
	for(i=0;i<snakes.length-1;i++){
		if(typeof snakes[i]!=='undefined'){
			if(snakes[i].player===(socket.id).toString()){
				//resetsnake(i, 'snake'+i+1);
				snakes[i].player="";
			}
		}
	}

/*
		var index=players.indexOf((socket.id).toString());

		players.splice(index, 1);
		console.log(index, snakes[index]);
		snakes[index].seg.length=0;
*/
    io.emit((socket.id).toString()+' user disconnected');
		console.log((socket.id).toString()+' user disconected');
  });
});
