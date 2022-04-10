$(function(){
    var currentQuiz = null;
//當按鈕按下後，要做的事情
    $("#startButton").on("click",function(){
        if(currentQuiz==null){
            //設定目前作答從第0題開始
            currentQuiz=0;
            //顯示題目
            $("#question").text(questions[0].question);
            //將選項區清空(可以試著先不寫)
            $("#options").empty();
            //將選項逐個加入
            questions[0].answers.forEach(function(element,index,array){
                $("#options").append(`<input name='options' type='radio' value='${index}'><label>${element[0]}</label><br><br>`);
            });
            //將按鈕上的文字換成Next
            $("#startButton").attr("value","Next");
        }
        else{
            //已經開始作答從這邊繼續
            //巡訪哪一個選項有被選取
                $.each($(":radio"),function(i,val){
                    if(val.checked){
                        //是否已走到最後要產生結果(A~D)
                        if(isNaN(questions[currentQuiz].answers[i][1])){
                            //通往最終結果
                            var finalResult = questions[currentQuiz].answers[i][1];
                            //顯示最終結果的標題
                            $("#question").text(finalAnswers[finalResult][0]);
                            //將選項區域清空
                            $("#options").empty();
                            //顯示最終結果內容
                            $("#options").append(`${finalAnswers[finalResult][1]}<br><br>`);
                            currentQuiz=null;
                            $("#startButton").attr("value","重新開始");
                        }else{
                            //指定下一題，原始資料從1開始，所以要-1
                            currentQuiz = questions[currentQuiz].answers[i][1]-1;
                            //顯示新的題目
                            $("#question").text(questions[currentQuiz].question);
                            $("#options").empty();
                            questions[currentQuiz].answers.forEach(function(element,index,array){
                                $("#options").append(`<input name='options' type='radio' value='${index}'><label>${element[0]}</label><br><br>`);
                            });

                        }
                        return false; //跳離迴圈的方式
                    }
                });
    
        }
    });
});