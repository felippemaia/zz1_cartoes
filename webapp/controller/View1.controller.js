sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/Token',
    "sap/ui/model/json/JSONModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Token, JSONModel, jQuery, MessageBox, Filter, FilterOperator, ValueHelpDialog, Export, ExportTypeCSV) {
        "use strict";
        var serviceUrl = "/sap/opu/odata/sap/ZPP_KANBAN_CARD_SRV/",
            vm = null;
        return Controller.extend("zz1cartoes.controller.View1", {
            onInit: function () {
                var oMultiInputsMaterial = this.getView().byId("sMATNR");
                var oMultiInputsAufnr = this.getView().byId("sAUFNR");
                var oMultiInputsTpKan = this.getView().byId("sTPKANBAN");

                // add validator
                var fnValidatorMat = function (args) {
                    var text = args.text;
                    return new Token({ key: text, text: text });
                };
                var fnValidatorAufnr = function (args) {
                    var text = args.text;
                    return new Token({ key: text, text: text });
                };

                var fnValidator = function (args) {
                    var text = args.text;
                    return new Token({ key: text, text: text });
                };

                oMultiInputsMaterial.addValidator(fnValidatorMat);
                oMultiInputsAufnr.addValidator(fnValidatorAufnr);
                oMultiInputsTpKan.addValidator(fnValidator);

                var oModel = new sap.ui.model.odata.ODataModel(serviceUrl);
                var oView = this.getView();
                oView.setModel(oModel);
                var oData = {
                    "KanbanCollection": [
                        {
                            "Id": "HT-1001",
                            "Name": "Cartão atendimento a requisição"
                        },
                        {
                            "Id": "HT-1002",
                            "Name": "Cartão avulso"
                        },
                        {
                            "Id": "HT-1003",
                            "Name": "Cartão de retorno ao DMAT"
                        }
                    ]
                };

                // set explored app's demo model on this sample
                var oModelMock = new JSONModel(oData);
                this.getView().setModel(oModelMock, "mock");
                this._oTable = this.byId("idTable");

                this._oTPC = null;
                /* var oPersonalizationService = sap.ushell.Container.getService("Personalization");
                 var oPersonalizer = oPersonalizationService.getPersonalizer({
                     container: "zz1cartoes", // This key must be globally unique (use a key to
                     // identify the app) Note that only 40 characters are allowed
                     item: "itemidTable" // Maximum of 40 characters applies to this key as well
                 });
                 this._oTPC = new TablePersoController({
                     table: this.byId("idTable"),
                     //specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
                     componentName: "table",
                     persoService: oPersonalizer
                 }).activate();*/
            },
            onPersoButtonPressed: function (oEvent) {
                this._oTPC.openDialog();
                this._oTPC.attachPersonalizationsDone(this, this.onPerscoDonePressed.bind(this));
            },
            onPerscoDonePressed: function (oEvent) {
                this._oTPC.savePersonalizations();
            },
            onSearch: function () {
                vm = this;
                var oView = vm.getView();

                var campos = this.getView().getController().onValidaCampos();
                if (campos === 0) {
                    this._oTable.removeSelections();
                    var oAufnr = oView.byId("sAUFNR");
                    var _Aufnr = [];
                    vm._TokenData(_Aufnr, oAufnr, "sAUFNR");

                    var oMatnr = oView.byId("sMATNR");
                    var _Matnr = [];
                    vm._TokenData(_Matnr, oMatnr, "sMATNR");

                    var oTpKanban = oView.byId("sTPKANBAN");
                    var _TpKanban = [];
                    vm._TokenData(_TpKanban, oTpKanban, "sTPKANBAN");

                    //Process Data
                    // var oModel = new sap.ui.model.odata.ODataModel(serviceUrl, false);
                    //sap.ui.getCore().setModel(oModel);

                    var filters = [];
                    for (var i = 0; i < _Aufnr.length; i++) {
                        filters.push(new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.EQ, _Aufnr[i].padStart(12, "0")));
                    }

                    for (var i = 0; i < _Matnr.length; i++) {
                        filters.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, _Matnr[i].padStart(18, "0")));
                    }
                    if (this.getView().byId("sGSTRS").getValue() != "") {
                        var datesplit = this.getView().byId("sGSTRS").getValue().split(" - ");
                        var datetosplit = datesplit[0].split("/");
                        var dateto = datetosplit[2] + datetosplit[1] + datetosplit[0];
                        var datefromsplit = datesplit[1].split("/");
                        var datefrom = datefromsplit[2] + datefromsplit[1] + datefromsplit[0];
                        filters.push(new sap.ui.model.Filter("Gstrs", sap.ui.model.FilterOperator.BT, dateto, datefrom));
                    }
                    if (this.getView().byId("sWERKS").getValue() != "") {
                        filters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this.getView().byId("sWERKS").getValue()));
                    }
                    for (var i = 0; i < _TpKanban.length; i++) {
                        filters.push(new sap.ui.model.Filter("TpKanban", sap.ui.model.FilterOperator.EQ, _TpKanban[i]));
                    }
                    if (this.getView().byId("sSABOR").getValue() != "") {
                        filters.push(new sap.ui.model.Filter("Sabor", sap.ui.model.FilterOperator.EQ, this.getView().byId("sSABOR").getValue()));
                    }
                    if (this.getView().byId("sVSPVB").getValue() != "") {
                        filters.push(new sap.ui.model.Filter("Vspvb", sap.ui.model.FilterOperator.EQ, this.getView().byId("sVSPVB").getValue()));
                    }
                    if (this.getView().byId("sLGORT").getValue() != "") {
                        filters.push(new sap.ui.model.Filter("Lgort", sap.ui.model.FilterOperator.EQ, this.getView().byId("sLGORT").getValue()));
                    }
                    if (this.getView().byId("sStatus").getSelectedKey() != "") {
                        filters.push(new sap.ui.model.Filter("Stat", sap.ui.model.FilterOperator.EQ, this.getView().byId("sStatus").getSelectedKey()));
                    }

                    /*   if (this.getView().byId("sEmissor").getValue() != "") {
                           filters.push(new sap.ui.model.Filter("EmissorOrdem", sap.ui.model.FilterOperator.EQ, this.getView().byId("sEmissor").getValue().padStart(10, "0")));
                       }
                       if (this.getView().byId("sDtCriado").getValue() != "") {
                           var datesplit = this.getView().byId("sDtCriado").getValue().split(" - ");
                           var datetosplit = datesplit[0].split("/");
                           var dateto = datetosplit[2] + datetosplit[1] + datetosplit[0];
                           var datefromsplit = datesplit[1].split("/");
                           var datefrom = datefromsplit[2] + datefromsplit[1] + datefromsplit[0];
                           filters.push(new sap.ui.model.Filter("CriadoEm", sap.ui.model.FilterOperator.BT, dateto, datefrom));
                       }
                       if (this.getView().byId("sZzSafra").getValue() != "") {
                           filters.push(new sap.ui.model.Filter("Safra", sap.ui.model.FilterOperator.EQ, this.getView().byId("sZzSafra").getValue()));
                       }
                       if (this.getView().byId("sTipoSafra").getValue() != "") {
                           filters.push(new sap.ui.model.Filter("TpSafra", sap.ui.model.FilterOperator.EQ, this.getView().byId("sTipoSafra").getValue()));
                       }
                       if (this.getView().byId("sAgronomo").getValue() != "") {
                           filters.push(new sap.ui.model.Filter("Agronomo", sap.ui.model.FilterOperator.EQ, this.getView().byId("sAgronomo").getValue()));
                       }
                       if (this.getView().byId("sCultura").getValue() != "") {
                           filters.push(new sap.ui.model.Filter("Cultura", sap.ui.model.FilterOperator.EQ, this.getView().byId("sCultura").getValue()));
                       }*/
                    /*    oModel.read(
                            "OrdemVendaSet", {
                            filters: filters,
                            success: function (oData) {
                                var tbData = oView.byId("idTable");
                                tbData.setModel(new JSONModel({
                                    "results": oData.results
                                }));
                            },
                            error: function () {
                                MessageBox.show("Sorry, Connection Problem!", MessageBox.Icon.ERROR, "Technical Problem");
                            }
                        }
                        );*/
                    this._oTable.getBinding("items").filter(filters);
                } else {
                    sap.m.MessageBox.show(
                        "Por favor preencha todos os campos obrigatórios.",
                        sap.m.MessageBox.Icon.ERROR,
                        "Ocorreu um erro ao buscar dados"
                    );
                }
            },
            _TokenData: function (oArray, oField, oName) {
                vm = this;
                var oView = vm.getView();
                for (var i = 0, len = oField.getTokens().length; i < len; i++) {
                    oArray[i] = oField.getTokens()[i].getKey();
                }
                if (oArray === null || oArray === undefined || oArray.length < 1) {
                    if (oView.byId(oName)._lastValue !== "") {
                        oArray[0] = oView.byId(oName)._lastValue.toUpperCase();
                    }
                }
            },
            onBindPedido: function (oEvent) {
                var rowItems = this._oTable.getSelectedItems();
                if (rowItems.length > 0) {
                    for (var i = 0; i < rowItems.length; i++) {
                        var item = rowItems[i];

                        item.getCells()[0].setValue(this.getView().byId("iPedido").getValue());
                    }
                } else {
                    sap.m.MessageBox.show(
                        "Selecione ao menos uma linha para aplicar o valor digitado",
                        sap.m.MessageBox.Icon.ERROR,
                        "Ocorreu um erro"
                    );
                }
            },
            onSave: function (oEvent) {
                var rowAllItems = this._oTable.getItems();
                var error = false;
                var batchChanges = [];
                var oModel = this.getView().getModel();
                for (var i = 0; i < rowAllItems.length; i++) {
                    var item = rowAllItems[i];

                    if (item.getCells()[0].getValue() != "" && item.isSelected() == false) {
                        error = true;
                        break;
                    }
                }
                if (error == true) {
                    sap.m.MessageBox.show(
                        "Selecionar todas as linhas preenchidas antes de gravar",
                        sap.m.MessageBox.Icon.ERROR,
                        "Ocorreu um erro"
                    );
                    return;
                }
                var rowSelectedItems = this._oTable.getSelectedItems();
                if (rowSelectedItems.length > 0) {
                    for (var i = 0; i < rowSelectedItems.length; i++) {
                        var item = rowSelectedItems[i];
                        var cells = item.getCells();
                        if (cells[0].getValue() != "") {
                            var oEntry = {
                                Pedido: cells[0].getValue(),
                                Ordem: cells[1].getText(),
                                SALESORDERITEM: cells[3].getText(),
                                Material: cells[4].getTitle(),
                                Quantidade: cells[5].getText().trim(),
                                ORDERQUANTITYUNIT: cells[6].getText()
                            };
                            batchChanges.push(oModel.createBatchOperation("/OrdemVendaSet", "POST", oEntry));
                        }
                    }
                    if (batchChanges.length !== 0) {
                        oModel.addBatchChangeOperations(batchChanges);
                        var oGlobalBusyDialog = new sap.m.BusyDialog(); //PREPARA UM LOAD NA TELA
                        oGlobalBusyDialog.open();
                        //submit changes and refresh the table and display message
                        oModel.submitBatch(function (data) {
                            oModel.refresh();
                            oGlobalBusyDialog.close();
                            if (data.__batchResponses[0].__changeResponses) {
                                //MessageBox.confirm("Lançamento efetuado", {});
                                MessageBox.success("Dados gravados com sucesso!", {});
                            } else {
                                var errorObj1 = jQuery.parseXML(data.__batchResponses[0].response.body).querySelector("message");
                                sap.m.MessageBox.show(
                                    errorObj1.textContent,
                                    sap.m.MessageBox.Icon.ERROR,
                                    "Erro ao enviar os dados"
                                );
                            }
                        });
                    } else {
                        sap.m.MessageBox.show(
                            "Nenhuma linha selecionada tem o Nº do pedido preenchido",
                            sap.m.MessageBox.Icon.ERROR,
                            "Ocorreu um erro"
                        );
                    }
                } else {
                    sap.m.MessageBox.show(
                        "Selecione ao menos uma linha antes de gravar",
                        sap.m.MessageBox.Icon.ERROR,
                        "Ocorreu um erro"
                    );
                }

            },
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },
            _valueHelpRequest: function (oEvent, oOptions) {
                var oSettings = {
                    title: "",
                    key: "",
                    descriptionKey: "",
                    multiselect: true,
                    path: "",
                    cols: [],
                    filters: [],
                    ok: null
                };
                jQuery.extend(oSettings, oOptions);

                var oInput = oEvent.getSource(),
                    aTokens;

                if (oInput.getTokens) {
                    aTokens = oInput.getTokens();
                }
                var that = this;
                var oValueHelpDialog = new ValueHelpDialog({
                    basicSearchText: oInput.getValue(),
                    title: oSettings.title,
                    supportMultiselect: oSettings.multiselect,
                    supportRanges: oSettings.multiselect,
                    supportRangesOnly: oSettings.multiselect && !oSettings.path,
                    key: oSettings.key,
                    descriptionKey: oSettings.descriptionKey,
                    stretch: sap.ui.Device.system.phone,

                    ok: function (oControlEvent) {
                        aTokens = oControlEvent.getParameter("tokens");

                        if (oInput.setTokens) {
                            oInput.setValue(aTokens[0].getKey());
                        } else {
                            oInput.setValue(aTokens[0].getKey());
                        }

                        if (oSettings.ok) {
                            oSettings.ok(oControlEvent);
                        }

                        oValueHelpDialog.close();
                    },

                    cancel: function (oControlEvent) {
                        oValueHelpDialog.close();
                    },

                    afterClose: function () {
                        oValueHelpDialog.destroy();
                    }
                });

                oValueHelpDialog.setMaxExcludeRanges(0);
                oValueHelpDialog.setRangeKeyFields([{
                    label: oSettings.title,
                    key: oSettings.key
                }]);
                if (aTokens) {
                    oValueHelpDialog.setTokens(aTokens);
                }

                if (oSettings.path) {
                    var oTable = oValueHelpDialog.getTable(),
                        oColsModel = new sap.ui.model.json.JSONModel(),
                        oRowsModel = "";
                    if (oSettings.key == "Id") {
                        oRowsModel = this.getView().getModel("mock");
                    } else {
                        oRowsModel = this.getView().getModel();
                    }

                    oColsModel.setData({
                        cols: oSettings.cols
                    });
                    oTable.setModel(oColsModel, "columns");

                    oTable.setModel(oRowsModel);
                    if (oTable.bindRows) {
                        oTable.bindRows({
                            path: oSettings.path,
                            filters: oSettings.filters
                        });
                        oTable.setNoData(this.getResourceBundle().getText("noDataText"));
                    } else if (oTable.bindItems) {
                        oTable.bindItems({
                            path: oSettings.path,
                            filters: oSettings.filters,
                            factory: function (sId, oContext) {
                                var aCols = oTable.getModel("columns").getData().cols;

                                return new sap.m.ColumnListItem({
                                    cells: aCols.map(function (column) {
                                        var colname = column.template;
                                        return new sap.m.Label({
                                            text: "{" + colname + "}"
                                        });
                                    })
                                });
                            }
                        });
                        oTable.setNoDataText(this.getResourceBundle().getText("noDataText"));
                    }

                    var aFilterGroupItems = [];
                    for (var i = 0; i < oSettings.cols.length; i++) {
                        aFilterGroupItems.push(new sap.ui.comp.filterbar.FilterGroupItem({
                            groupName: "group",
                            name: oSettings.cols[i].label,
                            label: oSettings.cols[i].label,
                            control: new sap.m.Input()
                        }));
                    }

                    var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                        advancedMode: true,
                        filterBarExpanded: false,
                        showGoOnFB: !sap.ui.Device.system.phone,
                        filterGroupItems: aFilterGroupItems,
                        search: function (oControlEvent) {
                            var aSelections = oControlEvent.getParameters().selectionSet,
                                aFilters = [];
                            for (i = 0; i < aSelections.length; i++) {
                                var sValue = aSelections[i].getValue();
                                if (sValue) {
                                    aFilters.push(new Filter(oSettings.cols[i].template, FilterOperator.Contains, sValue));
                                }
                            }

                            if (oTable.bindRows) {
                                oTable.getBinding("rows").filter(aFilters);
                            } else {
                                oTable.getBinding("items").filter(aFilters);
                            }
                        }
                    });
                    if (oFilterBar.setBasicSearch) {
                        oFilterBar.setBasicSearch(new sap.m.SearchField({
                            showSearchButton: sap.ui.Device.system.phone,
                            placeholder: "Search",
                            visible: false,
                            search: function (event) {
                                oValueHelpDialog.getFilterBar().search();
                            }
                        }));
                    }
                    oValueHelpDialog.setFilterBar(oFilterBar);
                }

                if (oInput.$().closest(".sapUiSizeCompact").length > 0) {
                    oValueHelpDialog.addStyleClass("sapUiSizeCompact");
                } else {
                    oValueHelpDialog.addStyleClass("sapUiSizeCozy");
                }

                oValueHelpDialog.open();
                oValueHelpDialog.update();
            },
            onAufnrValueHelp: function (oEvent) {
                var aFilters = [],
                    oContext = oEvent.getSource().getBindingContext();
                //sVbeln = oContext.getProperty("Vbeln");
                //aFilters.push(new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sVbeln));

                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblAUFNR"),
                    key: "Aufnr",
                    descriptionKey: "Aufnr",
                    multiselect: true,
                    path: "/OrdemHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblAUFNR"),
                        template: "Aufnr"
                    }]//,
                    //filters: aFilters
                })
            },
            onMatnrValueHelp: function (oEvent) {
                var aFilters = [],
                    oContext = oEvent.getSource().getBindingContext();
                //sVbeln = oContext.getProperty("Vbeln");
                //aFilters.push(new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sVbeln));

                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblMaterial"),
                    key: "Matnr",
                    descriptionKey: "Maktx",
                    multiselect: true,
                    path: "/MaterialHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblMaterial"),
                        template: "Matnr"
                    }, {
                        label: this.getResourceBundle().getText("lblMATNR"),
                        template: "Maktx"
                    }]//,
                    //filters: aFilters
                })
            },
            onMatnrSingleValueHelp: function (oEvent) {
                var aFilters = [],
                    oContext = oEvent.getSource().getBindingContext();
                //sVbeln = oContext.getProperty("Vbeln");
                //aFilters.push(new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sVbeln));

                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblMaterial"),
                    key: "Matnr",
                    descriptionKey: "Maktx",
                    multiselect: false,
                    path: "/MaterialHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblMaterial"),
                        template: "Matnr"
                    }, {
                        label: this.getResourceBundle().getText("lblMATNR"),
                        template: "Maktx"
                    }]//,
                    //filters: aFilters
                })
            },
            onWerksValueHelp: function (oEvent) {
                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblWERKS"),
                    key: "Werks",
                    descriptionKey: "Name1",
                    multiselect: false,
                    path: "/CentroHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblWERKS"),
                        template: "Werks"
                    }, {
                        label: this.getResourceBundle().getText("lblWERKSDESC"),
                        template: "Name1"
                    }]
                })
            },
            onSaborValueHelp: function (oEvent) {
                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblSABOR"),
                    key: "Atzhl",
                    descriptionKey: "Atwrt",
                    multiselect: false,
                    path: "/SaborHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblSABOR"),
                        template: "Atzhl"
                    }, {
                        label: this.getResourceBundle().getText("lblSABORdesc"),
                        template: "Atwrt"
                    }]
                })
            },
            onKanbanValueHelp: function (oEvent) {
                var aFilters = [],
                    oContext = oEvent.getSource().getBindingContext();
                //sVbeln = oContext.getProperty("Vbeln");
                //aFilters.push(new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sVbeln));

                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblTPKANBAN"),
                    key: "Id",
                    descriptionKey: "Name",
                    multiselect: false,
                    path: "/KanbanCollection",
                    cols: [{
                        label: this.getResourceBundle().getText("lblTPKANBAN"),
                        template: "Id"
                    }, {
                        label: "Descrição",
                        template: "Name"
                    }]//,
                    //filters: aFilters
                })
            },
            onPrvbeValueHelp: function (oEvent) {
                var aFilters = [];
                aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this.getView().byId("sWERKS").getValue()));
                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblVSPVB"),
                    key: "Prvbe",
                    multiselect: false,
                    path: "/FabricaHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblVSPVB"),
                        template: "Prvbe"
                    }],
                    filters: aFilters
                })
            },
            onLgortDialogValueHelp: function (oEvent) {
                var aFilters = [];
                aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, 
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iWerks").getValue()));    
                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblLGORT"),
                    key: "Lgort",
                    descriptionKey: "Lgobe",
                    multiselect: false,
                    path: "/DepositoHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblLGORT"),
                        template: "Lgort"
                    }, {
                        label: this.getResourceBundle().getText("lblLGORTDESC"),
                        template: "Lgobe"
                    }],
                    filters: aFilters
                })
            },
            onLgortValueHelp: function (oEvent) {
                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblLGORT"),
                    key: "Lgort",
                    descriptionKey: "Lgobe",
                    multiselect: false,
                    path: "/DepositoHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblLGORT"),
                        template: "Lgort"
                    }, {
                        label: this.getResourceBundle().getText("lblLGORTDESC"),
                        template: "Lgobe"
                    }]
                })
            },
            onExport: function (oEvent) {
                var table = this.oView.byId("idTable");
                var oBinding = table.getBinding("items");
                var oExport = new Export({

                    // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                    exportType: new ExportTypeCSV({
                        separatorChar: ";"
                    }),

                    // Pass in the model created above
                    models: table.getModel(),

                    // binding information for the rows aggregation
                    rows: {
                        path: "/ProductionOrderSet",
                        filters: oBinding.aFilters
                    },

                    // column definitions with column name and binding info for the content
                    columns: [{
                        name: this.getResourceBundle().getText("lblWERKS"),
                        template: {
                            content: "{Werks}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblAUFNR"),
                        template: {
                            content: "{Aufnr}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblReserva"),
                        template: {
                            content: "{Rsnum}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblMATNR"),
                        template: {
                            content: "{Matnr}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblDescMatnr"),
                        template: {
                            content: "{Maktx}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblLGORT"),
                        template: {
                            content: "{Lgobe}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblArea"),
                        template: {
                            content: "{Vspvb}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblDtNesc"),
                        template: {
                            content: "{Bdter}"
                        }
                    }]
                });

                // download exported file
                oExport.saveFile().catch(function (oError) {
                    MessageBox.error("Not supported Browser!\n\n" + oError);
                }).then(function () {
                    oExport.destroy();
                });
            },
            _onTableCreate: function (oEvent) {

                // var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
                var oObject = this.byId("idTable").getSelectedItem().getBindingContext().getObject();
                // var oObject;
                var oComponent = this.getOwnerComponent();
                oComponent.setModel(new JSONModel(oObject), "detailData");
                this.getRouter().navTo("View2");
            },
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            onNavView4: function (oEvent) {

                var campos = this.getView().getController().onValidaCamposCComp();
                if (campos === 0) {
                    var oObject = new Object();
                    oObject.iWerks = sap.ui.core.Fragment.byId("aDialogCComplementar", "iWerks").getValue();
                    oObject.iMatnr = sap.ui.core.Fragment.byId("aDialogCComplementar", "iMatnr").getValue();
                    oObject.iDep = sap.ui.core.Fragment.byId("aDialogCComplementar", "iDep").getValue();
                    oObject.iArea = sap.ui.core.Fragment.byId("aDialogCComplementar", "iArea").getSelectedItem().getText();
                    var oComponent = this.getOwnerComponent();
                    oComponent.setModel(new JSONModel(oObject), "detailDataView4");
                    this.getRouter().navTo("View4");
                } else {
                    sap.m.MessageBox.show(
                        "É necessário preencher todos os campos obrigatórios",
                        sap.m.MessageBox.Icon.ERROR,
                        "Erro ao incluir registro"
                    );

                }
            },
            onValidaCamposCComp: function () {
                var retorno = 0;
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iWerks").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iMatnr").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iDep").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iWerks").setValueStateText("");
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iMatnr").setValueStateText("");
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iDep").setValueState("None");
                if (sap.ui.core.Fragment.byId("aDialogCComplementar", "iWerks").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogCComplementar", "iWerks").setValueState("Error");
                    sap.ui.core.Fragment.byId("aDialogCComplementar", "iWerks").setValueStateText("Campo obrigatório");
                    retorno = 1;
                }
                if (sap.ui.core.Fragment.byId("aDialogCComplementar", "iMatnr").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogCComplementar", "iMatnr").setValueState("Error");
                    sap.ui.core.Fragment.byId("aDialogCComplementar", "iMatnr").setValueStateText("Campo obrigatório");
                    retorno = 1;
                }
                if (sap.ui.core.Fragment.byId("aDialogCComplementar", "iDep").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogCComplementar", "iDep").setValueState("Error");
                    sap.ui.core.Fragment.byId("aDialogCComplementar", "iDep").setValueStateText("Campo obrigatório");
                    retorno = 1;
                }
                return retorno;
            },
            onValidaCampos: function () {
                var retorno = 0;
                this.getView().byId("sGSTRS").setValueState("None");
                this.getView().byId("sWERKS").setValueState("None");
                this.getView().byId("sTPKANBAN").setValueState("None");
                this.getView().byId("sStatus").setValueState("None");
                this.getView().byId("sGSTRS").setValueStateText("");
                this.getView().byId("sWERKS").setValueStateText("");
                this.getView().byId("sTPKANBAN").setValueStateText("");
                this.getView().byId("sStatus").setValueStateText("");
                if(this.getView().byId("_IDGenFilterItem9").getVisibleInFilterBar()){
                    if (this.getView().byId("sStatus").getSelectedKey() === "") {
                        this.getView().byId("sStatus").setValueState("Error");
                        this.getView().byId("sStatus").setValueStateText("Campo obrigatório");
                        retorno = 1;
                    }
                }
                if (this.getView().byId("_IDGenFilterItem3").getVisibleInFilterBar()) {
                    if (this.getView().byId("sGSTRS").getValue() === "" && this.getView().byId("sAUFNR").getTokens().length === 0) {
                        this.getView().byId("sGSTRS").setValueState("Error");
                        this.getView().byId("sGSTRS").setValueStateText("Campo obrigatório");
                        retorno = 1;
                    }
                }
                if (this.getView().byId("sWERKS").getValue() === "") {
                    this.getView().byId("sWERKS").setValueState("Error");
                    this.getView().byId("sWERKS").setValueStateText("Campo obrigatório");
                    retorno = 1;
                }

                var oTpKanban = this.getView().byId("sTPKANBAN");
                var _TpKanban = [];
                vm._TokenData(_TpKanban, oTpKanban, "sTPKANBAN");
                if (_TpKanban.length === 0) {
                    this.getView().byId("sTPKANBAN").setValueState("Error");
                    this.getView().byId("sTPKANBAN").setValueStateText("Campo obrigatório");
                    retorno = 1;
                }

                return retorno;
            },
            onChangeTp: function (oEvent) {
                var text = "";
                var found = false;
                var oTpKanban = this.getView().byId("sTPKANBAN");
                var _TpKanban = [];
                this._TokenData(_TpKanban, oTpKanban, "sTPKANBAN");
                for (var i = 0; i < _TpKanban.length; i++) {
                    text = _TpKanban[i];
                    if (text == "HT-1001") {
                        found = true;
                        break;
                    }
                }
                if (oEvent.mParameters.removedTokens.length > 0) {
                    for (var i = 0; i < oEvent.mParameters.removedTokens.length; i++) {
                        text = oEvent.mParameters.removedTokens[i].getText();
                        if (text == "HT-1001") {
                            found = false;
                            break;
                        }
                    }
                }
                if (found) {
                    //this.getView().byId("_IDGenFilterItem3").setVisible(true);
                    //this.getView().byId("_IDGenFilterItem9").setVisible(true);
                    this.getView().byId("_IDGenFilterItem3").setVisibleInFilterBar(true);                   
                    this.getView().byId("_IDGenFilterItem9").setVisibleInFilterBar(true);
                } else {
                    //this.getView().byId("_IDGenFilterItem3").setVisible(false);
                    //this.getView().byId("_IDGenFilterItem9").setVisible(false);
                    this.getView().byId("_IDGenFilterItem3").setVisibleInFilterBar(false);                   
                    this.getView().byId("_IDGenFilterItem9").setVisibleInFilterBar(false);
                }
            },
            accessFragmentCCComplementar: function (oEvent) {

                if (!this.DialogCComplementar) {
                    this.DialogCComplementar = this.DialogCComplementar = sap.ui.xmlfragment(
                        "aDialogCComplementar",
                        "zz1cartoes.view.DialogCComplementar",
                        this
                    );

                    //to get access to the global model
                    this.getView().addDependent(this.DialogCComplementar);
                }
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iMatnr").setValueState("None");
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iWerks").setValueState("None");
                //sap.ui.core.Fragment.byId("aDialogCComplementar", "iCartaoUnico").setSelectedKey("false");
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iMatnr").setValue("");
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iWerks").setValue("");
                sap.ui.core.Fragment.byId("aDialogCComplementar", "iDep").setValue("");
                this.DialogCComplementar.open();

            },
            DialogComplementar_Cancel: function () {

                this.DialogCComplementar.close();

            },
            onNavView5: function (oEvent) {

                var campos = this.getView().getController().onValidaCamposDev();
                if (campos === 0) {
                    var oObject = new Object();
                    oObject.iWerks = sap.ui.core.Fragment.byId("aDialogCDev", "iWerks").getValue();
                    oObject.iArea = sap.ui.core.Fragment.byId("aDialogCDev", "iArea").getSelectedItem().getText();
                    var oComponent = this.getOwnerComponent();
                    oComponent.setModel(new JSONModel(oObject), "detailDataView5");
                    this.getRouter().navTo("View5");
                } else {
                    sap.m.MessageBox.show(
                        "É necessário preencher todos os campos obrigatórios",
                        sap.m.MessageBox.Icon.ERROR,
                        "Erro ao incluir registro"
                    );

                }
            },
            onValidaCamposDev: function () {
                var retorno = 0;
                if (sap.ui.core.Fragment.byId("aDialogCDev", "iWerks").getValue() === "") {
                    sap.ui.core.Fragment.byId("aDialogCDev", "iWerks").setValueState("Error");
                    retorno = 1;
                }
                if (sap.ui.core.Fragment.byId("aDialogCDev", "iArea").getSelectedKey() === "") {
                    sap.ui.core.Fragment.byId("aDialogCDev", "iArea").setValueState("Error");
                    retorno = 1;
                }

                return retorno;
            },
            accessFragmentCDev: function (oEvent) {

                if (!this.DialogCDev) {
                    this.DialogCDev = this.DialogCDev = sap.ui.xmlfragment(
                        "aDialogCDev",
                        "zz1cartoes.view.DialogCDev",
                        this
                    );

                    //to get access to the global model
                    this.getView().addDependent(this.DialogCDev);
                }
                sap.ui.core.Fragment.byId("aDialogCDev", "iWerks").setValueState("None");
                //sap.ui.core.Fragment.byId("aDialogCComplementar", "iCartaoUnico").setSelectedKey("false");       
                sap.ui.core.Fragment.byId("aDialogCDev", "iWerks").setValue("");
                this.DialogCDev.open();

            },
            DialogDevolucao_Cancel: function () {

                this.DialogCDev.close();

            }
        });
    });
