'use strict';

/**
 *  配列の要素内のそれぞれのオブジェクトを start から end （end は含まれない）までの範囲でスライスし、
 *  新いオブジェクトの配列として返す
 *
 * @param {Array<Object>} objectArray - オブジェクトの配列
 * @param {number} start - 開始のインデックス
 * @param {number} end - 終了のインデックス
 * @returns {Array<Object>} - スライスされたオブジェクトの配列
 */
function sliceObjectStEd(objArray, start, end) {
    return objArray.map((obj) =>
        Object.keys(obj)
            .slice(start, end)
            .reduce((sliced, key) => {
                sliced[key] = obj[key];
                return sliced;
            }, {})
    );
}

/**
 *  配列の要素内のそれぞれのオブジェクトを start 以降の範囲でスライスし、
 *  新いオブジェクトの配列として返す
 *
 * @param {Array<Object>} objectArray - オブジェクトの配列
 * @param {number} start - 開始のインデックス
 * @returns {Array<Object>} - スライスされたオブジェクトの配列
 */
function sliceObjectSt(objArray, start) {
    return objArray.map((obj) =>
        Object.keys(obj)
            .slice(start)
            .reduce((sliced, key) => {
                sliced[key] = obj[key];
                return sliced;
            }, {})
    );
}

module.exports = {
    sliceObjectStEd: sliceObjectStEd,
    sliceObjectSt: sliceObjectSt
};
