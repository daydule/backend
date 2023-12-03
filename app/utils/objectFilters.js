'use strict';
/**
 * 指定されたキーに基づいてオブジェクトのプロパティをフィルタリングし、
 * 新しいオブジェクトの配列を作成して返します。配列内の各オブジェクトから、
 * 指定されたキーに一致するプロパティのみが含まれる新しいオブジェクトが生成されます。
 *
 * @param {Object} obj - フィルタリングされるオブジェクト
 * @param {Array<string>} keys - 抽出するキーの配列
 * @returns {Object} - フィルタリングされたオブジェクト
 */
function filterObjectByKey(obj, keys) {
    return keys.reduce((filteredObj, key) => {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            filteredObj[key] = obj[key];
        }
        return filteredObj;
    }, {});
}

module.exports = {
    filterObjectByKey: filterObjectByKey
};
