    var page = document.querySelectorAll('.page');
    page[0].style.display = 'block';

    document.querySelector('#name_input').addEventListener('keydown', function(e) {
        if (e.keyCode === 13) {
            to_second_page();
        }
    }, false);
    /*処理手順１：名前取得*/
    var name_input = document.querySelector("#name_input");
    var sendName = document.querySelector('#sendName');


   function to_second_page () {
        myName = document.querySelector('#name_input').value;
        console.log(myName);

        document.querySelector('#name_display').textContent = myName + 'さん';
        for (var i = 0; i < page.length; i++) {
            page[i].style.display = 'none';
        }

        page[1].style.display = 'block';
    }    
    
    //名前を外部変数で保持
    var myName = null;
    sendName.addEventListener('click', function () {
        to_second_page();
    }, false);


    
    /*処理手順：問題を受信し「第何問」って表示する*/
    //問題データをグローバルで保持
    var question_data;
    var question_num;
    socket.on('get_question', function (data) {

        if (myName === null) return ;
        
        document.querySelector('#question_num_display').textContent = '';
        document.querySelector('#question_display').textContent = '';
        
        question_data = data['data'][0];
        question_num  = data['total_num'];
        console.log(question_data);

        for (var i = 0; i < page.length; i++) {
            page[i].style.display = 'none';
        }
        page[1].style.display = 'block';

        //第何問と表示する
        document.querySelector('#question_num_display').textContent = '第' + question_num + '問';
                    
        //てでん！の音楽
        audioStart('audio/questionStart.mp3');
    });

    //問題文を表示する 
    socket.on('get_question_display', function () {
        console.log('問題文を表示する');
        document.querySelector('#question_display').textContent = question_data['question'];
    });

    //回答スタート    
    socket.on('answer_start', function () {
        console.log('回答スタート');
        for (var i = 0; i < page.length; i++) {
            page[i].style.display = 'none';
        }
        page[2].style.display = 'block';
        console.log('問題データ');
        console.log(question_data);
        //問題を表示
        document.querySelector('#total_num').innerText = '第' + question_num + '問';
        document.querySelector('#question').innerText  = question_data['question'];
        document.querySelector('#select_1').innerText  = question_data['select_A'];
        document.querySelector('#select_2').innerText  = question_data['select_B'];
        document.querySelector('#select_3').innerText  = question_data['select_C'];
        document.querySelector('#select_4').innerText  = question_data['select_D'];
    
        timer_start();
    });
    
    
    var timer_count = 0;
    var answer_flag = false;
    var remaining_time = 10;
    var timerId;
    var timer_area = document.querySelector('#timer');  
    var buttons = document.querySelectorAll(".btn");

    function button_disabled () {
        //初期状態はボタンを押せない状態である
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }
    }
    button_disabled();
    
    
    //音楽を再生する
    function audioStart (fileName) {
        var audio = new Audio(fileName);
        audio.play();
    }

    //データの受信が終われば呼び出される
    function timer_start () {
        audioStart("audio/bgm.wav");
        //ボタンを押せるようにする
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].disabled = false;
        }

        //タイマースタート
        timer_count = 0;
        remaining_time = 10;
        timer_area.textContent = remaining_time;

        timerId = setInterval(function () {
            timer_count++;
            if (remaining_time === 0) {
                clearInterval(timerId);
                clearInterval(timerId_2);
                //ボタンを押せなくする
                button_disabled();
            } else {
                remaining_time--;
                timer_area.textContent = remaining_time;
            }
        }, 1000);
            
        timerId_2 = setInterval(function () {
            timer_count++;           
        }, 10);
    }


    //イベントリスナーの付与
    for (var i = 0; i< buttons.length; i++) {
        buttons[i].addEventListener('click', function () {

            clearInterval(timerId_2);
            var answer_time_sec = timer_count;
            console.log(answer_time_sec);
            //ボタンを押せなくする
            for (var i = 0; i < buttons.length; i++) {
                buttons[i].disabled = true;
            }

            
            //clearInterval(timerId);
            if(myName === "" || myName === null) {
                myName = '名無しさん';
            }
            
            var data = {'question_num':question_num,
                        'name':myName, 
                        'answer':this.value, 
                        'time':answer_time_sec/100 }
            console.log('送信データ：' + data);

            //サーバに結果を送信
            //番号と秒数を送信する
            socket.emit('question_answer', data);

            var answer = this.value;
            document.querySelector('#send_answer_display').textContent = answer + 'を送信しました．';
            //送信した旨を表示する
            console.log('回答：' + answer +'を送信しました');

        }, false);
    }

    var select_data;
    //回答人数を表示する 
    socket.on('people_num', function (data) {
        console.log('回答人数表示');
        select_data = data;        
        $('.select_num_area').css({'visibility':'visible'}); 
        var num_area = document.querySelectorAll('.select_num_area'); 
        num_area[0].textContent = select_data['select_a'].length;
        num_area[1].textContent = select_data['select_b'].length;
        num_area[2].textContent = select_data['select_c'].length;
        num_area[3].textContent = select_data['select_d'].length;

        audioStart('audio/answerNum.mp3');
    });

    //回答を表示する 
    socket.on('answer_check', function (question_answer) {
        console.log('回答チェック');
        //今は最初に送られてきたデータの中にあるアンサーを使用
        //今後はquestion_answerを使いたい！
        audioStart('audio/answerCheck.mp3');
       
        //アニメーションをさせるクラスを付与する
      //  document.querySelector('#area_' + question_data['answer']).addClass = 'answer_right';
//        $("#area_" + question_data['answer']).animate({"opacity": "0"}, 100);
        var count = 0;
        var animation_timer = setInterval( function () {
            count++;
            $("#area_" + question_data['answer']).fadeOut(300, function () { $(this).fadeIn(300) });

            if (count > 5) { 
                clearInterval(animation_timer);
            }
        }, 600, animation_timer);

    });

    //ランキングを表示する
    socket.on('ranking_check', function () {
        
       $('.select_num_area').css({'visibility':'hidden'}); 
       
       
       var rank_area_elem = document.querySelector('#rankign_area');
       while(rank_area_elem.firstChild) rank_area_elem.removeChild(rank_area_elem.firstChild);


        //引数でその問題か最終問題かを取得できたらイイね！！
        console.log('ランキングチェック');
        var ans_str;
        var q_ans_num = question_data['answer'];
        if (q_ans_num === 1) {
            ans_str = 'select_a';
        } else if (q_ans_num === 2) {
            ans_str = 'select_b';
        } else if (q_ans_num === 3) {
            ans_str = 'select_c';
        } else if (q_ans_num === 4) {
            ans_str = 'select_d';
        }
        
        //画面の切替
        for (var i = 0; i < page.length; i++) {
            page[i].style.display = 'none';
        }
        page[3].style.display = 'block';

        console.log('回答文字列:' + ans_str);
        console.log(select_data[ans_str]);
 
        var add_rank_data = select_data[ans_str];
        //ランキングページヘ 
        
        //TODO: rank_areaのDOMを削除する


        
        audioStart('audio/ranking.mp3');

        //参加者全員表示する
        //とりあえず７回繰り返す 
        var rank_timer = 4200;
        for (var i = 0; i < add_rank_data.length; i++) {            
            var rank = i + 1;
            add_dom_ranking_area (add_rank_data[i], rank_timer,rank);
            rank_timer -= 600;
        }
    });


//ランキングエリアのDOMを作成する
function add_dom_ranking_area (data, rank_timer, rank) {
    console.log(data);
    var div_elem  = document.createElement('div');
    div_elem.setAttribute('class','rank_box');

    //順位
    var rank_elem = document.createElement('div');
    rank_elem.setAttribute('class','rank');
    rank_elem.textContent = rank;
    div_elem.appendChild(rank_elem);


    //名前
    var rank_name_elem = document.createElement('div');
    rank_name_elem.setAttribute('class','rank_name');
    rank_name_elem.textContent = data['user_name'];
    div_elem.appendChild(rank_name_elem);


    //時間
    var rank_time_elem = document.createElement('div');
    rank_time_elem.setAttribute('class','rank_time');
    rank_time_elem.textContent = zero_padding(data['answer_time']);
    div_elem.appendChild(rank_time_elem);
    
    document.querySelector('#rankign_area').appendChild(div_elem);
    $(div_elem).delay(rank_timer).animate({"opacity": "1"}, 500);
}

function zero_padding (num) {
    var a = String(num);
    if (a.indexOf(".") === -1) {
        return a + ".00";
    } else if (a.indexOf(".") === a.length - 1) {
        return a + "0";
    } else {
        return a;
    }
}

