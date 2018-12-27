
var memoryModify = {
    run:function() {
        if(Memory.ModifyFlag == false) {
            return;
        }
        Memory.ModifyFlag = false;
        console.log('OK');
    }
}
module.exports = memoryModify;
