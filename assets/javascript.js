/*
    INITIALIZE
*/
$.ajaxSetup({ cache: false });
$.datepicker.setDefaults({
    dateFormat: "yy-mm-dd",
    yearSuffix: "년",
    prevText: "이전 달",
    nextText: "다음 달",
    monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    monthNamesShort: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    dayNames: ["일", "월", "화", "수", "목", "금", "토"],
    dayNamesShort: ["일", "월", "화", "수", "목", "금", "토"],
    dayNamesMin: ["일", "월", "화", "수", "목", "금", "토"],
    showMonthAfterYear: true
});
window.addEventListener("offline", function() {
    $(".notice-offline").slideDown();
    $(".notice-online").fadeOut();
});
window.addEventListener("online", function() {
    $(".notice-online").slideDown();
    $(".notice-offline").fadeOut();
    setTimeout(function() {
        $(".notice-online").slideUp();
    }, 5000);
});

/*
    GLOBAL VARIABLES
*/
var server = "https://submit.hyunwoo.org/",
    cdnserver = "https://submit-cdn.hyunwoo.org/",
    modifyCode,
    timer_cs,
    timer_submitValidate,
    timer_explorer;

/*
    jQuery Functions
*/
$(function() {
    $(".datepicker").datepicker();
    $(".btn-close").click(function() {
        window.open("about:blank", "_self");
        opener = window;
        window.close();
        location.replace("about:blank");
    });
    $(".btn-restore").click(function() {
        $(this).fadeOut();
        checkLoginState();
    });
    $(".btn-signIn").click(function() {
        signIn();
    });
    $(".btn-explorer").click(function() {
        clearTimeout(timer_cs);
        $(".field").slideUp();
        $(".explorer").fadeIn("slow");
        Cookies.set("dir", "./submit/" + Cookies.get("fbId") + "/", { expires: 1, secure: true });
        $(".btn-root").css("display", "none");
        $(".btn-zip").css("display", "none");
        $("html").addClass("html-infinite");
        explorer();
    });
    $(".btn-console").click(function() {
        clearTimeout(timer_explorer);
        $(".field").slideDown();
        $(".explorer").fadeOut();
        $(".btn-root").css("display", "none");
        $(".btn-zip").css("display", "none");
        $("html").removeClass("html-infinite");
        cs();
    });
    $(".btn-root").click(function() {
        Cookies.set("dir", "./submit/" + Cookies.get("fbId") + "/", { expires: 1, secure: true });
        $.post("proxy.php", { do: "explorer", dir: Cookies.get("dir") }, function(data) {
            $(".explorer-content").html(data);
        });
        $(".btn-root").slideUp();
        $(".btn-zip").css("display", "none");
    });
    $(".btn-zip").click(function() {
        $.post("proxy.php", { do: "zip", dir: Cookies.get("dir") }, function(data) {
            url(server + "tmp/" + data);
        });
    });
    $(".btn-create").hover(function() {
        $(".create-container").addClass("active");
        $(".desc-create").addClass("active");
    });
    $(".btn-create").mouseout(function() {
        $(".create-container").removeClass("active");
        $(".desc-create").removeClass("active");
    });
    $(".btn-create").click(function() {
        $("#create-checkbox-postNow").is(":checked") ? $(".form-row-create-post").css("display", "none") : $(".form-row-create-post").css("display", "flex");
        $("#create-checkbox-unlimited").is(":checked") ? $(".form-row-create-deadline").css("display", "none") : $(".form-row-create-deadline").css("display", "flex");
        $(".modal-create").addClass("active");
        $(".modal-create-content")
            .addClass("slideUp")
            .removeClass("slideDown");
        setTimeout(function() {
            $(".modal-tab-create").addClass("modal-tab-active");
        }, 600);
        codeSet();
    });
    $(".btn-modal-copied-close").click(function() {
        $(".modal-copied").removeClass("active");
    });
    $(".btn-modal-create-close").click(function() {
        $(".modal-tab-create").removeClass("modal-tab-active");
        $(".modal-create").removeClass("active");
        $(".modal-create-content")
            .addClass("slideDown")
            .removeClass("slideUp");
    });
    $(".btn-modal-modify-close").click(function() {
        $(".modal-tab-modify").removeClass("modal-tab-active");
        $(".modal-modify").removeClass("active");
        $(".modal-modify-content")
            .addClass("slideDown")
            .removeClass("slideUp");
    });
    $("input:checkbox").click(function() {
        $("#create-checkbox-postNow").is(":checked")
            ? $(".form-row-create-post").slideUp()
            : $(".form-row-create-post")
                  .slideDown()
                  .css("display", "flex");
        $("#create-checkbox-unlimited").is(":checked")
            ? $(".form-row-create-deadline").slideUp()
            : $(".form-row-create-deadline")
                  .slideDown()
                  .css("display", "flex");
        $("#modify-checkbox-postNow").is(":checked")
            ? $(".form-row-modify-post").slideUp()
            : $(".form-row-modify-post")
                  .slideDown()
                  .css("display", "flex");
        $("#modify-checkbox-unlimited").is(":checked")
            ? $(".form-row-modify-deadline").slideUp()
            : $(".form-row-modify-deadline")
                  .slideDown()
                  .css("display", "flex");
    });
    $(".btn-create-save").click(function() {
        $(this)
            .prop("disabled", "disabled")
            .addClass("btn-save-disabled");
        var valid = true;
        !$("#create-label").val() || $("#create-label").val() == " "
            ? ((valid = false),
              $(".create-label-label")
                  .css("color", "red")
                  .addClass("shake"),
              setTimeout(function() {
                  $(".create-label-label").removeClass("shake");
              }, 800))
            : $(".create-label-label")
                  .css("color", "black")
                  .removeClass("shake");
        !$("#create-max").val() || $("#create-max").val() == " " || $("#create-max").val() <= 0 || $("#create-max").val() > 1000
            ? ((valid = false),
              $(".create-label-max")
                  .css("color", "red")
                  .addClass("shake"),
              setTimeout(function() {
                  $(".create-label-max").removeClass("shake");
              }, 800))
            : $(".create-label-max")
                  .css("color", "black")
                  .removeClass("shake");
        !$("#create-checkbox-postNow").is(":checked")
            ? !$("#create-post-date").val() || $("#create-post-date").val().length != 10 || !$("#create-post-time").val()
                ? ((valid = false),
                  $(".create-label-post")
                      .css("color", "red")
                      .addClass("shake"),
                  setTimeout(function() {
                      $(".create-label-post").removeClass("shake");
                  }, 800))
                : $(".create-label-post")
                      .css("color", "black")
                      .removeClass("shake")
            : $(".create-label-post")
                  .css("color", "black")
                  .removeClass("shake");
        !$("#create-checkbox-unlimited").is(":checked")
            ? !$("#create-deadline-date").val() || $("#create-deadline-date").val().length != 10 || !$("#create-deadline-time").val()
                ? ((valid = false),
                  $(".create-label-deadline")
                      .css("color", "red")
                      .addClass("shake"),
                  setTimeout(function() {
                      $(".create-label-deadline").removeClass("shake");
                  }, 800))
                : $(".create-label-deadline")
                      .css("color", "black")
                      .removeClass("shake")
            : $(".create-label-deadline")
                  .css("color", "black")
                  .removeClass("shake");
        valid
            ? ($(".modal-form-create input").prop("disabled", "disabled"),
              $.post(
                  "proxy.php",
                  {
                      do: "create",
                      label: $("#create-label").val(),
                      max: $("#create-max").val(),
                      postNow: $("#create-checkbox-postNow").prop("checked") ? 1 : 0,
                      postDate: $("#create-post-date").val(),
                      postTime: $("#create-post-time").val(),
                      unlimited: $("#create-checkbox-unlimited").prop("checked") ? 1 : 0,
                      deadlineDate: $("#create-deadline-date").val(),
                      deadlineTime: $("#create-deadline-time").val(),
                      afterDeadline: $("#create-checkbox-afterDeadline").prop("checked") ? 1 : 0,
                      useFb: $("#create-checkbox-useFb").prop("checked") ? 1 : 0,
                      code: $("#create-code").val(),
                      fbId: Cookies.get("fbId")
                  },
                  function(data) {
                      data
                          ? ($(".modal-tab-create").removeClass("modal-tab-active"),
                            $(".modal-create").removeClass("active"),
                            $(".modal-create-content")
                                .addClass("slideDown")
                                .removeClass("slideUp"),
                            $(".modal-form-create").trigger("reset"),
                            $(".modal-form-create input").prop("disabled", false),
                            $(".btn-create-save")
                                .removeClass("btn-save-disabled")
                                .prop("disabled", false))
                          : ($(".btn-create-save")
                                .removeClass("btn-save-disabled")
                                .prop("disabled", false),
                            $(".modal-form-create input").prop("disabled", false),
                            alert("데이터 입력에 실패하였습니다.\n일시적인 네트워크 오류일 수 있으므로 잠시 후에 다시 시도하십시오."));
                  }
              ))
            : $(".btn-create-save")
                  .removeClass("btn-save-disabled")
                  .prop("disabled", false);
    });
    $(".btn-modify-save").click(function() {
        $(this)
            .prop("disabled", "disabled")
            .addClass("btn-save-disabled");
        var valid = true;
        !$("#modify-label").val() || $("#modify-label").val() == " "
            ? ((valid = false),
              $(".modify-label-label")
                  .css("color", "red")
                  .addClass("shake"),
              setTimeout(function() {
                  $(".modify-label-label").removeClass("shake");
              }, 800))
            : $(".modify-label-label")
                  .css("color", "black")
                  .removeClass("shake");
        !$("#modify-max").val() || $("#modify-max").val() == " " || $("#modify-max").val() <= 0 || $("#modify-max").val() > 1000
            ? ((valid = false),
              $(".modify-label-max")
                  .css("color", "red")
                  .addClass("shake"),
              setTimeout(function() {
                  $(".modify-label-max").removeClass("shake");
              }, 800))
            : $(".modify-label-max")
                  .css("color", "black")
                  .removeClass("shake");
        !$("#modify-checkbox-postNow").is(":checked")
            ? !$("#modify-post-date").val() || $("#modify-post-date").val().length != 10 || !$("#modify-post-time").val()
                ? ((valid = false),
                  $(".modify-label-post")
                      .css("color", "red")
                      .addClass("shake"),
                  setTimeout(function() {
                      $(".modify-label-post").removeClass("shake");
                  }, 800))
                : $(".modify-label-post")
                      .css("color", "black")
                      .removeClass("shake")
            : $(".modify-label-post")
                  .css("color", "black")
                  .removeClass("shake");
        !$("#modify-checkbox-unlimited").is(":checked")
            ? !$("#modify-deadline-date").val() || $("#modify-deadline-date").val().length != 10 || !$("#modify-deadline-time").val()
                ? ((valid = false),
                  $(".modify-label-deadline")
                      .css("color", "red")
                      .addClass("shake"),
                  setTimeout(function() {
                      $(".modify-label-deadline").removeClass("shake");
                  }, 800))
                : $(".modify-label-deadline")
                      .css("color", "black")
                      .removeClass("shake")
            : $(".modify-label-deadline")
                  .css("color", "black")
                  .removeClass("shake");
        valid
            ? ($(".modal-form-modify input").prop("disabled", "disabled"),
              $.post(
                  "proxy.php",
                  {
                      do: "modify",
                      label: $("#modify-label").val(),
                      max: $("#modify-max").val(),
                      postNow: $("#modify-checkbox-postNow").prop("checked") ? 1 : 0,
                      postDate: $("#modify-post-date").val(),
                      postTime: $("#modify-post-time").val(),
                      unlimited: $("#modify-checkbox-unlimited").prop("checked") ? 1 : 0,
                      deadlineDate: $("#modify-deadline-date").val(),
                      deadlineTime: $("#modify-deadline-time").val(),
                      afterDeadline: $("#modify-checkbox-afterDeadline").prop("checked") ? 1 : 0,
                      useFb: $("#modify-checkbox-useFb").prop("checked") ? 1 : 0,
                      code: modifyCode
                  },
                  function(data) {
                      data
                          ? ($(".modal-tab-modify").removeClass("modal-tab-active"),
                            $(".modal-modify").removeClass("active"),
                            $(".modal-modify-content")
                                .addClass("slideDown")
                                .removeClass("slideUp"),
                            $(".modal-form-modify").trigger("reset"),
                            $(".modal-form-modify input").prop("disabled", false),
                            $(".btn-modify-save")
                                .removeClass("btn-save-disabled")
                                .prop("disabled", false))
                          : ($(".btn-modify-save")
                                .removeClass("btn-save-disabled")
                                .prop("disabled", false),
                            $(".modal-form-modify input").prop("disabled", false),
                            alert("데이터 수정에 실패하였습니다.\n일시적인 네트워크 오류일 수 있으므로 잠시 후에 다시 시도하십시오."));
                  }
              ))
            : $(".btn-modify-save")
                  .removeClass("btn-save-disabled")
                  .prop("disabled", false);
    });
    $(".code-reissue").click(function() {
        $(this)
            .prop("disabled", "disabled")
            .addClass("code-reissue-disabled");
        codeSet();
        setTimeout(function() {
            $(".code-reissue")
                .removeClass("code-reissue-disabled")
                .prop("disabled", false);
        }, 1000);
    });
    $(".form-remove").click(function() {
        if (confirm('폼 "' + $("#modify-label").val() + '"이(가) 영구적으로 삭제됩니다.')) {
            $(".form-remove")
                .prop("disabled", "disabled")
                .addClass("form-remove-disabled");
            $(".modal-form-modify").trigger("reset");
            $.post(
                "proxy.php",
                {
                    do: "remove",
                    code: modifyCode
                },
                function(data) {
                    data
                        ? ($(".modal-tab-modify").removeClass("modal-tab-active"),
                          $(".modal-modify").removeClass("active"),
                          $(".modal-modify-content")
                              .addClass("slideDown")
                              .removeClass("slideUp"),
                          $(".form-remove")
                              .removeClass("form-remove-disabled")
                              .prop("disabled", false))
                        : ($(".form-remove")
                              .removeClass("form-remove-disabled")
                              .prop("disabled", false),
                          alert("폼 삭제에 실패하였습니다.\n일시적인 네트워크 오류일 수 있으므로 잠시 후에 다시 시도하십시오."));
                }
            );
        }
    });
    $(".create-preview-codelvl").html($("#create-slider-codelvl").val());
    $("#create-slider-codelvl").change(function() {
        $(".create-preview-codelvl").html($("#create-slider-codelvl").val());
        $(".code-reissue")
            .prop("disabled", "disabled")
            .addClass("code-reissue-disabled");
        codeSet();
        setTimeout(function() {
            $(".code-reissue")
                .removeClass("code-reissue-disabled")
                .prop("disabled", false);
        }, 1000);
    });
    new Dropzone(".dropzone");
});
$(document).keyup(function(e) {
    if (e.keyCode == 13 || e.which == 13) signIn();
    else if (e.keyCode == 27 || e.which == 27) {
        $(".modal-copied").removeClass("active");
        $(".modal-tab-create").removeClass("modal-tab-active");
        $(".modal-create").removeClass("active");
        $(".modal-create-content")
            .addClass("slideDown")
            .removeClass("slideUp");
        $(".modal-tab-modify").removeClass("modal-tab-active");
        $(".modal-modify").removeClass("active");
        $(".modal-modify-content")
            .addClass("slideDown")
            .removeClass("slideUp");
    }
});
function signIn() {
    var valid = true;
    if (!$("#input-name").val() || $("#input-name") == " ") {
        valid = false;
        $("#input-name").focus();
    } else if (!$("#input-code").val() || $("#input-code").val() == " ") {
        valid = false;
        $("#input-code").focus();
    }
    if (valid) {
        $(".btn-signIn").css("display", "none");
        $(".load-signIn").css("display", "block");
        Cookies.set("code", $("#input-code").val(), { expires: 1, secure: true });
        $.post(
            "proxy.php",
            {
                do: "signIn",
                name: $("#input-name").val(),
                code: $("#input-code").val()
            },
            function(data) {
                data ? location.replace(server + $("#input-code").val() + "#" + $("#input-name").val()) : ($(".btn-signIn").css("display", "block"), $(".load-signIn").css("display", "none"), $(".notice-inputError").fadeIn());
            }
        );
    }
}
var code_random = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function codeSet() {
    $(".load-code").fadeIn();
    $(".create-preview-code").css("display", "none");
    code = "";
    for (var i = 0; i < $("#create-slider-codelvl").val(); i++) code += code_random.charAt(Math.floor(Math.random() * code_random.length));
    $.post("proxy.php", { do: "codeSet", code: code }, function(data) {
        data ? exit : ($("#create-code").val(code), $(".create-preview-code").val(code));
    });
    $(".load-code").fadeOut();
    $(".create-preview-code").css("display", "block");
}

function modify(label, max, postNow, postDate, postTime, unlimited, deadlineDate, deadlineTime, afterDeadline, useFb, code) {
    $(".modal-form-modify-title-label").text(label);
    $("#modify-label").val(label);
    $("#modify-max").val(max);
    $("#modify-checkbox-postNow").prop("checked", postNow);
    postNow ? $(".form-row-modify-post").css("display", "none") : $(".form-row-modify-post").css("display", "flex");
    $("#modify-post-date").val(postDate);
    $("#modify-post-time").val(postTime);
    $("#modify-checkbox-unlimited").prop("checked", unlimited);
    unlimited ? $(".form-row-modify-deadline").css("display", "none") : $(".form-row-modify-deadline").css("display", "flex");
    $("#modify-deadline-date").val(deadlineDate);
    $("#modify-deadline-time").val(deadlineTime);
    $("#modify-checkbox-afterDeadline").prop("checked", afterDeadline);
    $("#modify-checkbox-useFb").prop("checked", useFb);
    $(".modify-preview-code").val(code);
    modifyCode = code;
    $(".modal-modify").addClass("active");
    $(".modal-modify-content")
        .addClass("slideUp")
        .removeClass("slideDown");
    setTimeout(function() {
        $(".modal-tab-modify").addClass("modal-tab-active");
    }, 600);
}

function statusChangeCallback(response) {
    $(".pf-icon").css("visible", "hidden");
    $(".pf-name").text("로드 중");
    if (response.status === "connected") {
        FB.api("/me", function(fb) {
            Cookies.set("fbValid", true, { expires: 1, secure: true });
            Cookies.set("fbId", fb.id, { expires: 1, secure: true });
            Cookies.set("fbName", fb.name, { expires: 1, secure: true });
            $.post("proxy.php", { do: "fbLogin", fbId: fb.id, fbName: fb.name });
            initialize();
        });
    } else {
        Cookies.remove("fbValid");
        Cookies.remove("fbId");
        Cookies.remove("fbName");
        Cookies.remove("name")
        Cookies.remove("ownerFbId");
        Cookies.remove("dir");
        Cookies.remove("code");
        Cookies.remove("code_autoSet")
        clearTimeout(timer_cs);
        clearTimeout(timer_explorer);
        initialize();
    }
}

function checkLoginState() {
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
}

window.fbAsyncInit = function() {
    FB.init({
        appId: "2157685250910459",
        cookie: true,
        xfbml: true,
        version: "v3.1"
    });
    FB.AppEvents.logPageView();
};
(function(d, s, id) {
    var js,
        fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/ko_KR/sdk.js#xfbml=1&version=v3.1&appId=2157685250910459&autoLogAppEvents=1";
    fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");

function copy(val) {
    var t = document.createElement("textarea");
    document.body.appendChild(t);
    t.value = val;
    t.select();
    document.execCommand("copy");
    document.body.removeChild(t);
    $(".modal-copied").addClass("active");
}

function url(url) {
    var e = document.createElement("iframe");
    document.body.appendChild(e);
    document.getElementsByTagName("iframe")[0].src = url;
    document.body.removeChild(e);
    return false;
}

function cs() {
    $.post("proxy.php", { do: "console" }, function(data) {
        $(".console-table").html(data);
    });
    timer_cs = setTimeout(function() {
        cs();
    }, 1000);
}

function submitValidate() {
    $.post("proxy.php", { do: "submitValidate", code: Cookies.get("code") }, function(data) {
        switch (data) {
            case "validationError_fbRequired":
                $(".dropzone").css("display", "none");
                $(".notice-submit-fbRequired").css("display", "flex");
                $(".pf-container").css("display", "block");
                break;

            case "validationError_beforePost":
                $(".dropzone").css("display", "none");
                $(".notice-submit-beforePost").css("display", "flex");
                break;

            case "validationError_expired":
                $(".dropzone").css("display", "none");
                $(".notice-submit-expired").css("display", "flex");
                break;

            case "validationError_maxLimit":
                $(".dropzone").css("display", "none");
                $(".notice-submit-maxLimit").css("display", "flex");
                break;

            case "validationError_unavailable":
                $(".dropzone").css("display", "none");
                $(".notice-submit-unavailable").css("display", "flex");
                break;

            default:
                $(".submit-title").text(data);
                $(".dropzone").css("display", "flex");
                $(".notice-submit").css("display", "none");
        }
    });
    timer_submitValidate = setTimeout(function() {
        submitValidate();
    }, 1000);
}

function explorer() {
    $.post("proxy.php", { do: "explorer", dir: Cookies.get("dir") }, function(data) {
        $(".explorer-content").html(data);
    });
    timer_explorer = setTimeout(function() {
        explorer();
    }, 1000);
}

function openDir(dir) {
    Cookies.set("dir", "./submit/" + Cookies.get("fbId") + "/" + dir + "/", { expires: 1, secure: true });
    $.post("proxy.php", { do: "explorer", dir: Cookies.get("dir") }, function(data) {
        $(".explorer-content").html(data);
        $(".btn-root").slideDown();
        $(".btn-zip").css("display", "block");
    });
}

function remove(target) {
    confirm(target + "\n\n위 파일이 영구적으로 삭제됩니다.") ? $.post("proxy.php", { do: "unlink", dir: Cookies.get("dir"), target: target }) : NULL;
}

function download(filename) {
    url(cdnserver + Cookies.get("dir").slice(9) + filename);
}

function initialize() {
    checkLoginState();
    $("html").removeClass("html-infinite");
    if (location.pathname != "/") {
        Cookies.set("code", location.pathname.slice(1), { expires: 1, secure: true });
        $(".field").css("display", "none");
        $(".submit").css("display", "block");
        if (!!Cookies.get("fbValid")) {
            /* fbValid == true */
            $(".pf-container").addClass("pf-container-valid");
            $(".pf-icon")
                .css("background", "url(https://graph.facebook.com/" + Cookies.get("fbId") + "/picture) no-repeat center/contain")
                .css("display", "block");
            $(".pf-name")
                .text(Cookies.get("fbName"))
                .css("display", "block");
            $(".submit-subtitle").text(Cookies.get("fbName"));
        } else {
            /* fbValid == false */
            if (!location.hash || location.hash == "#") {
                Cookies.set("code_autoSet", true, { expires: 1, secure: true });
                location.replace(server);
            } else {
                $(".pf-container").removeClass("pf-container-valid");
                $(".pf-icon").css("display", "none");
                $(".pf-name")
                    .css("display", "none")
                    .text("로드 중");
                $(".submit-subtitle").text(Cookies.get("fbName"));
                Cookies.set("name", decodeURI(location.hash.slice(1)), { expires: 1, secure: true });
                $(".submit-subtitle").text(Cookies.get("name"));
            }
        }
        submitValidate();
        window.onbeforeunload = function() {
            return true;
        };
    } else if (!Cookies.get("fbValid")) {
        /* fbValid == false */
        $(".pf-container").removeClass("pf-container-valid");
        $(".pf-icon").css("display", "none");
        $(".pf-name").css("display", "none");
        $(".field")
            .css("overflow-y", "hidden")
            .css("display", "block");
        $(".signIn-container").css("display", "block");
        $(".console-container").css("display", "none");
        $(".submit").css("display", "none");
        $(".explorer").css("display", "none");
        $(".btn-create").css("display", "none");
        if (!Cookies.get("fbValid") && Cookies.get("code") && Cookies.get("code_autoSet")) {
            Cookies.remove("code_autoSet");
            $("#input-code").val(Cookies.get("code"));
            $(".field").css("display", "block");
            $(".signIn-container").css("display", "block");
            $(".submit").css("display", "none");
            $("#input-name").focus();
        }
    } else {
        /* fbValid == true */
        $(".pf-container").addClass("pf-container-valid");
        $(".pf-icon")
            .css("background", "url(https://graph.facebook.com/" + Cookies.get("fbId") + "/picture) no-repeat center/contain")
            .css("display", "block");
        $(".pf-name")
            .text(Cookies.get("fbName"))
            .css("display", "block");
        $(".field").css("overflow-y", "auto");
        $(".signIn-container").css("display", "none");
        $(".console-container").css("display", "block");
        $(".submit").css("display", "none");
        $(".explorer").css("display", "none");
        $(".btn-create").css("display", "block");
        cs();
        clearTimeout(timer_explorer);
    }
    if (!Cookies.get("ownerFbId")) {
        $.post("proxy.php", { do: "ownerFbId", code: Cookies.get("code") }, function(data) {
            Cookies.set("ownerFbId", data, { expires: 1, secure: true });
        });
    }
}

$(window).load(function() {
    initialize();
    $("#content").removeClass("hidden");
    $(".loader-wrap").fadeOut("slow");
    $(".loader").fadeOut("slow");
});
