async function generateDockNum() {
    const today = new Date();
    const docketNumber = `TS_ATM_${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
    console.log('===> Record Docket Number: ' + docketNumber);
    return docketNumber;
}

module.exports = generateDockNum;