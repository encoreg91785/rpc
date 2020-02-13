"use strict";
const fs = require('fs');
/**
 * 讀取路徑下所有js
 * 將方法裝成Object回傳
 * @param {string} path
 * @return {{string:object}}
 */
function loadAllScript(path) {
    var methods = {};
    if (fs.existsSync(path)) {
        var files = fs.readdirSync(path);
        files.forEach(file => {
            var sp = file.split(".");
            //判斷是否不是是js並且
            if (sp.length >= 2 && sp[1] == 'js') {
                var filename = sp[0];
                methods[filename] = require("./" + path + '/' + file);
            }
        })
        return methods;
    }
    else return {};
}
/**
 * 判斷字串是否為Null 或是 空字串
 * @param {string} str 
 */
function isEmptyOrNull(str) {
    return str == null || str == "";
}

/**
 * 移除陣列中的元件
 * @param {*[]} array 
 * @param {*} element 
 */
function removeElement(array, element) {
    let index = array.indexOf(element);
    if (index != -1) array.splice(index, 1);
    return index != -1;
}

/**
 * 取得亂數(小於等於0回傳0)
 * @param {number} x 最大數(不包含最大數)
 */
function getRandom(x) {
    if (x <= 0) return 0;
    else return Math.floor(Math.random() * x);
};

/**
 * 範圍亂數
 * @param {number} min 最小值(包含)
 * @param {number} max 最大值(不包含)
 */
function getRandomRange(min, max) {
    var r = 0;
    if (min < max) {
        r = Math.floor(Math.random() * (max - min) + min);
    }
    return r;
}

/**
 * 打亂array的順序
 * @param {[]} array 
 */
function shuffleArray(array) {
    let currentIndex = array.length;
    let temporaryValue = null;
    let randomIndex = 0;
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

/**
 * 複製一樣的物件
 * @param {*} source 
 */
function cloneObject(source) {
    let json = JSON.stringify(source);
    let clone = "";
    try {
        clone = JSON.parse(json);
    }
    catch (e) {
        console.log("Error")
    }
    return clone;
}

/**
 * 停幾秒後執行
 * @param {number} sec 
 */
function waitSec(sec) {
    return new Promise((reslove) => {
        setTimeout(reslove, sec * 1000);
    })
}

/**
 * 取範圍隨機數排除固定數值
 * @param {number} min 最小值
 * @param {number} max 最大值不包含
 * @param {number[]} exclude 排除的數值
 */
function getRandomWithout(min, max, exclude = []) {
    var r = 0;
    if (min < max) {
        do {
            r = Math.floor(Math.random() * (max - min) + min);
        } while (exclude.includes(r));
    }
    return r;
}

module.exports.getRandomWithout = getRandomWithout;
module.exports.cloneObject = cloneObject;
module.exports.getRandom = getRandom;
module.exports.getRandomRange = getRandomRange;
module.exports.isEmptyOrNull = isEmptyOrNull;
module.exports.loadAllScript = loadAllScript;
module.exports.removeElement = removeElement;
module.exports.shuffleArray = shuffleArray;
module.exports.waitSec = waitSec;