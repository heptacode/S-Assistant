<?
// if(!isset($_SERVER['HTTP_X_REQUESTED_WITH'])){
//   header('HTTP/1.0 403 Forbidden');
//   die('<meta http-equiv="refresh" content="0;url=/">');
// }
date_default_timezone_set('KST');
$connect = mysqli_connect("hyunwoo.org:3307", "submit", "AccountForSubmit", "submit") or die("데이터베이스와 연결을 수립할 수 없습니다.");
if($_POST['codeset'] && $_POST['code']){
  $query = "SELECT * FROM forms";
  $result = mysqli_query($connect, $query);
  $codeoverlap = false;
  while($data = mysqli_fetch_array($result)){
    if($_POST['code'] == $data['code']) $codeoverlap = true;
  }
  echo $codeoverlap ?  1 : 0;
}

elseif($_POST['console'] && isset($_POST['id'])){
  $query = "SELECT * FROM forms ORDER BY forms.ID DESC";
  $result = mysqli_query($connect, $query);
  $nodata = true;
  $thead = false;
  while($data = mysqli_fetch_array($result)){
    if($data['owner'] == $_POST['id']){
      if(!$thead){
        echo'<table><tr><th>레이블</th><th>코드</th><th>제출</th><th class="td-auto">생성</th><th class="td-auto">게시</th><th class="td-auto">마감</th><th class="td-auto">중복 방지</th><th class="td-auto">권한</th></tr>';
        $thead = true;
      }
      $nodata = false;
      $diff = time() - strtotime($data['createTsp']);
      $s = 60; //1분 = 60초
      $h = $s * 60; //1시간 = 60분
      $d = $h * 24; //1일 = 24시간
      $y = $d * 10; //1년 = 1일 * 10일
      if($diff < 0) $create = abs($diff)."초 후";
      elseif($diff < $s) $create = $diff.'초 전';
      elseif($h > $diff && $diff >= $s) $create = round($diff/$s).'분 전';
      elseif($d > $diff && $diff >= $h) $create = round($diff/$h).'시간 전';
      elseif($y > $diff && $diff >= $d) $create = round($diff/$d).'일 전';
      else $create = /*strtok($data['tsp'], "-").'.&nbsp'.strtok("-").'.&nbsp;'.strtok("-");*/date("Y. m. d", $data['TIME']);
      
      $diff = strtotime($data['postTsp']) - time();
      if($diff < 0 || $data['postNow']) $post = '게시됨';
      else if($diff < $s) $post = $diff.'초 후';
      elseif($h > $diff && $diff >= $s) $post = round($diff/$s).'분 후';
      elseif($d > $diff && $diff >= $h) $post = round($diff/$h).'시간 후';
      elseif($y > $diff && $diff >= $d) $post = round($diff/$d).'일 후';
      elseif($y > $diff && $diff >= $d) $post = round($diff/$d).'개월 후';
      else $post = date("Y. m. d", $diff);

      $diff = strtotime($data['deadlineTsp']) - time();
      if($diff < 0){
        if($data['unlimited'])
          $expire = '무기한';
        else {
          $post = '비공개';
          $expire = '마감됨';
        }
      }
      else if($diff < $s) $expire = $diff.'초 후';
      elseif($h > $diff && $diff >= $s) $expire = round($diff/$s).'분 후';
      elseif($d > $diff && $diff >= $h) $expire = round($diff/$h).'시간 후';
      elseif($y > $diff && $diff >= $d) $expire = round($diff/$d).'일 후';
      elseif($y > $diff && $diff >= $d) $expire = round($diff/$d).'개월 후';
      else $expire = date("Y. m. d", $diff);
      $postTsp = explode(' ', $data['postTsp']);
      $deadlineTsp = explode(' ', $data['deadlineTsp']);
      $data['useFb'] ? $usefb = 사용 : $usefb = 안함;
      if($data['owner'] == $_POST['id']) $owner = '소유자';
      $modify ="'".$data['label']."',".$data['max'].",".$data['postNow'].","."'".$postTsp[0]."',"."'".$postTsp[1]."',".$data['unlimited'].","."'".$deadlineTsp[0]."',"."'".$deadlineTsp[1]."',".$data['afterDeadline'].",".$data['useFb'].",".$data['codelvl'].",".$data['code'];
      echo '<tr><th>'.$data['label'].'<br><button class="btn-modify" onclick="modify('.$modify.')" type="button">관리</button></th><td><button class="btn-code" onclick=copy("https://submit.hyunwoo.org/'.$data['code'].'") type="button">'.$data['code'].'</button></td><td>'.$data['submits'].'/'.$data['max'].'</td><td class="td-auto">'.$create.'</td><td class="td-auto">'.$post.'</td><td class="td-auto">'.$expire.'</td><td class="td-auto">'.$usefb.'</td><td class="td-auto">'.$owner.'</td></tr>';
    }
  }
  if($nodata)  echo '<div class="notice-nodata">+ 버튼을 눌러 새로운 폼을 생성하세요!</div>';
  echo '</table>';
}

elseif($_POST['create']){
  $postTsp = $_POST['postDate'].' '.$_POST['postTime'];
  $deadlineTsp = $_POST['deadlineDate'].' '.$_POST['deadlineTime'];
  // $postTsp = "0000-00-00 00:00";
  // $deadlineTsp = "0000-00-00 00:00:00";
  $submits = "0";
  $undefined = "0";
  /*테이블 생성 명령어 추가*/
  $query = "INSERT INTO forms VALUES (NULL, '".date("Y-m-d H:i:s")."', '".$_POST['label']."', '".$_POST['maxval']."', '".$_POST['postNow']."', '".$postTsp."', '".$_POST['unlimitedval']."', '".$deadlineTsp."', '".$_POST['afterDeadline']."', '".$_POST['useFb']."', '".$_POST['codelvl']."', '".$_POST['code']."', '".$submits."', '".$_POST['id']."', '".$undefined."', '".$undefined."')";
  $result = mysqli_query($connect, $query);
  echo $result ?  1 : 0;
}

elseif($_POST['modify']){
  // $_POST['label']
  // $_POST['max']
  // $_POST['postNow']
  // $_POST['postDate']
  // $_POST['postTime']
  // $_POST['unlimited']
  // $_POST['deadlineDate']
  // $_POST['deadlineTime']
  // $_POST['afterDeadline']
  // $_POST['useFb']
  // $_POST['codelvl']
  // $_POST['code']
}
    /*
if(isset($_GET['d']) && isset($_GET['v']) && !empty($_GET['d']) && !empty($_GET['v'])){
  $dir = "./submit/SUBMIT.HYUNWOO.ORG/".$_GET['d']."/".$_GET['v'];
  $files = scandir($dir);
  echo '
  <div id="content">
  <section class="section">
  <div class="folder2"></div>
  <table>
  <tr><th>#</th><th>파일명</th></tr>';
  for($i = 2; $files[$i]; $i++)
  echo'<tr><td>'.($i - 1).'</td><td><a href="https://submit-cdn.hyunwoo.org/"'.$_GET['d'].'/'.$_GET['v'].'/'.$files[$i].'" target="_blank">'.$files[$i].'</a></td></tr>';
  echo "</table></section></div>";}*/
  
mysqli_close($connect); ?>
