<?
// if (!isset($_SERVER['HTTP_X_REQUESTED_WITH'])) {
//     header('HTTP/1.0 403 Forbidden');
//     exit('<meta http-equiv="refresh" content="0;url=/">');
// }
date_default_timezone_set('KST');
$connect = mysqli_connect('localhost:3307', 'submit', 'AccountForSubmit', 'submit') or exit(false);
$sever = 'https://submit.hyunwoo.org/';
$ds = DIRECTORY_SEPARATOR;

/*
클라이언트 파일 수신 처리
 */
if (!empty($_FILES)) {
    $deny = array('php', 'htaccess');
    $ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    if (in_array($ext, $deny)) {
        mysqli_close($connect);
        exit(false);
    }
    $dir1 = "." . $ds . "submit" . $ds . $_COOKIE['ownerFbId'] . $ds;
    $dir2 = $dir1 . $_COOKIE['code'] . $ds;
    mkdir($dir1, 0700);
    mkdir($dir2, 0700);
    $tempFile = $_FILES['file']['tmp_name'];
    $targetFile = dirname(__FILE__) . $ds . $dir2 . $ds . ($_COOKIE['fbValid'] ? $_COOKIE['fbName'] : $_COOKIE['name']) . '_' . pathinfo($_FILES['file']['name'], PATHINFO_FILENAME) . '_' . date('m월d일H시i분s초') . '.' . $ext;
    move_uploaded_file($tempFile, $targetFile);
    $query = "SELECT submits FROM forms WHERE code='" . $_COOKIE['code'] . "'";
    $result = mysqli_query($connect, $query);
    $data = mysqli_fetch_array($result);
    $submits = ++$data['submits'];
    $query = "UPDATE forms SET submits='" . $submits . "' WHERE code='" . $_COOKIE['code'] . "'";
    mysqli_query($connect, $query);
    mysqli_close($connect);
    exit;
}

/*
POST 요청 처리
 */
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
        !$overlap ? mysqli_query($connect, $query) : false;
        mysqli_close($connect);
        exit;

    case 'signIn':
        strChk($_POST['name'] . $_POST['code']);
        $query = "SELECT code FROM forms";
        $result = mysqli_query($connect, $query);
        while ($data = mysqli_fetch_array($result)) {
            if ($_POST['code'] == $data['code']) {
                mysqli_close($connect);
                exit(true);
            }
        }
        mysqli_close($connect);
        exit(false);

    case 'submitValidate':
        $query = "SELECT * FROM forms";
        $result = mysqli_query($connect, $query);
        while ($data = mysqli_fetch_array($result)) {
            if ($_POST['code'] == $data['code']) {
                if ($data['useFb'] && !$_COOKIE['fbValid']) {
                    mysqli_close($connect);
                    exit('validationError_fbRequired');
                } elseif ($data['submits'] >= $data['max']) {
                    mysqli_close($connect);
                    exit('validationError_maxLimit');
                } elseif (!$data['postNow'] && strtotime($data['postTsp']) > time()) {
                    mysqli_close($connect);
                    exit('validationError_beforePost');
                } elseif (!$data['unlimited'] && strtotime($data['deadlineTsp']) < time() && !$data['afterDeadline']) {
                    mysqli_close($connect);
                    exit('validationError_expired');
                } else {
                    mysqli_close($connect);
                    exit($data['label']);
                }
            }
        }
        mysqli_close($connect);
        exit(false);

    case 'codeSet':
        $query = "SELECT code FROM forms";
        $result = mysqli_query($connect, $query);
        while ($data = mysqli_fetch_array($result)) {
            if ($_POST['code'] == $data['code']) {
                mysqli_close($connect);
                exit(true);
            }
        }
        mysqli_close($connect);
        exit(false);

    case 'boardTable':
        $query = "SELECT * FROM forms ORDER BY forms.Id DESC";
        $result = mysqli_query($connect, $query);
        while ($data = mysqli_fetch_array($result)) {
            if ($data['public']) {
                $data['submits'] >= $data['max'] ? $rowClass = ' class="trDisabled"' : $rowClass = '';
                $s = 60;
                $h = $s * 60;
                $d = $h * 24;
                $y = $d * 10;
                $diff = strtotime($data['deadlineTsp']) - time();
                if ($diff < 0) {
                    if ($data['unlimited']) {
                        $expire = '무기한';
                    } else {
                        $expire = '마감됨';
                        $rowClass = ' class="trDisabled"';
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
                $query2 = "SELECT fbId, fbName FROM accounts";
                $result2 = mysqli_query($connect, $query2);
                while ($data2 = mysqli_fetch_array($result2)) {
                    if ($data2['fbId'] == $data['owner']) {
                        $owner = $data2['fbName'];
                        break 1;
                    }
                }
                echo '<tr' . $rowClass . '><th><a href="' . $server . $data['code'] . '" target="_self">' . $data['label'] . '</a></th><td>' . $data['submits'] . '/' . $data['max'] . '</td><td>' . $expire . '</td><td>' . $owner . '</td></tr>';
            }
        }
        mysqli_close($connect);
        exit;

    case 'consoleTable':
        $query = "SELECT * FROM forms ORDER BY forms.Id DESC";
        $result = mysqli_query($connect, $query);
        while ($data = mysqli_fetch_array($result)) {
            if ($data['owner'] == $_COOKIE["fbId"]) {
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
                $data['afterDeadline'] ? $afterDeadline = '허용' : $afterDeadline = '금지';
                $data['useFb'] ? $usefb = '사용' : $usefb = '안함';
                if ($data['owner'] == $_COOKIE["fbId"]) {
                    $owner = '소유자';
                }
                $modify = "'" . $data['label'] . "','" . $data['description'] . "'," . $data['max'] . "," . $data['public'] . "," . $data['postNow'] . "," . "'" . $postTsp[0] . "'," . "'" . $postTsp[1] . "'," . $data['unlimited'] . "," . "'" . $deadlineTsp[0] . "'," . "'" . $deadlineTsp[1] . "'," . $data['afterDeadline'] . "," . $data['useFb'] . ",'" . $data['code'] . "'";
                echo '<tr id="row_' . $data['code'] . '"><th>' . $data['label'] . '<br><button class="btn-modify" onclick="modify(' . $modify . ')" type="button">관리</button></th><td><button class="btn-code" onclick=copy("' . $data['code'] . '") type="button">' . $data['code'] . '</button></td><td>' . $data['submits'] . '/' . $data['max'] . '</td><td class="td-auto">' . $create . '</td><td class="td-auto">' . $post . '</td><td class="td-auto">' . $expire . '</td><td class="td-auto">' . $afterDeadline . '</td><td class="td-auto">' . $usefb . '</td><td class="td-auto">' . $owner . '</td></tr>';
            }
        }
        mysqli_close($connect);
        exit;

    case 'create':
        strChk($_POST['label']);
        $tableName = $_POST['code'];
        $postTsp = $_POST['postDate'] . ' ' . $_POST['postTime'];
        $deadlineTsp = $_POST['deadlineDate'] . ' ' . $_POST['deadlineTime'];
        $query = "INSERT INTO forms VALUES (NULL, '" . date('Y-m-d H:i:s') . "', '" . $_POST['label'] . "', '" . $_POST['description'] . "', '" . $_POST['max'] . "', '" . $_POST['public'] . "', '" . $_POST['postNow'] . "', '" . $postTsp . "', '" . $_POST['unlimited'] . "', '" . $deadlineTsp . "', '" . $_POST['afterDeadline'] . "', '" . $_POST['useFb'] . "', '" . $_POST['code'] . "', '0', '" . $_POST['fbId'] . "', '', '')";
        $result = mysqli_query($connect, $query);
        $dir1 = "." . $ds . "submit" . $ds . $_POST['fbId'] . $ds;
        $dir2 = $dir1 . $_POST['code'] . $ds;
        mkdir($dir1, 0700);
        mkdir($dir2, 0700);
        mysqli_close($connect);
        exit($result ? true : false);

    case 'modify':
        strChk($_POST['label']);
        $postTsp = $_POST['postDate'] . ' ' . $_POST['postTime'];
        $deadlineTsp = $_POST['deadlineDate'] . ' ' . $_POST['deadlineTime'];
        $query = "UPDATE forms SET
            label = '" . $_POST['label'] . "',
            description = '" . $_POST['description'] . "',
            max = '" . $_POST['max'] . "',
            public = '" . $_POST['public'] . "',
            postNow = '" . $_POST['postNow'] . "',
            postTsp = '" . $postTsp . "',
            unlimited = '" . $_POST['unlimited'] . "',
            deadlineTsp = '" . $deadlineTsp . "',
            afterDeadline = '" . $_POST['afterDeadline'] . "',
            useFb = '" . $_POST['useFb'] . "'
            WHERE code = '" . $_POST['code'] . "'";
        $result = mysqli_query($connect, $query);
        mysqli_close($connect);
        exit($result ? true : false);

    case 'remove':
        $query = "DELETE FROM forms WHERE code='" . $_POST['code'] . "'";
        $result = mysqli_query($connect, $query);
        $result ? rmdirAll("." . $ds . "submit" . $ds . $_COOKIE['fbId'] . $ds . $_POST['code'] . $ds) : false;
        mysqli_close($connect);
        exit($result ? true : false);

    case 'ownerFbId':
        $query = "SELECT * FROM forms";
        $result = mysqli_query($connect, $query);
        while ($data = mysqli_fetch_array($result)) {
            if ($data['code'] == $_POST["code"]) {
                mysqli_close($connect);
                exit($data['owner']);
            }
        }
        mysqli_close($connect);
        exit(false);

    case 'fetchLabel':
        $query = "SELECT * FROM forms";
        $result = mysqli_query($connect, $query);
        while ($data = mysqli_fetch_array($result)) {
            if ($_POST['code'] == $data['code']) {
                mysqli_close($connect);
                exit($data['label']);
            }
        }
        mysqli_close($connect);
        exit(false);

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
            $fileName = $files[$i];
            strlen($fileName) <= 30 ? $fileName = '[' . strtoupper(substr($fileName, strrpos($files[$i], ".") + 1)) . ']<br>' . $fileName : $fileName = '[' . strtoupper(substr($fileName, strrpos($files[$i], ".") + 1)) . ']<br>' . iconv_substr($fileName, 0, 30, 'utf-8') . '&ctdot;';
            echo $exist ? '<div class="folder-group" onclick=openDir("' . $files[$i] . '")><div class="folder"></div><div class="folder-name">' . $label . '</div></div>' : '<div class="file-group" id="fileGroupIndex_' . $i . '"><div class="file-remove" onclick="remove(' . $i . ',' . $target . ')"></div><div class="file file-' . pathinfo($files[$i], PATHINFO_EXTENSION) . '" onclick="download(' . $target . ')"></div><div class="file-name" id="fileNameIndex_' . $i . '" onclick="download(' . $target . ')" onmouseover="fileNameView(' . $i . ',' . $target . ')">' . $fileName . '</div></div>';
        }
        mysqli_close($connect);
        exit;

    case 'unlink':
        rename($_POST['dir'] . $_POST['target'], "." . $ds . "trashes" . $ds . $_POST['target']);
        mysqli_close($connect);
        exit;

    case 'zip':
        $zip = new ZipArchive;
        $zip_name = 'S-Assistant_' . date('ymdHis') . '_' . rand() . '.zip';
        $res = $zip->open('.' . $ds . 'tmp' . $ds . $zip_name, ZipArchive::CREATE);
        if ($res === true) {
            $files = scandir($_POST['dir']);
            for ($i = 2; $files[$i]; $i++) {
                $zip->addFile($_POST['dir'] . $files[$i], $files[$i]);
            }
            $zip->close();
            echo $zip_name;
        }
        mysqli_close($connect);
        exit;

    case 'copy':
        $query = "SELECT * FROM forms";
        $result = mysqli_query($connect, $query);
        while ($data = mysqli_fetch_array($result)) {
            if ($_POST['code'] == $data['code']) {
                $dataArray = array(
                    'label' => $data['label'],
                    'description' => $data['description'] ? $data['description'] : 'S-Assistant 링크 공유',
                    'submits' => intval($data['submits']),
                );
                mysqli_close($connect);
                exit(json_encode($dataArray));
            }
        }
        mysqli_close($connect);
        exit;
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
            exit(false);
        }
    }
}

function rmdirAll($dir)
{
    $dirs = dir($dir);
    while (false !== ($entry = $dirs->read())) {
        if (($entry != '.') && ($entry != '..')) {
            if (is_dir($dir . '/' . $entry)) {
                rmdirAll($dir . '/' . $entry);
            } else {
                @unlink($dir . '/' . $entry);
            }
        }
    }
    $dirs->close();
    @rmdir($dir);
}
//  REF  |  http://flystone.tistory.com/54 (PHP, rmdir과 폴더 통째로 지우기)
