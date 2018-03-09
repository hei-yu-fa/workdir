let app = require('express')();
let http = require('http').Server(app);
let io = require('socket.io')(http);

// 可能还要加入不能移动的块，随机shuffle的时候，未发生改变的部分就不让移动，这是最简单的处理方法了
// 不让移动的部分客户端可以选择灰边显示等
// 添加翻转方式：0不翻转 1左右翻转 2上下翻转 3上下左右翻转
let init_array = [1,2,3,4,5,6,7,8,9];
let move = []; // [1,2] [2,3] 将1跟3互换了位置

// 还得维护一个目前状态的数组，作为后续的游戏完成判断的依据

// 为游戏图块添加翻转标记 基本上1/4的概率翻转 上下，左右，上下左右，分别概率2/5，2/5，1/5
// 感觉贼难，得把人玩死啊
const reversal = function(array) {
	let tempArray = [];
	array.forEach(function(value, index, array) {
		// 不翻转
		if(Math.random() > 0.25) {
			tempArray[index] = [value, 0]; 
		}
		// 翻转
		else{
			let random = Math.random();
			// 上下翻转
			if(random < 0.4) {
				tempArray[index] = [value, 1];
			}
			// 左右翻转
			else if(random >= 0.4 && random < 0.8) {
				tempArray[index] = [value, 2];
			}
			// 上下左右翻转
			else {
				tempArray[index] = [value, 3];
			}

		}
	});
	return tempArray;
};

const shuffle = function(array) {
	array.sort(function () {
		return Math.random() > 0.5 ? -1 : 1;
    	//用Math.random()函数生成0~1之间的随机数与0.5比较，返回-1或1
	});
	return array;
}


app.get('/', function(req, res) {
	console.log('get');
});

// 目前只会有一对一，跟服务器应该是有两个连接，而且这两个必须是一对的...这个逻辑后面看，目前只尝试两个互相转发就好了
// 那目前就假设只有两个，测试使用
let sockets = [];

io.on('connection', function(socket) {
	console.log('a user connected！');

	// 好像是这里有些问题呢
	let shuffled_array = shuffle(reversal(init_array));
	socket.emit('init_shuffle', shuffled_array);

	// let nomove_arr = [];

	// for(let i = 1, length = shuffled_array.length; i <= length; i++) {
	// 	// 没有打乱的就不让他移动了
	// 	if(shuffled_array[i-1][0] == i) {
	// 		nomove_arr.push(i);
	// 	}
	// }

	// console.log('nomove_arr : ', nomove_arr);

	sockets.push([socket, shuffled_array]);

	// move 传来的数据表示 [0,1],就是第一格跟第二格交换
	// 说意思还得自己判断可不可以移动等，翻转之类的
	// 后端不好控制这些，前端控制吧
	socket.on('move',function(data) {
		console.log('data from client : move, ', data);

		if(data[0] == data[1]) {
			console.log('自身交换，不处理！');
			socket.emit('move-failure','自身交换');
			return;
		}

		// let return_flag = false;

		// nomove_arr.forEach(function(ele){
		// 	if(data[0] == ele || data[1] == ele) {
		// 		console.log('尝试移动nomove的图像块，forbidden!');
		// 		return_flag = true;
		// 	}
		// });

		// if(return_flag) {
		// 	socket.emit('move-failure','该图像块禁止移动');
		// 	return;
		// }

		let completed = true;
		let temp = shuffled_array[data[0]];
		shuffled_array[data[0]] = shuffled_array[data[1]];
		shuffled_array[data[1]] = temp;
		socket.emit('move-success');

		for(let i = 0; i < init_array.length; i++) {
			if (shuffled_array[i][0] !== i + 1) {
				completed = false;
				break;
			}
		}

		// 无法限制已完成不让操作了啊
		if(completed) {
			socket.emit('completed');
			// nomove_arr = [];
			console.log('completed!');
		}
	});

	socket.on('disconnect', function(){
    	console.log('user disconnected');
  	});
});

http.listen(3000, function(){
	console.log('listening on *: 3000');
});