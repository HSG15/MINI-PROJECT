/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
*/
define(["N/currentRecord", "N/url", "N/format", "N/record"], function (currentRecord, url, format, record) {

    var current_record = currentRecord.get()

    function fieldChanged(scriptContext) {
        var current_record = scriptContext.currentRecord

        if (scriptContext.fieldId === 'custpage_customer' || scriptContext.fieldId === 'custpage_date' || scriptContext.fieldId === 'custpage_invoice') {
            var customerId = current_record.getValue('custpage_customer')
            console.log('customer id is ', customerId)
            var customerDate = current_record.getValue('custpage_date')
            var customerInvId = current_record.getValue('custpage_invoice')

            //console.log('date is ', customerDate)
            //formatting date properly
            var trandate = null
            if (customerDate) {
                trandate = format.format({
                    value: customerDate,
                    type: format.Type.DATE
                })
            }

            //console.log('date now is ', trandate)

            if (customerId || trandate || customerInvId) {
                var slUrl = url.resolveScript({
                    scriptId: 'customscript_mp_sl_q2',
                    deploymentId: 'customdeploy_mp_sl_q2',
                    params: {
                        custpage_customer: customerId,
                        custpage_date: trandate,
                        custpage_invoice: customerInvId
                    }
                })
                //console.log('url is ', slUrl)
                window.location.href = slUrl
            }
        }
    }

    function processInvoices() {
        console.log('button triggered')
        var lineCount = current_record.getLineCount({
            sublistId: 'custpage_open_invoices'
        })
        console.log('no of line is ', lineCount)

        // check which checkbox is checked and store those respective invoices in an array
        var selectedInvArray = []
        for (var i = 0; i < lineCount; i++) {
            var isChecked = current_record.getSublistValue({
                sublistId: 'custpage_open_invoices',
                fieldId: 'custpage_select_oi',
                line: i
            })

            console.log('type of isChecked ' + typeof isChecked + ' value is ' + isChecked)

            if (isChecked) {
                var selectedInv = current_record.getSublistValue({
                    sublistId: 'custpage_open_invoices',
                    fieldId: 'custpage_invinternalid_oi', //storing the internal id of particular selected invoice
                    line: i
                })
                selectedInvArray.push(selectedInv)
                console.log('inv is ', selectedInv)
            } else {
                console.log('not executed')
            }
            console.log('invoice array is ', selectedInvArray)
        }

        if (selectedInvArray.length > 0) {
            console.log('invoice array length : ' + selectedInvArray.length + '  Selected Invoice IDs: ' + selectedInvArray.join(", "))
            console.log('selected invoice are ', selectedInvArray)

            var invoiceParam = JSON.stringify(selectedInvArray);
            console.log(invoiceParam);

            var slUrl = url.resolveScript({
                scriptId: 'customscript_mp_sl_q2',
                deploymentId: 'customdeploy_mp_sl_q2',
                params: {
                    custpage_invoices_param: invoiceParam // to be get in the suitelet
                }
            })
            window.location.href = slUrl
        } else {
            console.log('no invoice selected ');
        }
    }

    function receivePayment() {
        console.log('Receive Payment Button Triggered')
        var lineCount = current_record.getLineCount({
            sublistId: 'custpage_process_invoices'
        })
        // console.log('line count is ', lineCount)

        // check which checkboxes is checked and store in an array
        var selectedInvArray = []
        for (var i = 0; i < lineCount; i++) {
            var isChecked = current_record.getSublistValue({
                sublistId: 'custpage_process_invoices',
                fieldId: 'custpage_select_pi',
                line: i
            })

            if (isChecked) {
                var selectedInv = current_record.getSublistValue({
                    sublistId: 'custpage_process_invoices',
                    fieldId: 'custpage_invinternalid_pi',
                    line: i
                })
                selectedInvArray.push(selectedInv)
            }
        }

        // here i have to implement the logic for, once i got the array of selectedInv, 
        // just make the payment for those invoices and then send the URL to suitelet

        if (selectedInvArray.length > 0) {
            var invoiceParam = JSON.stringify(selectedInvArray)
            var slUrl = url.resolveScript({
                scriptId: 'customscript_mp_sl_q2',
                deploymentId: 'customdeploy_mp_sl_q2',
                params: {
                    custpage_invoices_param_ci: invoiceParam // to be get in the suitelet
                }
            })
            try {
                console.log('array is sending from cli')
                window.location.href = slUrl
                console.log('array sent')
            } catch (e) {
                console.log('could not sent')
            }

        }
    }

    return {
        fieldChanged: fieldChanged,
        processInvoices: processInvoices,
        receivePayment: receivePayment
    }
})