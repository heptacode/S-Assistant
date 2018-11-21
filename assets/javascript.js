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
var server = "https://submit.hyunwoo.org/", modifyCode;





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
  $('.btn-signIn').click(function(){
    signIn();
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
    setTimeout(function(){$('.modal-tab-create').addClass('modal-tab-active')}, 600);
    codeSet();
  })
  $('.btn-modal-copied-close').click(function(){
    $('.modal-copied').removeClass('active');
  })
  $('.btn-modal-create-close').click(function(){
    $('.modal-tab-create').removeClass('modal-tab-active');
    $('.modal-create').removeClass('active');
    $('.modal-create-content').addClass('slideDown').removeClass('slideUp');
  })
  $('.btn-modal-modify-close').click(function(){
    $('.modal-tab-modify').removeClass('modal-tab-active');
    $('.modal-modify').removeClass('active');
    $('.modal-modify-content').addClass('slideDown').removeClass('slideUp');
  })

  /*수정 필요 */
  $('input:checkbox').mousedown(function(){
    $('#create-checkbox-postNow').is(':checked') ? $('.form-row-create-post').fadeOut() : $('.form-row-create-post').fadeIn().css('display', 'flex');
    // $('#create-checkbox-unlimited').is(':checked') ? $('.form-row-create-deadline').fadeOut() : $('.form-row-create-deadline').fadeIn().css('display', 'flex');
    // $('#modify-checkbox-postNow').is(':checked') ? $('.form-row-modify-post').fadeOut() : $('.form-row-modify-post').fadeIn().css('display', 'flex');
    // $('#modify-checkbox-unlimited').is(':checked') ? $('.form-row-modify-deadline').fadeOut() : $('.form-row-modify-deadline').fadeIn().css('display', 'flex');
  })
  /* */

  $('input:checkbox').click(function(){
    $('#create-checkbox-postNow').is(':checked') ? $('.form-row-create-post').fadeOut() : $('.form-row-create-post').fadeIn().css('display', 'flex');
    $('#create-checkbox-unlimited').is(':checked') ? $('.form-row-create-deadline').fadeOut() : $('.form-row-create-deadline').fadeIn().css('display', 'flex');
    $('#modify-checkbox-postNow').is(':checked') ? $('.form-row-modify-post').fadeOut() : $('.form-row-modify-post').fadeIn().css('display', 'flex');
    $('#modify-checkbox-unlimited').is(':checked') ? $('.form-row-modify-deadline').fadeOut() : $('.form-row-modify-deadline').fadeIn().css('display', 'flex');
  })
  $('.btn-create-save').click(function(){
    $(this).prop('disabled', 'disabled').addClass('btn-save-disabled');
    var valid = true;
    !$('#create-label').val() || $('#create-label').val() == ' '? (valid = false, $('.create-label-label').css('color', 'red').addClass('shake'), setTimeout(function(){$('.create-label-label').removeClass('shake')}, 800)) : $('.create-label-label').css('color', 'black').removeClass('shake');
    !$('#create-max').val() || $('#create-max').val() == ' ' || $('#create-max').val() <= 0 || $('#create-max').val() > 1000 ? (valid = false, $('.create-label-max').css('color', 'red').addClass('shake'), setTimeout(function(){$('.create-label-max').removeClass('shake')}, 800)) : $('.create-label-max').css('color', 'black').removeClass('shake');
    !$('#create-checkbox-postNow').is(':checked') ? (!$('#create-post-date').val() || $('#create-post-date').val().length != 10 || !$('#create-post-time').val() ? (valid = false, $('.create-label-post').css('color', 'red').addClass('shake'), setTimeout(function(){$('.create-label-post').removeClass('shake')}, 800)) : $('.create-label-post').css('color', 'black').removeClass('shake')) : $('.create-label-post').css('color', 'black').removeClass('shake');
    !$('#create-checkbox-unlimited').is(':checked') ? (!$('#create-deadline-date').val() || $('#create-deadline-date').val().length != 10 || !$('#create-deadline-time').val() ? (valid = false, $('.create-label-deadline').css('color', 'red').addClass('shake'), setTimeout(function(){$('.create-label-deadline').removeClass('shake')}, 800)) : $('.create-label-deadline').css('color', 'black').removeClass('shake')) : $('.create-label-deadline').css('color', 'black').removeClass('shake');
    valid ?
      ($('.modal-form-create input').prop('disabled', 'disabled'),
      $.post('/proxy',{
        do:'create',
        label:$('#create-label').val(),
        max:$('#create-max').val(),
        postNow:$('#create-checkbox-postNow').prop('checked') ? 1 : 0,
        postDate:$('#create-post-date').val(),
        postTime:$('#create-post-time').val(),
        unlimited:$('#create-checkbox-unlimited').prop('checked') ? 1 : 0,
        deadlineDate:$('#create-deadline-date').val(),
        deadlineTime:$('#create-deadline-time').val(),
        afterDeadline:$('#create-checkbox-afterDeadline').prop('checked') ? 1 : 0,
        useFb:$('#create-checkbox-useFb').prop('checked') ? 1 : 0,
        codelvl:$('#create-slider-codelvl').val(),
        code:$('#create-code').val(),
        id:$('#fbId').val()
      }, function (data){parseInt(data) ? ($('.modal-tab-create').removeClass('modal-tab-active'), $('.modal-create').removeClass('active'), $('.modal-create-content').addClass('slideDown').removeClass('slideUp'), $('.modal-form-create').trigger('reset'), $('.modal-form-create input').prop('disabled', false), $('.btn-create-save').removeClass('btn-save-disabled').prop('disabled', false)) : ($('.btn-create-save').removeClass('btn-save-disabled').prop('disabled', false), $('.modal-form-create input').prop('disabled', false), alert('데이터 입력에 실패하였습니다.\n일시적인 네트워크 오류일 수 있으므로 잠시 후에 다시 시도하십시오.'))})) :
      $('.btn-create-save').removeClass('btn-save-disabled').prop('disabled', false);
  })
  $('.btn-modify-save').click(function(){
    $(this).prop('disabled', 'disabled').addClass('btn-save-disabled');
    var valid = true;
    !$('#modify-label').val() || $('#modify-label').val() == ' ' ? (valid = false, $('.modify-label-label').css('color', 'red').addClass('shake'), setTimeout(function(){$('.modify-label-label').removeClass('shake')},800)) : $('.modify-label-label').css('color', 'black').removeClass('shake');
    !$('#modify-max').val() || $('#modify-max').val() == ' ' || $('#modify-max').val() <= 0 || $('#modify-max').val() > 1000  ? (valid = false, $('.modify-label-max').css('color', 'red').addClass('shake'), setTimeout(function(){$('.modify-label-max').removeClass('shake')},800)) : $('.modify-label-max').css('color', 'black').removeClass('shake');
    !$('#modify-checkbox-postNow').is(':checked') ? (!$('#modify-post-date').val() || $('#modify-post-date').val().length != 10 || !$('#modify-post-time').val() ? (valid = false, $('.modify-label-post').css('color', 'red').addClass('shake'), setTimeout(function(){$('.modify-label-post').removeClass('shake')},800)) : $('.modify-label-post').css('color', 'black').removeClass('shake')) : $('.modify-label-post').css('color', 'black').removeClass('shake');
    !$('#modify-checkbox-unlimited').is(':checked') ? (!$('#modify-deadline-date').val() || $('#modify-deadline-date').val().length != 10 || !$('#modify-deadline-time').val() ? (valid = false, $('.modify-label-deadline').css('color', 'red').addClass('shake'), setTimeout(function(){$('.modify-label-deadline').removeClass('shake')},800)) : $('.modify-label-deadline').css('color', 'black').removeClass('shake')) : $('.modify-label-deadline').css('color', 'black').removeClass('shake');
    valid ?
      ($('.modal-form-modify input').prop('disabled', 'disabled'),
      $.post('/proxy',{
        do:'modify',
        label:$('#modify-label').val(),
        max:$('#modify-max').val(),
        postNow:$('#modify-checkbox-postNow').prop('checked') ? 1 : 0,
        postDate:$('#modify-post-date').val(),
        postTime:$('#modify-post-time').val(),
        unlimited:$('#modify-checkbox-unlimited').prop('checked') ? 1 : 0,
        deadlineDate:$('#modify-deadline-date').val(),
        deadlineTime:$('#modify-deadline-time').val(),
        afterDeadline:$('#modify-checkbox-afterDeadline').prop('checked') ? 1 : 0,
        useFb:$('#modify-checkbox-useFb').prop('checked') ? 1 : 0,
        code:modifyCode
      },function(data){parseInt(data) ? ($('.modal-tab-modify').removeClass('modal-tab-active'), $('.modal-modify').removeClass('active'), $('.modal-modify-content').addClass('slideDown').removeClass('slideUp'), $('.modal-form-modify').trigger('reset'), $('.modal-form-modify input').prop('disabled', false), $('.btn-modify-save').removeClass('btn-save-disabled').prop('disabled', false)) : ($('.btn-modify-save').removeClass('btn-save-disabled').prop('disabled', false), $('.modal-form-modify input').prop('disabled', false), alert('데이터 수정에 실패하였습니다.\n일시적인 네트워크 오류일 수 있으므로 잠시 후에 다시 시도하십시오.'))})) :
      $('.btn-modify-save').removeClass('btn-save-disabled').prop('disabled', false);
  })
  $('.code-reissue').click(function(){
    $(this).prop('disabled', 'disabled').addClass('code-reissue-disabled');
    codeSet();
    setTimeout(function(){$('.code-reissue').removeClass('code-reissue-disabled').prop('disabled', false)}, 1000);
  })
  $('.form-remove').click(function(){
    if(confirm('폼 "'+$('#modify-label').val()+'"이(가) 영구적으로 삭제됩니다.')){
      $('.form-remove').prop('disabled', 'disabled').addClass('form-remove-disabled');
      $('.modal-form-modify').trigger('reset');
      $.post('/proxy',{
        do:'remove',
        code:modifyCode
      },function(data){parseInt(data) ? ($('.modal-tab-modify').removeClass('modal-tab-active'), $('.modal-modify').removeClass('active'), $('.modal-modify-content').addClass('slideDown').removeClass('slideUp'), $('.form-remove').removeClass('form-remove-disabled').prop('disabled', false)) : ($('.form-remove').removeClass('form-remove-disabled').prop('disabled', false), alert('폼 삭제에 실패하였습니다.\n일시적인 네트워크 오류일 수 있으므로 잠시 후에 다시 시도하십시오.'))});
    }
  })
  $('.create-preview-codelvl').html($('#create-slider-codelvl').val());
  $('#create-slider-codelvl').change(function(){
    $('.create-preview-codelvl').html($('#create-slider-codelvl').val());
    $('.code-reissue').prop('disabled', 'disabled').addClass('code-reissue-disabled');
    codeSet();
    setTimeout(function(){$('.code-reissue').removeClass('code-reissue-disabled').prop('disabled', false)}, 1000);
  })
  var dropzone = new Dropzone(".dropzone");
  dropzone.on("success", function(file){
    $('.folder').fadeIn('slow');
  })
})
$(document).keyup(function(e){
  if(e.keyCode == 13 || e.which == 13)
    signIn();
  else if(e.keyCode == 27 || e.which == 27){
    $('.modal-copied').removeClass('active');
    $('.modal-tab-create').removeClass('modal-tab-active');
    $('.modal-create').removeClass('active');
    $('.modal-create-content').addClass('slideDown').removeClass('slideUp');
    $('.modal-tab-modify').removeClass('modal-tab-active');
    $('.modal-modify').removeClass('active');
    $('.modal-modify-content').addClass('slideDown').removeClass('slideUp');
  }
})
function signIn(){
  var valid = true;
  if(!$('#input-name').val() || $('#input-name') == ' '){
    valid = false;
    $('#input-name').focus();
  }
  else if(!$('#input-code').val() || $('#input-code').val() == ' '){
    valid = false;
    $('#input-code').focus();
  }
  if(valid){
    $.post('/proxy', {
      do:'signIn',
      name:$('#input-name').val(),
      code:$('#input-code').val()
    },
    function(data){
      parseInt(data) ? location.replace('https://submit.hyunwoo.org/'+$('#input-code').val()) : alert('코드와 일치하는 폼이 존재하지 않습니다.\n확인 후 다시 입력하여 주십시오.');
    })}
}
var code_random = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', code = '';
function codeSet(){
  $('.create-load-code').fadeIn();
  $('.create-preview-code').css('display', 'none');
  code = '';
  for (var i = 0; i < $('#create-slider-codelvl').val(); i++)
    code += code_random.charAt(Math.floor(Math.random() * code_random.length));
  $.post('/proxy',{do:'codeSet', code:code},function(data){
    parseInt(data) ? exit : ($('#create-code').val(code), $('.create-preview-code').val(code))
  })
  $('.create-load-code').fadeOut();
  $('.create-preview-code').css('display', 'block');
}

function modify(label, max, postNow, postDate, postTime, unlimited, deadlineDate, deadlineTime, afterDeadline, useFb, code){
  $('.modal-form-modify-title-label').text(label);
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
  $('.modify-preview-code').val(code);
  modifyCode = code;
  $('.modal-modify').addClass('active');
  $('.modal-modify-content').addClass('slideUp').removeClass('slideDown');
  setTimeout(function(){$('.modal-tab-modify').addClass('modal-tab-active')}, 600);
}

function statusChangeCallback(response) {
  if (response.status === 'connected') {
    $('#content').css('opacity', '.3').css('pointer-events', 'none');
    $('.pf-container').html('<div class="pf-load">기다리십시오 ...</div>');
    FB.api('/me', function(user){
      Cookies.set('fbValid', true, { expires: 1, secure: true });
      Cookies.set('fbId', user.id, { expires: 1, secure: true });
      Cookies.set('fbName', user.name, { expires: 1, secure: true });
      location.reload();
    });
  }
  else{
    $('#content').css('opacity', '.3').css('pointer-events', 'none');
    $('.pf-container').html('<div class="pf-load">기다리십시오 ...</div>');
    Cookies.remove('fbValid');
    Cookies.remove('fbId');
    Cookies.remove('fbName');
    location.reload();
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

function copy(val){
  var t = document.createElement('textarea');
  document.body.appendChild(t);
  t.value = val;
  t.select();
  document.execCommand('copy');
  document.body.removeChild(t);
  $('.modal-copied').addClass('active');
}

function cs_table(fbId){
  $.post('proxy.php',{do:'console', id:fbId},function(data){$('.console-table').html(data)});
  setTimeout(function(){cs_table(fbId)},1000);
}

// window.onbeforeunload = function(){return true};

function initialize(){
  if(!Cookies.get('fbValid')){
    $('.pf-container').removeClass('pf-container-valid');
    $('.pf-icon').css('display', 'none');
    $('.pf-name').css('display', 'none');
    $('.fb-login-button').attr('data-size', 'medium');
    $('.field').css('overflow-y', 'hidden');
    // $('.btn-restore').css('display', 'block');
    // $('.signin-container').css('display', 'none');
    // $('.console-container').css('display', 'block');
    // $('.btn-create').css('display', 'none');
  }
  else {
    $('.pf-container').addClass('pf-container-valid');
    $('.pf-icon').css('background', 'url(https://graph.facebook.com/'+Cookies.get('fbId')+'/picture) no-repeat center/contain');
    $('.pf-name').text(Cookies.get('fbName'));
    $('.fb-login-button').attr('data-size', 'small');
    $('.field').css('overflow-y', 'auto');
    // $('.btn-restore').css('display', 'block');
    $('.signin-container').css('display', 'none');
    $('.console-container').css('display', 'block');
    $('.btn-create').css('display', 'block');
    cs_table(Cookies.get('fbId'));
  }
}

$(window).load(function(){
  initialize();
  $('#content').removeClass('hidden');
  $('.loader-wrap').fadeOut('slow');
  $('.loader').fadeOut('slow');
});
