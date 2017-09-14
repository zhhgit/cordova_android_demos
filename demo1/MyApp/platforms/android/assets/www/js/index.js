//这个状态代表了应用程序的状态并且会在onResume()和onPause()中保存和恢复
var appState = {
    takingPicture: true,
    imageUri: ""
};

var APP_STORAGE_KEY = "exampleAppState";

var app = {
    initialize: function() {
        this.bindEvents();
    },

    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
    },

    onDeviceReady: function() {
        document.getElementById("btn-take-picture").addEventListener("click", function() {
            //由于camera插件启动了一个外部Activity，在成功或失败回调之前，可能会被kill掉（低内存），在onPause()和onResume()保存和恢复状态
            appState.takingPicture = true;
            navigator.camera.getPicture(cameraSuccessCallback, cameraFailureCallback,                {
                sourceType: Camera.PictureSourceType.CAMERA,
                destinationType: Camera.DestinationType.FILE_URI,
                targetWidth: 250,
                targetHeight: 250
            });
        });

        document.getElementById("#btn-plugin-echo").addEventListener("click",function () {
            //调用Echo插件的echo方法
            cordova.exec(function(resp) {
                    alert("success");
                    alert(resp);
                },
                function(resp) {
                    alert("fail");
                    alert(resp);
                },
                "Echo",
                "echo",
                ["hehe"]);
        });
    },

    onPause: function() {
        //检测是否正在获取图片，以便保存状态以在onResume()恢复时候使用。如果已经获得了图片URI，也要存储
        if(appState.takingPicture || appState.imageUri) {
            window.localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(appState));
        }
    },

    onResume: function(event) {
        //检查存储的状态，有必要时恢复状态。
        var storedState = window.localStorage.getItem(APP_STORAGE_KEY);
        if(storedState) {
            appState = JSON.parse(storedState);
        }
        //检查是否需要恢复拍摄的图片
        if(!appState.takingPicture && appState.imageUri) {
            document.getElementById("get-picture-result").src = appState.imageUri;
        }
        //检查是否有插件结果在event中，需要cordova-android 5.1.0+
        else if(appState.takingPicture && event.pendingResult) {
            //检查插件调用是否成功，对于camera插件，OK意味着成功，其他意味着错误，调用响应的回调函数
            if(event.pendingResult.pluginStatus === "OK") {
                cameraSuccessCallback(event.pendingResult.result);
            }
            else {
                cameraFailureCallback(event.pendingResult.result);
            }
        }
    }
};

function cameraSuccessCallback(imageUri) {
    appState.takingPicture = false;
    appState.imageUri = imageUri;
    document.getElementById("get-picture-result").src = imageUri;
}

function cameraFailureCallback(error) {
    appState.takingPicture = false;
    console.log(error);
}

app.initialize();