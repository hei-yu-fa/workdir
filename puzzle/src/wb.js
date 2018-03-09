/*
    项目：拼图游戏
*/

import io from 'socket.io-client';


window.onload = function() {
	let ws = io('http://localhost:3000');

	ws.on('init_shuffle', function(data) {
		create_pic(data);
	});

	ws.on('move-success', function() {

	});

	ws.on('move-failure', function(data) {
		alert('移动失败: ', data);
	});


	ws.on('completed', function(){
		console.log('游戏成功！');
		document.getElementById("result").innerText = "You Win!";
	});

	const move = function(data) {
    	ws.emit('move', data);
	};

	let nomove_arr = [];

	/* 产生拼图 */
	function create_pic(shuffled_array) {
		for(let i = 1; i <= 9; i++) {
			if(shuffled_array[i-1][0] == i) {
				nomove_arr.push(i);
				console.log('nomove push, ', i);
			}
		}

		console.log('nomove_arr : ', nomove_arr);

	    let picture = document.getElementById("picture");

	    let nomove_flag = false;
	    for (var i = 1; i <= 9; i++) {
	        var part = document.createElement("div");
	        nomove_arr.forEach(function(ele) {
	        	if(ele == i) {
	        		nomove_flag = true;
	        	}
	        });
	        if(!nomove_flag) {
	        	part.addEventListener("click", pic_move);
	        } else {
	        	part.style.borderRadius = '10px';
	        	part.addEventListener("click", function(){
	        		alert('圆角边框图片已经是正确位置，不需要移动！');
	        	});
	        	nomove_flag = false;
	        }

	        let flag = shuffled_array.shift();

	        console.log('[' + flag[0] + '],[' + flag[1] + ']');

	        // 还要判断翻转和能否移动，需要翻转的得加上翻转的效果
	        part.className ="picture_part position_" + flag[0];
	        if(flag[1] == 1) {
	        	part.className += ' reversal-h';
	        }
	        if(flag[1] == 2) {
	        	part.className += ' reversal-v';
	        }
	        if(flag[1] == 3) {
	        	part.className += ' reversal-h reversal-v';
	        }
	        picture.appendChild(part);
	        part.id = "_position_" + i;
	    }
	}

	// 
	let chosen_pic = 0;

	// move的逻辑还得改写一下了...


	// 不需要服务器控制，前端控制，变动通知，只做判断完成这一件事情
	/* 点击图片触发的事件处理器 */
	function pic_move(event) {
		// 要有一个选中，然后一个要交换的，此方法要重写
		// 先选中一个
		if(chosen_pic == 0) {
			chosen_pic = this.id.split('_')[2];
			console.log('chosen_pic : ', chosen_pic);
			this.style.opacity = 0.5;
			return;
		}
	
		move([chosen_pic - 1, this.id.split('_')[2] - 1]);

		// 再选中一个需要交换的
	    var chosen_pic_offset = document.getElementById("_position_" + chosen_pic);
	    var chosen_pic_offset_top = chosen_pic_offset.offsetTop;
	    var chosen_pic_offset_left = chosen_pic_offset.offsetLeft;
	    var _offset_top = this.offsetTop;
	    var _offset_left = this.offsetLeft;
	
	    var str = chosen_pic_offset.className;
	    chosen_pic_offset.className = this.className;
	    this.className = str;

		//  检查是否还原原图
	    //  客户端应该也是要一个检测的
	    check();

		chosen_pic_offset.style.opacity = 1;
		chosen_pic = 0;
	}

	/* 检查是否还原原图 */
	function check() {
	    for (var i = 1; i <= 9; i++) {
	        var item = document.getElementById("_position_" + i);
	        if (item.className.indexOf("position_" + i) == -1) {
	            document.getElementById("result").innerText = "Continue...";
	            return;
	        }
	    }
	    console.log('游戏成功！');
	    //document.getElementById("result").innerText = "You Win!";
	}

};







