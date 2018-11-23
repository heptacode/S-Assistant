<?
// if (!isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
//     header('HTTP/1.0 403 Forbidden');
//     die('<meta http-equiv="refresh" content="0;url=/">');
// }
date_default_timezone_set('KST');
$connect = mysqli_connect('hyunwoo.org:3307', 'submit', 'AccountForSubmit', 'submit') or die(0);
$sever = 'https://submit.hyunwoo.org/';
$ds = DIRECTORY_SEPARATOR;

switch ($_POST['do']) {
    case 'fbLogin':
        $overlap = false;
        $query = "SELECT fbId FROM accounts";
        $result = mysqli_query($connect, $query);
        while ($data = mysqli_fetch_array($result)) {
            if ($_POST['fbId'] == $data['fbId']) {
                $overlap = true;
            }
        }

        $query = "INSERT INTO accounts VALUES (NULL, '" . date('Y-m-d H:i:s') . "', '" . $_POST['fbId'] . "', '" . $_POST['fbName'] . "')";
        !$overlap ? mysqli_query($connect, $query) : null;
        break;

    case 'signIn':
        strChk($_POST['name'] . $_POST['code']);
        $query = "SELECT code FROM forms";
        $result = mysqli_query($connect, $query);
        $exist = false;
        while ($data = mysqli_fetch_array($result)) {
            if ($_POST['code'] == $data['code']) {
                $exist = true;
            }
        }

        echo $exist ? 1 : 0;
        break;

    case 'submitValidate':
        $returnValue = null;
        $query = "SELECT * FROM forms";
        $result = mysqli_query($connect, $query);
        while ($data = mysqli_fetch_array($result)) {
            if ($_POST['code'] == $data['code']) {
                if ($data['useFb'] && !$_COOKIE['fbValid']) {
                    $returnValue = 'validationError_fbRequired';
                } elseif ($data['submits'] >= $data['max']) {
                    $returnValue = 'validationError_maxLimit';
                } elseif (!$data['postNow'] && strtotime($data['postTsp']) > time()) {
                    $returnValue = 'validationError_beforePost';
                } elseif (!$data['unlimited'] && strtotime($data['deadlineTsp']) < time() && !$data['afterDeadline']) {
                    $returnValue = 'validationError_expired';
                } else {
                    $returnValue = $data['label'];
                }

            }
        }
        echo $returnValue;
        break;

    case 'codeSet':
        $query = "SELECT code FROM forms";
        $result = mysqli_query($connect, $query);
        $overlap = false;
        while ($data = mysqli_fetch_array($result)) {
            if ($_POST['code'] == $data['code']) {
                $overlap = true;
            }
        }

        echo $overlap ? 1 : 0;
        break;

    case 'console':
        $query = "SELECT * FROM forms ORDER BY forms.Id DESC";
        $result = mysqli_query($connect, $query);
        $nodata = true;
        $thead = false;
        while ($data = mysqli_fetch_array($result)) {
            if ($data['owner'] == $_COOKIE["fbId"]) {
                if (!$thead) {
                    echo '<table><tr><th>레이블</th><th>코드</th><th>제출</th><th class="td-auto">생성</th><th class="td-auto">게시</th><th class="td-auto">마감</th><th class="td-auto">마감 후 제출</th><th class="td-auto">FB 인증</th><th class="td-auto">권한</th></tr>';
                    $thead = true;
                }
                $nodata = false;
                $diff = time() - strtotime($data['createTsp']);
                $s = 60;
                $h = $s * 60;
                $d = $h * 24;
                $y = $d * 10;
                if ($diff < 0) {
                    $create = abs($diff) . '초 후';
                } elseif ($diff < $s) {
                    $create = $diff . '초 전';
                } elseif ($h > $diff && $diff >= $s) {
                    $create = round($diff / $s) . '분 전';
                } elseif ($d > $diff && $diff >= $h) {
                    $create = round($diff / $h) . '시간 전';
                } elseif ($y > $diff && $diff >= $d) {
                    $create = round($diff / $d) . '일 전';
                } else {
                    $create = date('Y. m. d', $data['TIME']);
                }

                $diff = strtotime($data['postTsp']) - time();
                if ($diff < 0 || $data['postNow']) {
                    $post = '게시됨';
                } else if ($diff < $s) {
                    $post = $diff . '초 후';
                } elseif ($h > $diff && $diff >= $s) {
                    $post = round($diff / $s) . '분 후';
                } elseif ($d > $diff && $diff >= $h) {
                    $post = round($diff / $h) . '시간 후';
                } elseif ($y > $diff && $diff >= $d) {
                    $post = round($diff / $d) . '일 후';
                } elseif ($y > $diff && $diff >= $d) {
                    $post = round($diff / $d) . '개월 후';
                } else {
                    $post = date('Y. m. d', $diff);
                }

                $diff = strtotime($data['deadlineTsp']) - time();
                if ($diff < 0) {
                    if ($data['unlimited']) {
                        $expire = '무기한';
                    } else {
                        $post = '비공개';
                        $expire = '마감됨';
                    }
                } else if ($diff < $s) {
                    $expire = $diff . '초 후';
                } elseif ($h > $diff && $diff >= $s) {
                    $expire = round($diff / $s) . '분 후';
                } elseif ($d > $diff && $diff >= $h) {
                    $expire = round($diff / $h) . '시간 후';
                } elseif ($y > $diff && $diff >= $d) {
                    $expire = round($diff / $d) . '일 후';
                } elseif ($y > $diff && $diff >= $d) {
                    $expire = round($diff / $d) . '개월 후';
                } else {
                    $expire = date('Y. m. d', $diff);
                }

                $postTsp = explode(' ', $data['postTsp']);
                $deadlineTsp = explode(' ', $data['deadlineTsp']);
                $data['afterDeadline'] ? $afterDeadline = 허용 : $afterDeadline = 금지;
                $data['useFb'] ? $usefb = 사용 : $usefb = 안함;
                if ($data['owner'] == $_COOKIE["fbId"]) {
                    $owner = '소유자';
                }

                $modify = "'" . $data['label'] . "'," . $data['max'] . "," . $data['postNow'] . "," . "'" . $postTsp[0] . "'," . "'" . $postTsp[1] . "'," . $data['unlimited'] . "," . "'" . $deadlineTsp[0] . "'," . "'" . $deadlineTsp[1] . "'," . $data['afterDeadline'] . "," . $data['useFb'] . ",'" . $data['code'] . "'";
                echo '<tr><th>' . $data['label'] . '<br><button class="btn-modify" onclick="modify(' . $modify . ')" type="button">관리</button></th><td><button class="btn-code" onclick=copy("https://submit.hyunwoo.org/' . $data['code'] . '") type="button">' . $data['code'] . '</button></td><td>' . $data['submits'] . '/' . $data['max'] . '</td><td class="td-auto">' . $create . '</td><td class="td-auto">' . $post . '</td><td class="td-auto">' . $expire . '</td><td class="td-auto">' . $afterDeadline . '</td><td class="td-auto">' . $usefb . '</td><td class="td-auto">' . $owner . '</td></tr>';
            }
        }
        if ($nodata) {
            echo '<div class="notice-nodata">+ 버튼을 눌러 새로운 폼을 생성하세요!</div>';
        }

        echo '</table>';
        break;

    case 'create':
        strChk($_POST['label']);
        $tableName = $_POST['code'];
        $postTsp = $_POST['postDate'] . ' ' . $_POST['postTime'];
        $deadlineTsp = $_POST['deadlineDate'] . ' ' . $_POST['deadlineTime'];
        $query = "INSERT INTO forms VALUES (NULL, '" . date('Y-m-d H:i:s') . "', '" . $_POST['label'] . "', '" . $_POST['max'] . "', '" . $_POST['postNow'] . "', '" . $postTsp . "', '" . $_POST['unlimited'] . "', '" . $deadlineTsp . "', '" . $_POST['afterDeadline'] . "', '" . $_POST['useFb'] . "', '" . $_POST['code'] . "', '0', '" . $_POST['fbId'] . "', '', '')";
        $result = mysqli_query($connect, $query);
        $dir1 = "." . $ds . "submit" . $ds . $_POST['fbId'] . $ds;
        $dir2 = $dir1 . $_POST['code'] . $ds;
        mkdir($dir1, 0700);
        mkdir($dir2, 0700);
        echo $result ? 1 : 0;
        break;

    case 'modify':
        strChk($_POST['label']);
        $postTsp = $_POST['postDate'] . ' ' . $_POST['postTime'];
        $deadlineTsp = $_POST['deadlineDate'] . ' ' . $_POST['deadlineTime'];
        $query = "UPDATE forms SET label='" . $_POST['label'] . "', max='" . $_POST['max'] . "', postNow='" . $_POST['postNow'] . "', postTsp='" . $postTsp . "', unlimited='" . $_POST['unlimited'] . "', deadlineTsp='" . $deadlineTsp . "', afterDeadline='" . $_POST['afterDeadline'] . "', useFb='" . $_POST['useFb'] . "' WHERE code='" . $_POST['code'] . "'";
        $result = mysqli_query($connect, $query);
        echo $result ? 1 : 0;
        break;

    case 'remove':
        $code = $_POST['code'];
        $query = "DELETE FROM forms WHERE code='$code'";
        $result = mysqli_query($connect, $query);
        rmdirAll("." . $ds . "submit" . $ds . $_COOKIE['fbId'] . $ds . $_POST['code'] . $ds);
        echo $result ? 1 : 0;
        break;

    case 'ownerFbId':
        $query = "SELECT * FROM forms";
        $result = mysqli_query($connect, $query);
        while ($data = mysqli_fetch_array($result)) {
            if ($data['code'] == $_POST["code"]) {
                die($data['owner']);
            }
        }
        break;

    case 'explorer':
        $files = scandir($_POST['dir']);
        for ($i = 2; $files[$i]; $i++) {
            if (strpos($files[$i], '.DS_Store') !== false || strpos($files[$i], '@eaDir') !== false) {
                continue;
            }

            $exist = false;
            $query = "SELECT * FROM forms";
            $result = mysqli_query($connect, $query);
            while ($data = mysqli_fetch_array($result)) {
                if ($data['code'] == $files[$i]) {
                    $exist = true;
                    $label = $data['label'];
                }
            }
            $target = "'" . $files[$i] . "'";
            echo $exist ? '<div class="folder-group" onclick=openDir("' . $files[$i] . '")><div class="folder"></div><div class="folder-name">' . $label . '</div></div>' : '<div class="file-group"><div class="file-remove" onclick="remove(' . $target . ')"></div><div class="file" onclick="download(' . $target . ')"></div><div class="file-name" onclick="download(' . $target . ')">' . $files[$i] . '</div></div>';
        }
        break;

    case 'unlink':
        // unlink($_POST['dir'].$_POST['target']);
        rename($_POST['dir'].$_POST['target'], ".".$ds."trashes".$ds.$_POST['target']);
        break;
}

/*
클라이언트 파일 수신 처리
 */
if (!empty($_FILES)) {
    $deny = array('php', 'htaccess');
    $ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    if (in_array($ext, $deny)) {
        die(0);
    }

    $dir1 = "." . $ds . "submit" . $ds . $_COOKIE['ownerFbId'] . $ds;
    $dir2 = $dir1 . $_COOKIE['code'] . $ds;
    mkdir($dir1, 0700);
    mkdir($dir2, 0700);
    $tempFile = $_FILES['file']['tmp_name'];
    $targetFile = dirname(__FILE__) . $ds . $dir2 . $ds . pathinfo($_FILES['file']['name'], PATHINFO_FILENAME) . '_' . ($_COOKIE['fbValid'] ? $_COOKIE['fbName'] : $_COOKIE['name']) . '.' . $ext;
    move_uploaded_file($tempFile, $targetFile);

    $query = "SELECT submits FROM forms WHERE code='" . $_COOKIE['code'] . "'";
    $result = mysqli_query($connect, $query);
    $data = mysqli_fetch_array($result);
    $submits = ++$data['submits'];
    $query = "UPDATE forms SET submits='" . $submits . "' WHERE code='" . $_COOKIE['code'] . "'";
    mysqli_query($connect, $query);
}
mysqli_close($connect);

/*
사전 정의 함수 영역
 */

function strChk($str)
{
    $deny = array('!', '@', '$', '%', '^', '&', '*', '`', '~', '\\', '/', '\/', '<', '>', '|', ':', ';');
    for ($i = 0; $i < count($deny); $i++) {
        if (strpos($str, $deny[$i]) !== false) {
            die(0);
        }
    }
}

function rmdirAll($dir)
{
    while (($entry = dir($dir)->read()) !== false) {
        if (($entry != '.') && ($entry != '..')) {
            if (is_dir($dir . '/' . $entry)) {
                rmdirAll($dir . '/' . $entry);
            } else {
                @unlink($dir . '/' . $entry);
            }

        }
    }
    dir($dir)->close();
    @rmdir($dir);
}
//  REF  |  http://flystone.tistory.com/54 (PHP, rmdir과 폴더 통째로 지우기)
