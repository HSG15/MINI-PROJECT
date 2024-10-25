/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/currentRecord', 'N/email', 'N/record', 'N/url', 'N/runtime'],
    function (currentRecord, email, record, url, runtime) {

        var current_record = currentRecord.get();
        var poId = current_record.id;

        function pageInit(scriptContext) {

        }

        function sendEmail() {
            alert('pageInit triggered');
            // send email
            try {
                email.send({
                    author: -5,
                    recipients: 761,
                    subject: 'PO is pending for Approval',
                    body: 'email body'
                });
                alert('email sent successfully!');
            } catch (e) {
                alert('error for mail ' + e.message);
            }

            alert('code is working');
        }

        function approvePO() {
            alert('Accepted by PM')
            try {
                // var recObj = currentRecord.get();
                record.submitFields({
                    type: record.Type.PURCHASE_ORDER,
                    id: poId,
                    values: {
                        'custbody_approval_status_new': 1
                    }
                });

            } catch (e) {
                alert('error is ' + e.message);
            }
            location.reload()
        }

        function rejectPO() {
            
            alert('Rejected by PM')
            // change field value to reject
            try {
                record.submitFields({
                    type: record.Type.PURCHASE_ORDER,
                    id: poId,
                    values: {
                        'custbody_approval_status_new': 2
                    }
                });

            } catch (e) {
                alert('error is ' + e.message);
            }


            // Get current user and role
            var currentUser = runtime.getCurrentUser();
            var currentUserId = currentUser.id;
            var currentUserRole = currentUser.role;

            console.log('Current User ID: ', currentUserId);
            console.log('Current User Role ID: ', currentUserRole);


            // show prompt to put the reason
            var reason = prompt('Please enter the rejection reason ')

            //set the reason in rejection reason field
            try {
                record.submitFields({
                    type: record.Type.PURCHASE_ORDER,
                    id: poId,
                    values: {
                        'custbody_rejection_reason': reason
                    }
                })
            } catch (e) {
                console.log(e.message)
            }

            //send the mail to employee (created by)
            var poLink = url.resolveRecord({
                recordType: 'purchaseorder',
                recordId: poId,
                isEditMode: true
            })

            try {
                email.send({
                    author: currentUserId,
                    recipients: -5,
                    subject: 'Purchase Order Rejected due to: ' + reason,
                    // body: 'Click the <a href="' + poLink + '">poId</a> to view the purchase order'
                    body: 'Click the <a href="' + poLink + '">'+ poId +'</a> to view the purchase order'
                })
                console.log('mail sent')
            } catch (e) {
                console.log('Error sending mail: ', e.message);
            }

            //location.reload()
        }

        return {
            pageInit: pageInit,
            sendEmail: sendEmail,
            approvePO: approvePO,
            rejectPO: rejectPO
        };
    }
);
