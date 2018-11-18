/*function checkLoginState(){
  // 로그인 여부 체크
  FB.getLoginStatus(function(response){
    if (response.status === 'connected'){
      $('#content').css('opacity', '.3').css('pointer-events', 'none');
      $('#fb-login').html('로그인 중 ...');
      FB.api('/me', function(user){
        $.post('/',{name:user.name,id:user.id},function(){location.reload()});
      });
    }
    else
      logout();
  }, true);
}*/

$.ajaxSetup({cache:false});
$.datepicker.setDefaults({
  dateFormat: 'yy-mm-dd',
  yearSuffix: '년',
  prevText: '이전 달',
  nextText: '다음 달',
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  dayNamesMin: ['일', '월', '화', '수', '목', '금', '토'],
  showMonthAfterYear: true
});
$(function (){
  $('.datepicker').datepicker();
  $('.btn-close').click(function(){
    window.open('about:blank', '_self');
    opener = window;
    window.close();
    location.replace('about:blank');
  })
  $('.btn-restore').click(function(){    
    $(this).fadeOut();
    checkLoginState();
  })
  $('.btn-create').hover(function(){
    $('.create-container').addClass('active');
    $('.desc-create').addClass('active');
  })
  $('.btn-create').mouseout(function(){
    $('.create-container').removeClass('active');
    $('.desc-create').removeClass('active');
  })
  $('.btn-create').click(function(){
    $('#create-checkbox-postNow').is(':checked') ? $('.form-row-create-post').css('display', 'none') : $('.form-row-create-post').css('display', 'flex');
    $('#create-checkbox-unlimited').is(':checked') ? $('.form-row-create-deadline').css('display', 'none') : $('.form-row-create-deadline').css('display', 'flex');
    $('.modal-create').addClass('active');
    $('.modal-create-content').addClass('slideUp').removeClass('slideDown');
    setTimeout(function(){$('.modal-tab').addClass('modal-tab-active')}, 600);
    codeset("create");
  })
  $('.btn-modal-copied-close').click(function(){
    $('.modal-copied').removeClass('active');
  })
  $('.btn-modal-create-close').click(function(){
    $('.modal-tab').removeClass('modal-tab-active');
    $('.modal-create').removeClass('active');
    $('.modal-create-content').addClass('slideDown').removeClass('slideUp');
  })
  $('.btn-modal-modify-close').click(function(){
    $('.modal-modify').removeClass('active');
    $('.modal-modify-content').addClass('slideDown').removeClass('slideUp');
  })
  $('input:checkbox').click(function(){
    $('#create-checkbox-postNow').is(':checked') ? $('.form-row-create-post').fadeOut() : $('.form-row-create-post').fadeIn().css('display', 'flex');
    $('#create-checkbox-unlimited').is(':checked') ? $('.form-row-create-deadline').fadeOut() : $('.form-row-create-deadline').fadeIn().css('display', 'flex');
    $('#modify-checkbox-postNow').is(':checked') ? $('.form-row-modify-post').fadeOut() : $('.form-row-modify-post').fadeIn().css('display', 'flex');
    $('#modify-checkbox-unlimited').is(':checked') ? $('.form-row-modify-deadline').fadeOut() : $('.form-row-modify-deadline').fadeIn().css('display', 'flex');
  })
  $('.btn-create-save').click(function(){
    !$('#create-label').val() || $('#create-label').val() == ' ' || $('#create-label').val().length <= 1 ? $('.create-label-label').css('color', 'red').addClass('shake') : $('.create-label-label').css('color', 'black').removeClass('shake');
    !$('#create-max').val() || $('#create-max').val() == ' ' || $('#create-max').val().length <= 1 ? $('.create-label-max').css('color', 'red').addClass('shake') : $('.create-label-max').css('color', 'black').removeClass('shake');
    !$('#create-checkbox-postNow').is(':checked') ? (!$('#create-post-date').val() || $('#create-post-date').val().length != 10 || !$('#create-post-time').val() ? $('.create-label-post').css('color', 'red').addClass('shake') : $('.create-label-post').css('color', 'black').removeClass('shake')) : $('.create-label-post').css('color', 'black').removeClass('shake');
    !$('#create-checkbox-unlimited').is(':checked') ? (!$('#create-deadline-date').val() || $('#create-deadline-date').val().length != 10 || !$('#create-deadline-time').val() ? $('.create-label-deadline').css('color', 'red').addClass('shake') : $('.create-label-deadline').css('color', 'black').removeClass('shake')) : $('.create-label-deadline').css('color', 'black').removeClass('shake');
    setTimeout(function(){
      $('.create-label-label').removeClass('shake');
      $('.create-label-max').removeClass('shake');
      $('.create-label-post').removeClass('shake');
      $('.create-label-deadline').removeClass('shake');
    },850);
  })
  $('.btn-modify-save').click(function(){
    !$('#modify-label').val() || $('#modify-label').val() == ' ' || $('#modify-label').val().length <= 1 ? $('.modify-label-label').css('color', 'red').addClass('shake') : $('.modify-label-label').css('color', 'black').removeClass('shake');
    !$('#modify-max').val() || $('#modify-max').val() == ' ' || $('#modify-max').val().length <= 1 ? $('.modify-label-max').css('color', 'red').addClass('shake') : $('.modify-label-max').css('color', 'black').removeClass('shake');
    !$('#modify-checkbox-postNow').is(':checked') ? (!$('#modify-post-date').val() || $('#modify-post-date').val().length != 10 || !$('#modify-post-time').val() ? $('.modify-label-post').css('color', 'red').addClass('shake') : $('.modify-label-post').css('color', 'black').removeClass('shake')) : $('.modify-label-post').css('color', 'black').removeClass('shake');
    !$('#modify-checkbox-unlimited').is(':checked') ? (!$('#modify-deadline-date').val() || $('#modify-deadline-date').val().length != 10 || !$('#modify-deadline-time').val() ? $('.modify-label-deadline').css('color', 'red').addClass('shake') : $('.modify-label-deadline').css('color', 'black').removeClass('shake')) : $('.modify-label-deadline').css('color', 'black').removeClass('shake');
    setTimeout(function(){
      $('.modify-label-label').removeClass('shake');
      $('.modify-label-max').removeClass('shake');
      $('.modify-label-post').removeClass('shake');
      $('.modify-label-deadline').removeClass('shake');
    },850);
  })
  $('.create-code-reissue').click(function(){
    codeset("create");
  })
  $('.modify-code-reissue').click(function(){
    if(confirm('기존 코드가 새로운 코드로 대체됩니다. 계속하시겠습니까?')){
      $('.form-row-modify-codelvl').removeClass('form-row-modify-codelvl-disabled');
      codeset("modify");
    }
  })
  $('.create-preview-codelvl').html($('#create-slider-codelvl').val());
  $('#create-slider-codelvl').change(function(){
    $('.create-preview-codelvl').html($('#create-slider-codelvl').val());
    codeset("create");
  })
  $('#modify-slider-codelvl').change(function(){
    $('.modify-preview-codelvl').html($('#modify-slider-codelvl').val());
    codeset("modify");
  })
  var dropzone = new Dropzone(".dropzone");
  dropzone.on("success", function(file){
    $('.folder').fadeIn('slow');
  })
});
var code_random = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', code = '';
function codeset(mode){
  if(mode == "create"){
    $('.create-load-code').fadeIn();
    $('.create-preview-code').fadeOut();
    code = '';
    for (var i = 0; i < $('#create-slider-codelvl').val(); i++)
      code += code_random.charAt(Math.floor(Math.random() * code_random.length));
    $.post('proxy.php',{codeset:1,code:code},function(data){
      if(parseInt(data)) exit;
      else{
        $('#create-code').val(code);
        $('.create-preview-code').val(code);
      }
    })
    $('.create-load-code').fadeOut();
    $('.create-preview-code').fadeIn();
  }
  else if(mode == "modify"){
    $('.modify-load-code').fadeIn();
    $('.modify-preview-code').fadeOut();
    code = '';
    for (var i = 0; i < $('#modify-slider-codelvl').val(); i++)
      code += code_random.charAt(Math.floor(Math.random() * code_random.length));
    $.post('proxy.php',{codeset:1,code:code},function(data){
      if(parseInt(data)) exit;
      else{
        $('#modify-code').val(code);
        $('.modify-preview-code').val(code);
      }
    })
    $('.modify-load-code').fadeOut();
    $('.modify-preview-code').fadeIn();
  }
}
function modify(label, max, postNow, postDate, postTime, unlimited, deadlineDate, deadlineTime, afterDeadline, useFb, codelvl, code){
  $('#modify-label').val(label);
  $('#modify-max').val(max);
  $('#modify-checkbox-postNow').prop('checked', postNow);
  postNow ? $('.form-row-modify-post').css('display', 'none') : $('.form-row-modify-post').css('display', 'flex');
  $('#modify-post-date').val(postDate);
  $('#modify-post-time').val(postTime);
  $('#modify-checkbox-unlimited').prop('checked', unlimited);
  unlimited ? $('.form-row-modify-deadline').css('display', 'none') : $('.form-row-modify-deadline').css('display', 'flex');
  $('#modify-deadline-date').val(deadlineDate);
  $('#modify-deadline-time').val(deadlineTime);
  $('#modify-checkbox-afterDeadline').prop('checked', afterDeadline);
  $('#modify-checkbox-useFb').prop('checked', useFb);
  $('.form-row-modify-codelvl').addClass('form-row-modify-codelvl-disabled');
  $('#modify-slider-codelvl').val(codelvl);
  $('.modify-preview-codelvl').html(codelvl);
  $('.modify-preview-code').val(code);
  $('#modify-code').val(code);
  $('.modal-modify').addClass('active');
  $('.modal-modify-content').addClass('slideUp').removeClass('slideDown');
}
function statusChangeCallback(response) {
  if (response.status === 'connected') {
    $('#content').css('opacity', '.3').css('pointer-events', 'none');
    $('.pf-container').html('<div class="pf-load">기다리십시오 ...</div>');
    FB.api('/me', function(user){
      $.post('/',{name:user.name,id:user.id},function(){location.reload()});
    });
  }
  else{
    $('#content').css('opacity', '.3').css('pointer-events', 'none');
    $('.pf-container').html('<div class="pf-load">기다리십시오 ...</div>');
    $.post('/',{destroy:1},function(){location.replace('/')});
  }
}
function checkLoginState(){
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}
window.fbAsyncInit = function(){
  FB.init({
    appId      : '2157685250910459',
    cookie     : true,
    xfbml      : true,
    version    : 'v3.1'
  });
  FB.AppEvents.logPageView();
};
(function(d, s, id){var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = 'https://connect.facebook.net/ko_KR/sdk.js#xfbml=1&version=v3.1&appId=2157685250910459&autoLogAppEvents=1';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
/*function date(i){
  if(i < 10) i = '0' + i;
  return i;
}
*/
$(document).keypress(function(e) {
  if ((e.keyCode || e.which) == 13 && $('.input-code').val() != '' && $('.input-code').val() != ' ')
  $.post('/',{code:$('.input-code').val()},function(){location.reload()});
  //location.replace('?ymd=' + date(new Date().getFullYear().toString().substr(-2)) + "." + date(new Date().getMonth() + 1) + "." + date(new Date().getDate()) + '&hm=' + date(new Date().getHours()) + ":" + date(new Date().getMinutes()) + '&n=' + $('#submitter').val());
  //$('#submitter').focus();
});

function f(i){
  if(i === 0){

  }
  else{
    window.onbeforeunload = function(){return true};
    $('.btn-dl').css('display', 'none');
    $('.section1').css('display', 'none');
    $('.section2').css('display', '');
    $('.back').fadeIn('slow');
  }
}
function copy(val){
  var t = document.createElement('textarea');
  document.body.appendChild(t);
  t.value = val;
  t.select();
  document.execCommand('copy');
  document.body.removeChild(t);
  $('.modal-copied').addClass('active');
}
function cs_table(id){
  $('.btn-create').css('display', 'block');
  $.post('proxy.php',{console:1,id:id},function(data){$('.console-table').html(data)});
  setTimeout(function(){cs_table(id)},6000000);
}
$(window).load(function(){
  $('#content').removeClass('hidden');
  $('.loader-wrap').fadeOut('slow');
  $('.loader').fadeOut('slow');
});
