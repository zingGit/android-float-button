/**
 * 该方法是对 `Object.create(null)` 的简单封装。
 * `Object.create(null)` 用于创建无 prototype （也就无继承）的空对象。
 * 这样我们在该对象上查找属性时，就不用进行 `hasOwnProperty` 判断，此时对性能提升有帮助。
 *
 * @param [forceDictMode=false] Apply the delete operator to newly created map object.
 * This causes V8 to put the object in "dictionary mode" and disables creation of hidden classes
 * which are very expensive for objects that are constantly changing shape.
 */
export function createMap(forceDictMode?: boolean): any {
    const map = Object.create(null);
    if (forceDictMode) {
        const INVALID_IDENTIFIER_1 = ".";
        const INVALID_IDENTIFIER_2 = "/";
        map[INVALID_IDENTIFIER_1] = 1;
        map[INVALID_IDENTIFIER_2] = 1;
        delete map[INVALID_IDENTIFIER_1];
        delete map[INVALID_IDENTIFIER_2];
    }
    return map;
}
