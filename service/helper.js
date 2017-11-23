module.exports = ()=>{
    "use strict";
    /**
     @param {string} where
     @return {Array}
     */
    Array.prototype.deleteOne = function (where) {
        let i = this.indexOf(where);
        if (i !== -1) {
            return this.splice(i, 1);
        } else {
            return [];
        }
    };
    /**
     @param {*} searchElement
     @param {number} [fromIndex]
     @return {boolean}
     */
    Array.prototype.pushUnique = function (searchElement, fromIndex) {
        let i = this.indexOf(searchElement, fromIndex);
        if (i === -1) {
            this.push(searchElement);
            return true;
        } else {
            return false;
        }
    };
};
