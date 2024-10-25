/**
* @NApiVersion 2.x
* @NScriptType Suitelet
*/

define(['N/ui/serverWidget', 'N/record', 'N/search', 'N/redirect'],
    function (serverWidget, record, search, redirect) {

        function onRequest(scriptContext) {
            if (scriptContext.request.method === 'GET') {
                var form = serverWidget.createForm({
                    title: 'MINI PROJECT '
                })

                var custId = scriptContext.request.parameters.custpage_customer
                //log.debug('customer id ', custId)

                var custDate = scriptContext.request.parameters.custpage_date
                //log.debug('date ', custDate)

                var custInvId = scriptContext.request.parameters.custpage_invoice
                //log.debug('cust inv id ', custInvId)

                // receiving the array from CLI for process invoices
                var invoiceArrayParam = scriptContext.request.parameters.custpage_invoices_param;
                var invoiceArrayFromCLI = invoiceArrayParam ? JSON.parse(invoiceArrayParam) : [];

                log.debug('received array for open invoices is ', invoiceArrayFromCLI);

                // receiving the array from CLI for closed invoices
                var invArrParam = scriptContext.request.parameters.custpage_invoices_param_ci
                var invArrFromCLI = invArrParam ? JSON.parse(invArrParam) : []
                log.debug('received array for closed invoices is ', invArrFromCLI)

                //customer filter
                var custField = form.addField({
                    id: 'custpage_customer',
                    label: 'Customer Name',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer'
                })

                if (custId) { // to appear the customer id in the field else after getting corresponding inv the field goes blank
                    custField.defaultValue = custId
                }

                //date filter
                var dateField = form.addField({
                    id: 'custpage_date',
                    label: 'Date',
                    type: serverWidget.FieldType.DATE
                })

                if (custDate) {
                    dateField.defaultValue = custDate
                }

                //invoie filter
                var invField = form.addField({
                    id: 'custpage_invoice',
                    label: 'Invoice Id',
                    type: serverWidget.FieldType.TEXT
                })

                if (custInvId) {
                    invField.defaultValue = custInvId
                }


                //add subtab1 - open invoices
                {
                    form.addSubtab({
                        id: 'custpage_tab1',
                        label: 'Open Invoices'
                    })

                    var openInvList = form.addSublist({ //sublist
                        id: 'custpage_open_invoices',
                        label: 'Open Invoices',
                        type: serverWidget.SublistType.LIST,
                        tab: 'custpage_tab1'
                    })

                    openInvList.addButton({
                        id: 'custpage_process_btn',
                        label: 'Process',
                        functionName: 'processInvoices()'
                    })

                    openInvList.addField({
                        id: 'custpage_select_oi',
                        type: serverWidget.FieldType.CHECKBOX,
                        label: 'select'
                    })

                    openInvList.addField({
                        id: 'custpage_invid_oi',
                        type: serverWidget.FieldType.TEXT,
                        label: 'invoice id'
                    })

                    openInvList.addField({
                        id: 'custpage_invinternalid_oi',
                        type: serverWidget.FieldType.TEXT,
                        label: 'invoice internal id'
                    })

                    openInvList.addField({
                        id: 'custpage_invdate_oi',
                        type: serverWidget.FieldType.DATE,
                        label: 'invoice date'
                    })

                    openInvList.addField({
                        id: 'custpage_invamount_oi',
                        type: serverWidget.FieldType.CURRENCY,
                        label: 'total'
                    })

                    // applying filter
                    var filters = [
                        ['status', 'anyof', 'CustInvc:A']
                    ];

                    //log.debug('filter before ', filters)

                    if (custId) {
                        filters.push('AND', ['entity', 'is', custId]);
                    }

                    if (custDate) {
                        filters.push('AND', ['trandate', 'on', custDate])
                    }

                    try {
                        if (custInvId) {
                            filters.push('AND', ['tranid', 'is', custInvId])
                        }
                    } catch (e) {
                        log.debug('error while applying invid filter : ', e)
                    }

                    //log.debug('filter after ', filters)

                    var openInvSearch = search.create({
                        type: search.Type.INVOICE,
                        filters: filters,
                        columns: [
                            { name: 'tranid', summary: search.Summary.GROUP },
                            { name: 'internalid', summary: search.Summary.GROUP },
                            { name: 'trandate', summary: search.Summary.GROUP },
                            { name: 'total', summary: search.Summary.SUM }
                        ]
                    });

                    // setting the value (populating filtered invoives)
                    var result = openInvSearch.run()
                    var count = 0;
                    result.each(function (result) {

                        openInvList.setSublistValue({
                            id: 'custpage_invinternalid_oi',
                            line: count,
                            value: result.getValue({ name: 'internalid', summary: search.Summary.GROUP })
                        })

                        openInvList.setSublistValue({
                            id: 'custpage_invid_oi',
                            line: count,
                            value: result.getValue({ name: 'tranid', summary: search.Summary.GROUP })
                        })

                        openInvList.setSublistValue({
                            id: 'custpage_invdate_oi',
                            line: count,
                            value: result.getValue({ name: 'trandate', summary: search.Summary.GROUP })
                        })

                        openInvList.setSublistValue({
                            id: 'custpage_invamount_oi',
                            line: count,
                            value: result.getValue({ name: 'total', summary: search.Summary.SUM })
                        })

                        count++
                        return true

                    })
                }

                //add subtab2 - process invoices
                {
                    form.addSubtab({
                        id: 'custpage_tab2',
                        label: 'Processing Invoices'
                    })

                    var processInvList = form.addSublist({
                        id: 'custpage_process_invoices',
                        label: 'Process Invoices',
                        type: serverWidget.SublistType.LIST,
                        tab: 'custpage_tab2'
                    })

                    processInvList.addButton({
                        id: 'custpage_rcvpayment_btn',
                        label: 'Receive Payment',
                        functionName: 'receivePayment()'
                    })

                    processInvList.addField({
                        id: 'custpage_select_pi',
                        type: serverWidget.FieldType.CHECKBOX,
                        label: 'select'
                    })

                    processInvList.addField({
                        id: 'custpage_invid_pi',
                        type: serverWidget.FieldType.TEXT,
                        label: 'invoie id'
                    })

                    processInvList.addField({
                        id: 'custpage_invinternalid_pi',
                        type: serverWidget.FieldType.TEXT,
                        label: 'invoice internal id'
                    })

                    processInvList.addField({
                        id: 'custpage_invdate_pi',
                        type: serverWidget.FieldType.DATE,
                        label: 'invoice date'
                    })

                    processInvList.addField({
                        id: 'custpage_invamount_pi',
                        type: serverWidget.FieldType.CURRENCY,
                        label: 'total'
                    })

                    // creating search for invoice internal id from the array
                    if (invoiceArrayFromCLI.length > 0) {
                        var processInvSearch = search.create({
                            type: search.Type.INVOICE,
                            filters: [
                                ['internalid', 'anyof', invoiceArrayFromCLI]
                            ],
                            columns: [
                                { name: 'tranid', summary: search.Summary.GROUP },
                                { name: 'internalid', summary: search.Summary.GROUP },
                                { name: 'trandate', summary: search.Summary.GROUP },
                                { name: 'total', summary: search.Summary.SUM }
                            ]
                        })

                        var resultSet = processInvSearch.run()

                        var lineNo = 0
                        resultSet.each(function (result) {

                            processInvList.setSublistValue({
                                id: 'custpage_invid_pi',
                                line: lineNo,
                                value: result.getValue({ name: 'tranid', summary: search.Summary.GROUP }),
                            })

                            processInvList.setSublistValue({
                                id: 'custpage_invinternalid_pi',
                                line: lineNo,
                                value: result.getValue({ name: 'internalid', summary: search.Summary.GROUP })
                            })

                            processInvList.setSublistValue({
                                id: 'custpage_invdate_pi',
                                line: lineNo,
                                value: result.getValue({ name: 'trandate', summary: search.Summary.GROUP })
                            })

                            processInvList.setSublistValue({
                                id: 'custpage_invamount_pi',
                                line: lineNo,
                                value: result.getValue({ name: 'total', summary: search.Summary.SUM })
                            })

                            lineNo++
                            return true
                        })
                    }

                }

                //add subtab3 - closed invoices
                {
                    form.addSubtab({
                        id: 'custpage_tab3',
                        label: 'Closed Invoices'
                    })

                    var closedInvList = form.addSublist({
                        id: 'custpage_closed_invoices',
                        label: 'closed Invoices',
                        type: serverWidget.SublistType.LIST,
                        tab: 'custpage_tab3'
                    })

                    closedInvList.addField({
                        id: 'custpage_select_ci',
                        type: serverWidget.FieldType.CHECKBOX,
                        label: 'select'
                    })

                    closedInvList.addField({
                        id: 'custpage_invid_ci',
                        type: serverWidget.FieldType.TEXT,
                        label: 'invoie id'
                    })

                    closedInvList.addField({
                        id: 'custpage_invinternalid_ci',
                        type: serverWidget.FieldType.TEXT,
                        label: 'invoice internal id'
                    })

                    closedInvList.addField({
                        id: 'custpage_invdate_ci',
                        type: serverWidget.FieldType.DATE,
                        label: 'invoice date'
                    })

                    closedInvList.addField({
                        id: 'custpage_invamount_ci',
                        type: serverWidget.FieldType.CURRENCY,
                        label: 'total'
                    })

                    // creating search for invoice internal id from the array
                    if (invArrFromCLI.length > 0) {
                        var processInvSearch = search.create({
                            type: search.Type.INVOICE,
                            filters: [
                                ['internalid', 'anyof', invArrFromCLI]
                            ],
                            columns: [
                                { name: 'tranid', summary: search.Summary.GROUP },
                                { name: 'internalid', summary: search.Summary.GROUP },
                                { name: 'trandate', summary: search.Summary.GROUP },
                                { name: 'total', summary: search.Summary.SUM }
                            ]
                        })

                        resultSet = processInvSearch.run()

                        var lineNo = 0
                        resultSet.each(function (result) {

                            closedInvList.setSublistValue({
                                id: 'custpage_invid_ci',
                                line: lineNo,
                                value: result.getValue({ name: 'tranid', summary: search.Summary.GROUP }),
                            })

                            closedInvList.setSublistValue({
                                id: 'custpage_invinternalid_ci',
                                line: lineNo,
                                value: result.getValue({ name: 'internalid', summary: search.Summary.GROUP })
                            })

                            closedInvList.setSublistValue({
                                id: 'custpage_invdate_ci',
                                line: lineNo,
                                value: result.getValue({ name: 'trandate', summary: search.Summary.GROUP })
                            })

                            closedInvList.setSublistValue({
                                id: 'custpage_invamount_ci',
                                line: lineNo,
                                value: result.getValue({ name: 'total', summary: search.Summary.SUM })
                            })

                            lineNo++

                            return true
                        })
                    }

                    try {
                        invArrFromCLI.forEach(function (invoiceId) {
                            var paymentRecord = ({
                                fromType: record.Type.INVOICE,
                                fromId: invoiceId,
                                toType: record.Type.CUSTOMER_PAYMENT
                            })

                            var paymentId = paymentRecord.save()

                            log.debug('payment created for the invoice ' + invoiceId + ' having payment id ' + paymentId)
                        })
                    } catch (e) {
                        log.debug('error occuring during payment creation : ', e)
                    }


                }

                form.clientScriptModulePath = 'SuiteScripts/MP_CLI_Q2.js';
                scriptContext.response.writePage(form)
            } else {

            }
        }

        return {
            onRequest: onRequest
        }

    })