/**
    *@NApiVersion 2.x
    *@NScriptType UserEventScript
*/
define(['N/record', 'N/ui/serverWidget', 'N/runtime', 'N/email'], function (record, serverWidget, runtime, email) {
    function beforeLoad(scriptContext) {
        log.debug('before Load triggered')
        var current_record = scriptContext.newRecord
        if (scriptContext.type === scriptContext.UserEventType.CREATE || scriptContext.type === scriptContext.UserEventType.EDIT || scriptContext.type === scriptContext.UserEventType.VIEW) {
            var form = scriptContext.form

            var userObj = runtime.getCurrentUser();
            var idOfCurrentRole = userObj.role

            if (idOfCurrentRole != 1110) {
                // var poId = current_record.id //get the internal id of PO record
                // log.debug('Purchase Order id is ', poId)
                form.addButton({
                    id: 'custpage_btn_pmapproval',
                    label: 'Submit for PM approval',
                    functionName: 'sendEmail()'
                })
            }

            current_record.setValue({
                fieldId: 'custbody_approval_status_new',
                value: 3
            })

            // role

            log.debug('Internal ID of current user role : ' + idOfCurrentRole);

            if (idOfCurrentRole == 1110) {
                form.addButton({
                    id: 'custpage_btn_approve',
                    label: 'Approve',
                    functionName: 'approvePO()'
                })

                form.addButton({
                    id: 'custpage_btn_reject',
                    label: 'Reject',
                    functionName: 'rejectPO()'
                })
            }
        }

        var defaultEmp = '-5'
        current_record.setValue({
            fieldId: 'custbody_created_by',
            value: defaultEmp
        })

        // connect CLI
        form.clientScriptModulePath = 'SuiteScripts/MP_CLI_Q1.js'

    }

    function beforeSubmit(scriptContext) {
        var current_record = scriptContext.newRecord
        
    }

    function afterSubmit(scriptContext) {

    }

    return {
        beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});

