const routeLogin = "/login.html";
if (!localStorage.getItem("isLogin")) {
    window.location.href = routeLogin;
}

var keyUser = localStorage.getItem("isLogin");

const firebaseConfig = {
    apiKey: "AIzaSyADt9h0r8XB1VFvhpkfCcW41Fz7GFfjrPk",
    authDomain: "thietbibaochay-v2.firebaseapp.com",
    databaseURL: "https://thietbibaochay-v2-default-rtdb.firebaseio.com",
    projectId: "thietbibaochay-v2",
    storageBucket: "thietbibaochay-v2.appspot.com",
    messagingSenderId: "859661221744",
    appId: "1:859661221744:web:8a7e87d64c4def076b19b5"
};

// Khởi tạo Firebase
firebase.initializeApp(firebaseConfig);

// Lấy reference đến Firebase Realtime Database
var database = firebase.database();


database.ref(keyUser).on('value', function (snapshot) {
    var data = snapshot.val();

    console.log('data', data);
    applyButtonStates(data);
});
let audioAlert = {};
let audioSOS  = {};

$(document).ready(function () {
    // Hiển thị loading khi trang được tải
    var containerLoading = $('.container-loading');
    var containerContent = $('.container-content');
    setTimeout(() => {
        containerLoading.hide();
        containerContent.show();
    }, 1000);
});

function toggleButton(button, id) {

    // Kiểm tra xem button có lớp bật hay không không
    var idBtn   = $('#' + id);
    var message = "Hệ thống đang bảo trì, vui lòng thử lại sau!";
    
    if(id == 'sos'){
        if (idBtn.attr("value") == 'true') {
            idBtn.removeClass('turn-on');
            idBtn.attr("value", false);

        }else{
            idBtn.addClass('turn-on');
            idBtn.attr("value", true);
        }
        
    }else{
        idBtn.addClass('turn-on');
        idBtn.attr("value", true);
       
    }
    getAllValuesAndCallApi(message);
}

function applyButtonStates(data) {
    const lstAlertVolumn =  [ 
                                "temperatureAlert", "gasAlert", "antiTheft", "pump",
                                "zone1", "zone2", "zone3", "zone4"
                            ];
    var isAlertVolumn = false;
    // Duyệt qua các key trong data và áp dụng trạng thái lên các button
    for (var key in data) {
        if (data.hasOwnProperty(key)) {
            var buttonId = '#' + key;
            var button = $(buttonId);

            // Kiểm tra giá trị của key và thêm/loại bỏ lớp turn-on
            if (data[key] === "true" || data[key] === true) {
                button.addClass('turn-on');
            } else {
                button.removeClass('turn-on');
            }

            // hiện text 
            if (key === "temperature") {
                $('#temperature').html(`NHIỆT ĐỘ: ${data.temperature}`);
            }
            if (key === "gas") {
                $('#gas').html(`Khí Gas: ${data.gas}`);
            }

            if (key === "fullname" || key == "username") {
                $(buttonId).html(data[key]);
            }
            if (key === "buttonRemoteON" || key === "buttonRemoteOFF") {
                var idBtn   = $('#'+ key);
                if (data[key] == "true" || data[key] == true) {
                    idBtn.addClass('turn-on');
                } else{
                    idBtn.removeClass('turn-on');
                }
            }

            $('#' + key).attr('value', data[key]);

            //bật tắt âm thanh
            if (
                lstAlertVolumn.includes(key)
                && (data[key] == "true" || data[key] == true)
            ) {
                playAudio(audioAlert, './mp3/alert.mp3');
                isAlertVolumn = true;
            }
        }
    }
    if(!isAlertVolumn) stopAudio(audioAlert);
}
function getAllValues() {
    var values = {};

    // Duyệt qua mảng các ID và lấy giá trị từ các thẻ tương ứng
    var ids = [
        'temperature','gas','temperatureAlert' ,'gasAlert', 'antiTheft','pump'
        ,'buttonRemoteON','buttonRemoteOFF','fullname','password','username',
        'sos', 'zone1', 'zone2', 'zone3', 'zone4',
    ];

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        var value = $('#' + id).attr("value");
        values[id] = value;

        if (value === undefined) {
            if (
                id == 'temperature' || 
                id == 'gas' || id == 'fullname' || 
                id == 'username' || id == 'password'
            ) {
                values[id] = 'N/A';
            } else {
                values[id] = 'false';
            }
        }
    }
    return values;
}
function getAllValuesAndCallApi(message) {
    // Lấy giá trị từ tất cả các thẻ button
    var values = getAllValues();

    if (!localStorage.getItem("isLogin")) {
        window.location.href = routeLogin;
    }

    // Gọi API để cập nhật dữ liệu trên server
    $.ajax({
        url: 'https://thietbibaochay-v2-default-rtdb.firebaseio.com/' + keyUser + '.json',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(values),
        success: function (response) {
            // Swal.fire({
            //     position: "center",
            //     icon: "success",
            //     title: message,
            //     showConfirmButton: false,
            //     timer: 1500
            // });
        },
        error: function (error) {
            console.error('Error updating data:', error);
            Swal.fire({
                position: "center",
                icon: "warning",
                title: JSON.stringify(error),
                showConfirmButton: false,
                timer: 1500
            });
        }
    });
}

function playAudio(audioObject, linkMp3) {
    if (!audioObject.audio) {
        audioObject.audio = new Audio(linkMp3);
        audioObject.audio.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        }, false);
    } else if (!audioObject.audio.paused) {
        // Nếu âm thanh đang chạy, dừng nó trước khi chạy lại
        audioObject.audio.pause();
        audioObject.audio.currentTime = 0;
    }
    audioObject.audio.play();
}


function stopAudio(audioObject) {
    if (audioObject.audio && !audioObject.audio.paused) {
        audioObject.audio.pause();
        audioObject.audio.currentTime = 0;
    }
}


// change info

// fullnameEdit
// passwordOldEdit
// passwordNewEdit
// passwordNewConfirmEdit

var btnChangeInfo             = $('#btnChangeInfo');
var frmInfoEditUser           = $('#frmInfoEditUser');
var messNotFill               = 'Vui lòng điền đầy đủ thông tin';
var messPassNewAndConfirmDiff = 'Xác nhận mật khẩu không giống mật khẩu mới';
var failConnectDatabase       = "Kết nối database thất bại, vui lòng thử lại !";
var wrongPassword             = "Sai mật khẩu";
var success                   = "Thành công";
var allDataFrm = {};

btnChangeInfo.click(async function (e) {
    e.preventDefault();
    allDataFrm = frmInfoEditUser.serializeArray();

    var formDataJson = {};
    $.each(allDataFrm, function(index, field) {
        formDataJson[field.name] = field.value;
    });

    // validate from
    if (validateForm(formDataJson)) return;

    // check pass 
    if (await validatePassOld(formDataJson)) return;
    
    getAllValuesAndCallApiUpdateInfo(success, formDataJson);
});

function validateForm(formDataJson) {
    var isMessageError = null;
    $.each(formDataJson, function (index, value) {
        if (!value) {
            isMessageError = messNotFill;
            return false;
        }
    });
    if (isMessageError) {
        notiMessage(isMessageError);
    }
    // [2] mk mới, [3] xác nhận mk mới 
    if (formDataJson.passwordNewEdit != formDataJson.passwordNewConfirmEdit) {
        isMessageError = messPassNewAndConfirmDiff;
        notiMessage(isMessageError);
    }
    return isMessageError ? true : false;
}
async function validatePassOld(formDataJson) {
    try {
        var isMessageError = null;
        var passOld = formDataJson.passwordOldEdit;

        if (!localStorage.getItem("isLogin")) {
            window.location.href = routeLogin;
        }

        // Wrap the jQuery AJAX call in a Promise
        const data = await new Promise((resolve, reject) => {
            $.ajax({
                url: 'https://thietbibaochay-v2-default-rtdb.firebaseio.com/' + keyUser + '.json',
                type: 'GET',
                dataType: 'json',
                success: function (responseData) {
                    resolve(responseData);
                },
                error: function (error) {
                    reject(error);
                }
            });
        });

        // Check password and set error message
        if (data.password !== passOld) {
            isMessageError = wrongPassword;
            notiMessage(isMessageError);
        }

        return isMessageError ? true : false;
    } catch (error) {
        notiMessage(failConnectDatabase);
        return true;
    }
}
function getAllValuesAndCallApiUpdateInfo(message, formDataJson) {
    // Lấy giá trị từ tất cả các thẻ button
    var values = getAllValues();
    values.fullname = formDataJson.fullnameEdit;
    values.password = formDataJson.passwordNewEdit;

    if (!localStorage.getItem("isLogin")) {
        window.location.href = routeLogin;
    }
    
    // Gọi API để cập nhật dữ liệu trên server
    $.ajax({
        url: 'https://thietbibaochay-v2-default-rtdb.firebaseio.com/' + keyUser + '.json',
        type: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(values),
        success: function (response) {
            notiMessage(message, icon = "success")
            frmInfoEditUser.find('input, textarea, select').val('');
        },
        error: function (error) {
            console.error('Error updating data:', error);
            notiMessage(JSON.stringify(error));
        }
    });
}

function notiMessage(isMessageError, icon = "warning") {
    Swal.fire({
        position: "top",
        icon: icon,
        title: isMessageError,
        showConfirmButton: false,
        timer: 1500
    });
}



$("#btnLogout").on("click", function() {
    // Check if isLogin exists in localStorage
    if (localStorage.getItem("isLogin")) {
        localStorage.removeItem("isLogin");
        window.location.href = routeLogin;
    } else {
        notiMessage('User chưa login !', icon = "warning") 
    }
});